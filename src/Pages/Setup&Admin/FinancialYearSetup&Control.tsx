import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_AddEditData, Fn_DisplayData } from "../../store/Functions";
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
    Status: string;
    AutoFreezeAfterAudit: string;
    InterestProvisionFrequency: string;
}

const initialValues: FormValues = {
    FinancialYearName: "",
    StartDate: "",
    EndDate: "",
    Status: "Active",
    AutoFreezeAfterAudit: "Yes",
    InterestProvisionFrequency: "Monthly",
};

interface FinancialYearState {
    id: number;
    formData: Partial<FormValues>;
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

    const isEditMode = fyState.id > 0;

    // TODO: Verify exact API endpoint URL formats
    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/FinancialYearMaster/Id`;
    const API_URL_SAVE = `FinancialYearMaster/0/token`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                FinancialYearName: Yup.string().trim().required("Financial Year Name is required"),
                StartDate: Yup.date().required("Start Date is required"),
                EndDate: Yup.date().min(
                    Yup.ref('StartDate'),
                    "End Date must be after Start Date"
                ).required("End Date is required"),
                Status: Yup.string().trim().required("Status is required"),
                AutoFreezeAfterAudit: Yup.string().trim(),
                InterestProvisionFrequency: Yup.string().trim(),
            }),
        []
    );

    useEffect(() => {
        nameRef.current?.focus();
    }, []);

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
        FinancialYearName: toStringOrEmpty(fyState.formData.FinancialYearName),
        StartDate: toStringOrEmpty(fyState.formData.StartDate),
        EndDate: toStringOrEmpty(fyState.formData.EndDate),
        Status: toStringOrEmpty(fyState.formData.Status) || "Active",
        AutoFreezeAfterAudit: toStringOrEmpty(fyState.formData.AutoFreezeAfterAudit) || "Yes",
        InterestProvisionFrequency: toStringOrEmpty(fyState.formData.InterestProvisionFrequency) || "Monthly",
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Id", String(fyState.id ?? 0));
            formData.append("FinancialYearName", values.FinancialYearName || "");
            formData.append("StartDate", values.StartDate || "");
            formData.append("EndDate", values.EndDate || "");
            formData.append("Status", values.Status || "");
            formData.append("AutoFreezeAfterAudit", values.AutoFreezeAfterAudit || "Yes");
            formData.append("InterestProvisionFrequency", values.InterestProvisionFrequency || "Monthly");

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            formData.append("UserId", currentUser?.uid ?? currentUser?.id ?? "0");

            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder callback
                { arguList: { id: fyState.id, formData } },
                API_URL_SAVE,
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

    const HelperText = ({ text }: { text: string }) => (
        <div className="text-muted small mt-1" style={{ fontSize: "0.80rem" }}>
            <i className="fa fa-thumb-tack text-danger me-1"></i> {text}
        </div>
    );

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
                                            <Row className="gy-2">
                                                <Col md="6">
                                                    <FormGroup>
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
                                                        <HelperText text="Displayed in all reports, GL entries" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
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
                                                        <HelperText text="Typically April 1 for Indian companies. All transactions from this date" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
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
                                                        <HelperText text="Typically March 31. Transactions after this date go to next FY" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Status <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="Status"
                                                            value={values.Status}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.Status && !!errors.Status}
                                                        >
                                                            <option value="Active">Active</option>
                                                            <option value="Closed">Closed</option>
                                                            <option value="Future (Pre-created)">Future (Pre-created)</option>
                                                        </Input>
                                                        <ErrorMessage name="Status" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Only Active FY allows new transactions" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
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
                                                        <HelperText text="After freeze: No edit/delete allowed, only view. Prevents data tampering." />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
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
                                                            <option value="Monthly">Monthly</option>
                                                            <option value="Quarterly">Quarterly</option>
                                                            <option value="Yearly">Yearly</option>
                                                        </Input>
                                                        <ErrorMessage name="InterestProvisionFrequency" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used when schemes have 'Interest on Tenure End' — provisions are made periodically" />
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
