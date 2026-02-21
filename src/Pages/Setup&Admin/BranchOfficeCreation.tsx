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
    BranchName: string;
    BranchCode: string;
    ReportingRegion: string;
    IFSCCode: string;
    BranchManagerName: string;
    BranchOpeningDate: string;
    CashLimit: string;
    OpeningCashBalance: string;
    BranchAddress: string;
    F_CityMaster: string;
    F_StateMaster: string;
    ContactNumber: string;
    Email: string;
}

const initialValues: FormValues = {
    BranchName: "",
    BranchCode: "",
    ReportingRegion: "",
    IFSCCode: "",
    BranchManagerName: "",
    BranchOpeningDate: "",
    CashLimit: "",
    OpeningCashBalance: "0",
    BranchAddress: "",
    F_CityMaster: "",
    F_StateMaster: "",
    ContactNumber: "",
    Email: "",
};

interface DropdownState {
    regions: Array<{ Id?: number; Name?: string }>;
    states: Array<{ Id?: number; Name?: string }>;
    cities: Array<{ Id?: number; Name?: string }>;
}

interface BOState {
    id: number;
    formData: Partial<FormValues>;
    isProgress?: boolean;
}

const BranchOfficeCreation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const branchNameRef = useRef<HTMLInputElement | null>(null);

    const [boState, setBoState] = useState<BOState>({
        id: 0,
        formData: { ...initialValues },
        isProgress: false,
    });

    const [dropdowns, setDropdowns] = useState<DropdownState>({
        regions: [],
        states: [],
        cities: [],
    });

    const isEditMode = boState.id > 0;

    // TODO: Confirm correct API URL for regions
    const REGION_API_URL = `${API_WEB_URLS.MASTER}/0/token/RegionalOfficeMaster/Id/0`;
    const STATE_API_URL = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.StateMaster}/Id/0`;
    const CITY_API_URL = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.CityMaster}/Id/0`;

    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/BranchOfficeMaster/Id`;
    const API_URL_SAVE = `BranchOfficeMaster/0/token`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                BranchName: Yup.string().trim().required("Branch Name is required"),
                BranchCode: Yup.string().trim().required("Branch Code is required"),
                ReportingRegion: Yup.string().trim().required("Reporting Region is required"),
                IFSCCode: Yup.string().trim().required("IFSC Code is required"),
                BranchManagerName: Yup.string().trim().required("Branch Manager Name is required"),
                BranchOpeningDate: Yup.string().trim().required("Branch Opening Date is required"),
                CashLimit: Yup.number().required("Cash Limit is required").min(0, "Cannot be negative"),
                OpeningCashBalance: Yup.number().required("Opening Cash Balance is required").min(0, "Cannot be negative"),
                BranchAddress: Yup.string().trim().required("Branch Address is required"),
                F_CityMaster: Yup.string().trim().required("City is required"),
                F_StateMaster: Yup.string().trim().required("State is required"),
                ContactNumber: Yup.string().trim().required("Contact Number is required"),
                Email: Yup.string().trim().email("Invalid email format").required("Email is required"),
            }),
        []
    );

    useEffect(() => {
        branchNameRef.current?.focus();
    }, []);

    useEffect(() => {
        Fn_FillListData(dispatch, setDropdowns, "regions", REGION_API_URL)
            .catch((err) => console.error("Failed to fetch regions:", err));
        Fn_FillListData(dispatch, setDropdowns, "states", STATE_API_URL)
            .catch((err) => console.error("Failed to fetch states:", err));
        Fn_FillListData(dispatch, setDropdowns, "cities", CITY_API_URL)
            .catch((err) => console.error("Failed to fetch cities:", err));
    }, [dispatch, REGION_API_URL, STATE_API_URL, CITY_API_URL]);

    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;

        if (recordId > 0) {
            setBoState((prev) => ({
                ...prev,
                id: recordId,
            }));
            Fn_DisplayData(dispatch, setBoState, recordId, API_URL_EDIT);
        } else {
            setBoState((prev) => ({
                ...prev,
                id: 0,
                formData: { ...initialValues },
            }));
        }
    }, [dispatch, location.state, API_URL_EDIT]);

    const handleStateChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        handleChange: FormikProps<FormValues>["handleChange"],
        setFieldValue: FormikProps<FormValues>["setFieldValue"]
    ) => {
        handleChange(e);
        const selectedState = e.target.value;
        if (selectedState) {
            Fn_FillListData(dispatch, setDropdowns, "cities", `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.CityMaster}/Id/${selectedState}`).catch((err) => {
                console.error("Failed to fetch cities by state:", err);
            });
        } else {
            setDropdowns((prev) => ({ ...prev, cities: [] }));
        }
        setFieldValue("F_CityMaster", "");
    };

    const toStringOrEmpty = (value: unknown) => (value !== undefined && value !== null ? String(value) : "");

    const initialFormValues: FormValues = {
        ...initialValues,
        BranchName: toStringOrEmpty(boState.formData.BranchName),
        BranchCode: toStringOrEmpty(boState.formData.BranchCode),
        ReportingRegion: toStringOrEmpty(boState.formData.ReportingRegion),
        IFSCCode: toStringOrEmpty(boState.formData.IFSCCode),
        BranchManagerName: toStringOrEmpty(boState.formData.BranchManagerName),
        BranchOpeningDate: toStringOrEmpty(boState.formData.BranchOpeningDate),
        CashLimit: toStringOrEmpty(boState.formData.CashLimit),
        OpeningCashBalance: toStringOrEmpty(boState.formData.OpeningCashBalance) || "0",
        BranchAddress: toStringOrEmpty(boState.formData.BranchAddress),
        F_CityMaster: toStringOrEmpty(boState.formData.F_CityMaster),
        F_StateMaster: toStringOrEmpty(boState.formData.F_StateMaster),
        ContactNumber: toStringOrEmpty(boState.formData.ContactNumber),
        Email: toStringOrEmpty(boState.formData.Email),
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Id", String(boState.id ?? 0));
            formData.append("BranchName", values.BranchName || "");
            formData.append("BranchCode", values.BranchCode || "");
            formData.append("ReportingRegion", values.ReportingRegion || "");
            formData.append("IFSCCode", values.IFSCCode || "");
            formData.append("BranchManagerName", values.BranchManagerName || "");
            formData.append("BranchOpeningDate", values.BranchOpeningDate || "");
            formData.append("CashLimit", values.CashLimit || "0");
            formData.append("OpeningCashBalance", values.OpeningCashBalance || "0");
            formData.append("BranchAddress", values.BranchAddress || "");
            formData.append("F_CityMaster", values.F_CityMaster || "");
            formData.append("F_StateMaster", values.F_StateMaster || "");
            formData.append("ContactNumber", values.ContactNumber || "");
            formData.append("Email", values.Email || "");

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            formData.append("UserId", currentUser?.uid ?? currentUser?.id ?? "0");

            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder callback
                { arguList: { id: boState.id, formData } },
                API_URL_SAVE,
                true,
                "memberid",
                navigate,
                "/branchOfficeCreation"
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
            <Breadcrumbs mainTitle="Branch Office Creation" parent="Setup & Admin" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<FormValues>
                            initialValues={initialFormValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }: FormikProps<FormValues>) => (
                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                    <Card>
                                        <CardHeaderCommon title={`${isEditMode ? "Edit" : "Add"} Branch Office`} tagClass="card-title mb-0" />
                                        <CardBody>
                                            <Row className="gy-2">
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Branch Name <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="BranchName"
                                                            placeholder="e.g. Andheri Branch"
                                                            value={values.BranchName}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.BranchName && !!errors.BranchName}
                                                            innerRef={branchNameRef}
                                                        />
                                                        <ErrorMessage name="BranchName" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Branch-level reports, user login identification" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Branch Code <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="BranchCode"
                                                            placeholder="Auto-generated: ABC-NZ01-BR001"
                                                            value={values.BranchCode}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.BranchCode && !!errors.BranchCode}
                                                        />
                                                        <ErrorMessage name="BranchCode" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Loan Account Numbers, Voucher Numbers, Receipt Numbers" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Reporting Regional Office <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="ReportingRegion"
                                                            value={values.ReportingRegion}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.ReportingRegion && !!errors.ReportingRegion}
                                                        >
                                                            <option value="">-- Select Region --</option>
                                                            {/* {dropdowns.regions.length === 0 && <option value="RO001">North Zone Office (RO001)</option>} */}
                                                            {dropdowns.regions.map((regionOption) => (
                                                                <option key={regionOption?.Id} value={regionOption?.Id ?? ""}>
                                                                    {regionOption?.Name || `Region ${regionOption?.Id ?? ""}`}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="ReportingRegion" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="FK: Regional_ID — defines hierarchy and reporting chain" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            IFSC Code <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="IFSCCode"
                                                            placeholder="ABCD0001234"
                                                            value={values.IFSCCode}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.IFSCCode && !!errors.IFSCCode}
                                                        />
                                                        <ErrorMessage name="IFSCCode" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Bank transfers, NACH mandate setup, payment processing" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Branch Manager Name <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="BranchManagerName"
                                                            placeholder="Enter manager name"
                                                            value={values.BranchManagerName}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.BranchManagerName && !!errors.BranchManagerName}
                                                        />
                                                        <ErrorMessage name="BranchManagerName" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Approval workflows, escalation matrix" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Branch Opening Date <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="date"
                                                            name="BranchOpeningDate"
                                                            value={values.BranchOpeningDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.BranchOpeningDate && !!errors.BranchOpeningDate}
                                                        />
                                                        <ErrorMessage name="BranchOpeningDate" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Financial year opening, initial balance entry" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Cash Limit (₹) <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            name="CashLimit"
                                                            placeholder="500000"
                                                            value={values.CashLimit}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.CashLimit && !!errors.CashLimit}
                                                        />
                                                        <ErrorMessage name="CashLimit" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Day-closing cash verification, alerts when cash exceeds limit" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Opening Cash Balance (₹) <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            name="OpeningCashBalance"
                                                            placeholder="0"
                                                            value={values.OpeningCashBalance}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.OpeningCashBalance && !!errors.OpeningCashBalance}
                                                        />
                                                        <ErrorMessage name="OpeningCashBalance" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Opening GL entry, Day Book starting balance" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="12">
                                                    <FormGroup>
                                                        <Label>
                                                            Branch Address <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="textarea"
                                                            name="BranchAddress"
                                                            rows={2}
                                                            placeholder="Full branch address"
                                                            value={values.BranchAddress}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.BranchAddress && !!errors.BranchAddress}
                                                        />
                                                        <ErrorMessage name="BranchAddress" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Official letters, loan documents" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            City <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="F_CityMaster"
                                                            value={values.F_CityMaster}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.F_CityMaster && !!errors.F_CityMaster}
                                                            disabled={!values.F_StateMaster}
                                                        >
                                                            <option value="">Select City</option>
                                                            {dropdowns.cities.map((cityOption) => (
                                                                <option key={cityOption?.Id} value={cityOption?.Id ?? ""}>
                                                                    {cityOption?.Name || `City ${cityOption?.Id ?? ""}`}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="F_CityMaster" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: District-level MIS reports" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            State <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="F_StateMaster"
                                                            value={values.F_StateMaster}
                                                            onChange={(e) => handleStateChange(e, handleChange, setFieldValue)}
                                                            onBlur={handleBlur}
                                                            invalid={touched.F_StateMaster && !!errors.F_StateMaster}
                                                        >
                                                            <option value="">-- Select State --</option>
                                                            {dropdowns.states.map((stateOption) => (
                                                                <option key={stateOption?.Id} value={stateOption?.Id ?? ""}>
                                                                    {stateOption?.Name || `State ${stateOption?.Id ?? ""}`}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="F_StateMaster" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: State-wise portfolio reports" />
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
                                                            placeholder="+91-XXXXXXXXXX"
                                                            value={values.ContactNumber}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.ContactNumber && !!errors.ContactNumber}
                                                        />
                                                        <ErrorMessage name="ContactNumber" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: SMS alerts, customer communication" />
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
                                                            placeholder="branch@abcfinance.com"
                                                            value={values.Email}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.Email && !!errors.Email}
                                                        />
                                                        <ErrorMessage name="Email" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Scheduled MIS email delivery to branch" />
                                                    </FormGroup>
                                                </Col>

                                            </Row>
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="primary" type="submit" disabled={isSubmitting}>
                                                <i className="fa fa-plus me-1"></i> {isEditMode ? "Update Branch Office" : "Create Branch"}
                                            </Btn>
                                            <Btn color="light" type="button" className="text-dark">
                                                <i className="fa fa-pencil me-1"></i> Edit
                                            </Btn>
                                            <Btn color="danger" type="button">
                                                <i className="fa fa-minus-circle me-1"></i> Deactivate
                                            </Btn>
                                            <Btn color="info" type="button" className="text-white">
                                                <i className="fa fa-users me-1"></i> Map Users
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

export default BranchOfficeCreation;
