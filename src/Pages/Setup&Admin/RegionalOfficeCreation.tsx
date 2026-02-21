import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_FillListData, Fn_AddEditData, Fn_DisplayData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import * as Yup from "yup";
import { Card, CardBody, CardFooter, Col, Container, FormGroup, Input, Label, Row } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Btn } from "../../AbstractElements";

interface FormValues {
    RegionalOfficeName: string;
    RegionCode: string;
    ReportingHO: string;
    RegionManagerName: string;
    OfficeAddress: string;
    ContactNumber: string;
    Email: string;
    Status: string;
}

const initialValues: FormValues = {
    RegionalOfficeName: "",
    RegionCode: "",
    ReportingHO: "",
    RegionManagerName: "",
    OfficeAddress: "",
    ContactNumber: "",
    Email: "",
    Status: "Active",
};

interface DropdownState {
    headOffices: Array<{ Id?: number; Name?: string }>;
}

interface ROState {
    id: number;
    formData: Partial<FormValues>;
    isProgress?: boolean;
}

const RegionalOfficeCreation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const roNameRef = useRef<HTMLInputElement | null>(null);

    const [roState, setRoState] = useState<ROState>({
        id: 0,
        formData: { ...initialValues },
        isProgress: false,
    });

    const [dropdowns, setDropdowns] = useState<DropdownState>({
        headOffices: [],
    });

    const isEditMode = roState.id > 0;

    // TODO: Confirm correct API URL for getting head offices list - using a placeholder for now
    const HO_API_URL = `${API_WEB_URLS.MASTER}/0/token/HeadOfficeMaster/Id/0`;
    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/RegionalOfficeMaster/Id`;
    const API_URL_SAVE = `RegionalOfficeMaster/0/token`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                RegionalOfficeName: Yup.string().trim().required("Regional Office Name is required"),
                RegionCode: Yup.string().trim().required("Region Code is required"),
                ReportingHO: Yup.string().trim().required("Reporting Head Office is required"),
                RegionManagerName: Yup.string().trim(),
                OfficeAddress: Yup.string().trim().required("Office Address is required"),
                ContactNumber: Yup.string().trim().required("Contact Number is required"),
                Email: Yup.string().trim().email("Invalid email format").required("Email is required"),
                Status: Yup.string().trim().required("Status is required"),
            }),
        []
    );

    useEffect(() => {
        roNameRef.current?.focus();
    }, []);

    useEffect(() => {
        Fn_FillListData(dispatch, setDropdowns, "headOffices", HO_API_URL)
            .catch((err) => console.error("Failed to fetch head offices:", err));
    }, [dispatch, HO_API_URL]);

    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;

        if (recordId > 0) {
            setRoState((prev) => ({
                ...prev,
                id: recordId,
            }));
            Fn_DisplayData(dispatch, setRoState, recordId, API_URL_EDIT);
        } else {
            setRoState((prev) => ({
                ...prev,
                id: 0,
                formData: { ...initialValues },
            }));
        }
    }, [dispatch, location.state, API_URL_EDIT]);

    const toStringOrEmpty = (value: unknown) => (value !== undefined && value !== null ? String(value) : "");

    const initialFormValues: FormValues = {
        ...initialValues,
        RegionalOfficeName: toStringOrEmpty(roState.formData.RegionalOfficeName),
        RegionCode: toStringOrEmpty(roState.formData.RegionCode),
        ReportingHO: toStringOrEmpty(roState.formData.ReportingHO),
        RegionManagerName: toStringOrEmpty(roState.formData.RegionManagerName),
        OfficeAddress: toStringOrEmpty(roState.formData.OfficeAddress),
        ContactNumber: toStringOrEmpty(roState.formData.ContactNumber),
        Email: toStringOrEmpty(roState.formData.Email),
        Status: toStringOrEmpty(roState.formData.Status) || "Active",
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Id", String(roState.id ?? 0));
            formData.append("RegionalOfficeName", values.RegionalOfficeName || "");
            formData.append("RegionCode", values.RegionCode || "");
            formData.append("ReportingHO", values.ReportingHO || "");
            formData.append("RegionManagerName", values.RegionManagerName || "");
            formData.append("OfficeAddress", values.OfficeAddress || "");
            formData.append("ContactNumber", values.ContactNumber || "");
            formData.append("Email", values.Email || "");
            formData.append("Status", values.Status || "");

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            formData.append("UserId", currentUser?.uid ?? currentUser?.id ?? "0");

            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder callback
                { arguList: { id: roState.id, formData } },
                API_URL_SAVE,
                true,
                "memberid",
                navigate,
                "/regionalOfficeCreation"
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
            <Breadcrumbs mainTitle="Regional Office Creation" parent="Setup & Admin" />
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
                                        <CardHeaderCommon title={`${isEditMode ? "Edit" : "Add"} Regional Office`} tagClass="card-title mb-0" />
                                        <CardBody>
                                            <Row className="gy-2">
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Regional Office Name <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="RegionalOfficeName"
                                                            placeholder="e.g. North Zone Office"
                                                            value={values.RegionalOfficeName}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.RegionalOfficeName && !!errors.RegionalOfficeName}
                                                            innerRef={roNameRef}
                                                        />
                                                        <ErrorMessage name="RegionalOfficeName" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Branch hierarchy display, regional MIS reports" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Region Code <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="RegionCode"
                                                            placeholder="e.g. NZ01"
                                                            value={values.RegionCode}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.RegionCode && !!errors.RegionCode}
                                                        />
                                                        <ErrorMessage name="RegionCode" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Auto-generating Branch codes (NZ01BR001)" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Reporting Head Office <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="ReportingHO"
                                                            value={values.ReportingHO}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.ReportingHO && !!errors.ReportingHO}
                                                        >
                                                            <option value="">-- Select Head Office --</option>
                                                            {/* Add mock option for testing design until API is integrated */}
                                                            {/* {dropdowns.headOffices.length === 0 && <option value="HO001">ABC Finance Pvt. Ltd. (HO001)</option>} */}
                                                            {dropdowns.headOffices.map((hoOption) => (
                                                                <option key={hoOption?.Id} value={hoOption?.Id ?? ""}>
                                                                    {hoOption?.Name || `HO ${hoOption?.Id ?? ""}`}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="ReportingHO" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Links Region to HO; FK: HO_ID" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Region Manager Name
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="RegionManagerName"
                                                            placeholder="Enter manager name"
                                                            value={values.RegionManagerName}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.RegionManagerName && !!errors.RegionManagerName}
                                                        />
                                                        <ErrorMessage name="RegionManagerName" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Regional reports, escalation matrix" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="12">
                                                    <FormGroup>
                                                        <Label>
                                                            Office Address <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="textarea"
                                                            name="OfficeAddress"
                                                            rows={2}
                                                            placeholder="Regional office full address"
                                                            value={values.OfficeAddress}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.OfficeAddress && !!errors.OfficeAddress}
                                                        />
                                                        <ErrorMessage name="OfficeAddress" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Regional reports header" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Contact Number <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="ContactNumber"
                                                            placeholder="+91-9876543210"
                                                            value={values.ContactNumber}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.ContactNumber && !!errors.ContactNumber}
                                                        />
                                                        <ErrorMessage name="ContactNumber" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Escalation notifications" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Email <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="email"
                                                            name="Email"
                                                            placeholder="north@abcfinance.com"
                                                            value={values.Email}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.Email && !!errors.Email}
                                                        />
                                                        <ErrorMessage name="Email" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: MIS email delivery" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Status
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
                                                            <option value="Inactive">Inactive</option>
                                                        </Input>
                                                        <ErrorMessage name="Status" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Inactive region: no new branches can be created under it" />
                                                    </FormGroup>
                                                </Col>

                                            </Row>
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="primary" type="submit" disabled={isSubmitting}>
                                                <i className="fa fa-plus me-1"></i> {isEditMode ? "Update Regional Office" : "Create Regional Office"}
                                            </Btn>
                                            <Btn color="light" type="button" className="text-dark">
                                                <i className="fa fa-pencil me-1"></i> Edit
                                            </Btn>
                                            <Btn color="danger" type="button">
                                                <i className="fa fa-minus-circle me-1"></i> Deactivate
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

export default RegionalOfficeCreation;
