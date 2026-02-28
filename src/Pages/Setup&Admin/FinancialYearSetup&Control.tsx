import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_AddEditData, Fn_DisplayData, Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import * as Yup from "yup";
import { Card, CardBody, CardFooter, Col, Container, FormGroup, Input, Label, Row } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";

interface FormValues {
    FinancialYearName: string;
    StartDate: string;
    EndDate: string;
    AutoFreezeAfterAudit: string;
    InterestProvisionFrequency: string;
}

const initialValues: FormValues = {
    FinancialYearName: "",
    StartDate: "",
    EndDate: "",
    AutoFreezeAfterAudit: "Yes",
    InterestProvisionFrequency: "",
};

interface DropdownsState {
    frequencies: any[];
}

interface FinancialYearState {
    id: number;
    formData: Partial<FormValues> & {
        Name?: string;
        F_Periodicity?: number | string;
        IsFreezeAfterAudit?: boolean;
    };
    isProgress?: boolean;
}

const FinancialYearSetupControl = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const nameRef = useRef<HTMLInputElement | null>(null);

    const [fyState, setFyState] = useState<FinancialYearState>({
        id: 0,
        formData: { ...initialValues },
        isProgress: false,
    });

    const [dropdowns, setDropdowns] = useState<DropdownsState>({
        frequencies: [],
    });

    const isEditMode = fyState.id > 0;

    // TODO: Verify exact API endpoint URL formats
    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/FinancialYearMasterEdit/Id`;
    const PERIODICITY_API_URL = `${API_WEB_URLS.MASTER}/0/token/Periodicity/Id/0`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                FinancialYearName: Yup.string().trim().required("Financial Year Name is required"),
                StartDate: Yup.date().required("Start Date is required"),
                EndDate: Yup.date().min(
                    Yup.ref('StartDate'),
                    "End Date must be after Start Date"
                ).required("End Date is required"),
                AutoFreezeAfterAudit: Yup.string().trim(),
                InterestProvisionFrequency: Yup.string().trim(),
            }),
        []
    );

    useEffect(() => {
        nameRef.current?.focus();
        Fn_FillListData(dispatch, setDropdowns, "frequencies", PERIODICITY_API_URL)
            .catch((err: any) => console.error("Failed to load periodicity:", err));
    }, [dispatch, PERIODICITY_API_URL]);

    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;

        if (recordId > 0) {
            setFyState((prev) => ({
                ...prev,
                id: recordId,
            }));
            Fn_DisplayData(dispatch, setFyState, recordId, API_URL_EDIT);
        } else {
            setFyState((prev) => ({
                ...prev,
                id: 0,
                formData: { ...initialValues },
            }));
        }
    }, [dispatch, location.state, API_URL_EDIT]);

    const toStringOrEmpty = (value: unknown) => (value !== undefined && value !== null ? String(value) : "");

    const initialFormValues: FormValues = {
        ...initialValues,
        FinancialYearName: toStringOrEmpty(fyState.formData.Name || fyState.formData.FinancialYearName),
        StartDate: toStringOrEmpty(fyState.formData.StartDate).split("T")[0],
        EndDate: toStringOrEmpty(fyState.formData.EndDate).split("T")[0],
        AutoFreezeAfterAudit: fyState.formData.IsFreezeAfterAudit === true ? "Yes" :
            fyState.formData.IsFreezeAfterAudit === false ? "No" :
                (toStringOrEmpty(fyState.formData.AutoFreezeAfterAudit) || "Yes"),
        InterestProvisionFrequency: toStringOrEmpty(fyState.formData.F_Periodicity || fyState.formData.InterestProvisionFrequency),
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Id", String(fyState.id ?? 0));
            formData.append("Name", values.FinancialYearName || "");
            formData.append("StartDate", values.StartDate || "");
            formData.append("EndDate", values.EndDate || "");
            formData.append("IsFreezeAfterAudit", values.AutoFreezeAfterAudit === "Yes" ? "true" : "false");
            formData.append("F_Periodicity", values.InterestProvisionFrequency || "");

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            const userId = currentUser?.uid ?? currentUser?.id ?? "0";
            formData.append("UserId", userId);

            const currentApiUrlSave = `FinancialYear/${userId}/token`;

            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder callback
                { arguList: { id: fyState.id, formData } },
                currentApiUrlSave,
                true,
                "memberid",
                navigate,
                "/financialYearSetup"
            );

        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Financial Year Setup & Control" parent="Setup & Admin" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<FormValues>
                            initialValues={initialFormValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleChange, handleBlur, errors, touched, isSubmitting }: FormikProps<FormValues>) => (
                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                    <Card>
                                        <CardBody>
                                            <Row className="gy-0">
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Financial Year Name <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="FinancialYearName"
                                                            placeholder="e.g. FY 2024-25"
                                                            value={values.FinancialYearName}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.FinancialYearName && !!errors.FinancialYearName}
                                                            innerRef={nameRef}
                                                        />
                                                        <ErrorMessage name="FinancialYearName" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Start Date <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="date"
                                                            name="StartDate"
                                                            value={values.StartDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.StartDate && !!errors.StartDate}
                                                        />
                                                        <ErrorMessage name="StartDate" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            End Date <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="date"
                                                            name="EndDate"
                                                            value={values.EndDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.EndDate && !!errors.EndDate}
                                                        />
                                                        <ErrorMessage name="EndDate" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Auto-Freeze After Audit?
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="AutoFreezeAfterAudit"
                                                            value={values.AutoFreezeAfterAudit}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.AutoFreezeAfterAudit && !!errors.AutoFreezeAfterAudit}
                                                        >
                                                            <option value="Yes">Yes - Freeze data after Audit</option>
                                                            <option value="No">No - Allow manual override</option>
                                                        </Input>
                                                        <ErrorMessage name="AutoFreezeAfterAudit" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Interest Provision Frequency
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="InterestProvisionFrequency"
                                                            value={values.InterestProvisionFrequency}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.InterestProvisionFrequency && !!errors.InterestProvisionFrequency}
                                                        >
                                                            <option value="">-- Select Frequency --</option>
                                                            {dropdowns.frequencies.map((freq) => (
                                                                <option key={freq.Id} value={freq.Id}>
                                                                    {freq.Name}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="InterestProvisionFrequency" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="primary" type="submit" disabled={isSubmitting}>
                                                <i className="fa fa-calendar-plus-o me-1"></i> {isEditMode ? "Update Financial Year" : "Create Financial Year"}
                                            </Btn>
                                            <Btn color="warning" type="button" className="text-white">
                                                <i className="fa fa-exchange me-1"></i> Change Active FY
                                            </Btn>
                                            <Btn color="danger" type="button">
                                                <i className="fa fa-lock me-1"></i> Close & Lock FY
                                            </Btn>
                                            <Btn color="light" type="button" className="text-primary border">
                                                <i className="fa fa-snowflake-o me-1 text-primary"></i> Freeze After Audit
                                            </Btn>
                                        </CardFooter>
                                    </Card>
                                </Form>
                            )}
                        </Formik>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default FinancialYearSetupControl;
