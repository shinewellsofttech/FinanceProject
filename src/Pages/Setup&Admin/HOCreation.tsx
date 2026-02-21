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
    HOName: string;
    ShortCode: string;
    GSTNumber: string;
    CIN: string;
    RBIRegistration: string;
    PANNumber: string;
    RegisteredAddress: string;
    F_CityMaster: string;
    F_StateMaster: string;
    PINCode: string;
    ContactNumber: string;
    EmailAddress: string;
    Website: string;
    LogoUpload: any;
    HOEstablishmentDate: string;
}

const initialValues: FormValues = {
    HOName: "",
    ShortCode: "",
    GSTNumber: "",
    CIN: "",
    RBIRegistration: "",
    PANNumber: "",
    RegisteredAddress: "",
    F_CityMaster: "",
    F_StateMaster: "",
    PINCode: "",
    ContactNumber: "",
    EmailAddress: "",
    Website: "",
    LogoUpload: null,
    HOEstablishmentDate: "",
};

interface DropdownState {
    states: Array<{ Id?: number; Name?: string }>;
    cities: Array<{ Id?: number; Name?: string }>;
}

interface HOState {
    id: number;
    formData: Partial<FormValues>;
    isProgress?: boolean;
}

const HOCreation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const hoNameRef = useRef<HTMLInputElement | null>(null);

    const [hoState, setHoState] = useState<HOState>({
        id: 0,
        formData: { ...initialValues },
        isProgress: false,
    });

    const [dropdowns, setDropdowns] = useState<DropdownState>({
        states: [],
        cities: [],
    });

    const isEditMode = hoState.id > 0;

    const STATE_API_URL = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.StateMaster}/Id/0`;
    const CITY_API_URL = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.CityMaster}/Id/0`;
    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/HeadOfficeMaster/Id`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                HOName: Yup.string().trim().required("HO Name is required"),
                ShortCode: Yup.string().trim().required("Short Code is required"),
                GSTNumber: Yup.string().trim().required("GST Number is required"),
                CIN: Yup.string().trim().required("CIN is required"),
                RBIRegistration: Yup.string().trim().required("RBI Registration is required"),
                PANNumber: Yup.string().trim().required("PAN Number is required"),
                RegisteredAddress: Yup.string().trim().required("Registered Address is required"),
                F_CityMaster: Yup.string().trim().required("City is required"),
                F_StateMaster: Yup.string().trim().required("State is required"),
                PINCode: Yup.string().trim().required("PIN Code is required"),
                ContactNumber: Yup.string().trim().required("Contact Number is required"),
                EmailAddress: Yup.string().trim().email("Invalid email format").required("Email is required"),
                Website: Yup.string().trim().url("Invalid URL format"),
                HOEstablishmentDate: Yup.string().trim().required("HO Establishment Date is required"),
            }),
        []
    );

    useEffect(() => {
        hoNameRef.current?.focus();
    }, []);

    useEffect(() => {
        Fn_FillListData(dispatch, setDropdowns, "states", STATE_API_URL)
            .catch((err) => console.error("Failed to fetch states:", err));
        Fn_FillListData(dispatch, setDropdowns, "cities", CITY_API_URL)
            .catch((err) => console.error("Failed to fetch cities:", err));
    }, [dispatch]);

    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;

        if (recordId > 0) {
            setHoState((prev) => ({
                ...prev,
                id: recordId,
            }));
            Fn_DisplayData(dispatch, setHoState, recordId, API_URL_EDIT);
        } else {
            setHoState((prev) => ({
                ...prev,
                id: 0,
                formData: { ...initialValues },
            }));
        }
    }, [dispatch, location.state, API_URL_EDIT]);

    const toStringOrEmpty = (value: unknown) => (value !== undefined && value !== null ? String(value) : "");

    const initialFormValues: FormValues = {
        ...initialValues,
        HOName: toStringOrEmpty(hoState.formData.HOName),
        ShortCode: toStringOrEmpty(hoState.formData.ShortCode),
        GSTNumber: toStringOrEmpty(hoState.formData.GSTNumber),
        CIN: toStringOrEmpty(hoState.formData.CIN),
        RBIRegistration: toStringOrEmpty(hoState.formData.RBIRegistration),
        PANNumber: toStringOrEmpty(hoState.formData.PANNumber),
        RegisteredAddress: toStringOrEmpty(hoState.formData.RegisteredAddress),
        F_CityMaster: toStringOrEmpty(hoState.formData.F_CityMaster),
        F_StateMaster: toStringOrEmpty(hoState.formData.F_StateMaster),
        PINCode: toStringOrEmpty(hoState.formData.PINCode),
        ContactNumber: toStringOrEmpty(hoState.formData.ContactNumber),
        EmailAddress: toStringOrEmpty(hoState.formData.EmailAddress),
        Website: toStringOrEmpty(hoState.formData.Website),
        HOEstablishmentDate: toStringOrEmpty(hoState.formData.HOEstablishmentDate),
        LogoUpload: hoState.formData.LogoUpload || null,
    };

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

    const API_URL_SAVE = `HeadOfficeMaster/0/token`; // Adjust this logic per your actual API endpoint

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Id", String(hoState.id ?? 0));
            formData.append("HOName", values.HOName || "");
            formData.append("ShortCode", values.ShortCode || "");
            formData.append("GSTNumber", values.GSTNumber || "");
            formData.append("CIN", values.CIN || "");
            formData.append("RBIRegistration", values.RBIRegistration || "");
            formData.append("PANNumber", values.PANNumber || "");
            formData.append("RegisteredAddress", values.RegisteredAddress || "");
            formData.append("F_CityMaster", values.F_CityMaster || "");
            formData.append("F_StateMaster", values.F_StateMaster || "");
            formData.append("PINCode", values.PINCode || "");
            formData.append("ContactNumber", values.ContactNumber || "");
            formData.append("EmailAddress", values.EmailAddress || "");
            formData.append("Website", values.Website || "");
            formData.append("HOEstablishmentDate", values.HOEstablishmentDate || "");

            if (values.LogoUpload) {
                formData.append("LogoUpload", values.LogoUpload);
            }

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            formData.append("UserId", currentUser?.uid ?? currentUser?.id ?? "0");

            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder callback, replace with state setter if needed
                { arguList: { id: hoState.id, formData } },
                API_URL_SAVE,
                true,
                "memberid",
                navigate,
                "/hoCreation" // Redirect route after success
            );

        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Helper component for the helper text
    const HelperText = ({ text }: { text: string }) => (
        <div className="text-muted small mt-1" style={{ fontSize: "0.80rem" }}>
            <i className="fa fa-thumb-tack text-danger me-1"></i> {text}
        </div>
    );

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Head Office Creation" parent="Setup & Admin" />
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
                                        <CardHeaderCommon title={`${isEditMode ? "Edit" : "Add"} Head Office Information`} tagClass="card-title mb-0" />
                                        <CardBody>
                                            <Row className="gy-2">
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            HO Name <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="HOName"
                                                            placeholder="e.g. ABC Finance Pvt. Ltd."
                                                            value={values.HOName}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.HOName && !!errors.HOName}
                                                            innerRef={hoNameRef}
                                                        />
                                                        <ErrorMessage name="HOName" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Reports headers, letterheads, all system-generated documents" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Short Code / Alias <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="ShortCode"
                                                            placeholder="e.g. ABCFIN"
                                                            value={values.ShortCode}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.ShortCode && !!errors.ShortCode}
                                                        />
                                                        <ErrorMessage name="ShortCode" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Auto-generating Branch Codes, Account Numbers, Voucher IDs" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            GST Number <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="GSTNumber"
                                                            placeholder="22AAAAA0000A1Z5"
                                                            value={values.GSTNumber}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.GSTNumber && !!errors.GSTNumber}
                                                        />
                                                        <ErrorMessage name="GSTNumber" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Invoices, GST reports, compliance documents" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            CIN (Company Identification No.) <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="CIN"
                                                            placeholder="U65999MH2020PTC123456"
                                                            value={values.CIN}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.CIN && !!errors.CIN}
                                                        />
                                                        <ErrorMessage name="CIN" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: RBI compliance reports (NBS-1, NBS-2), audit documents" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            RBI Registration / NBFC License No. <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="RBIRegistration"
                                                            placeholder="N-14.03234"
                                                            value={values.RBIRegistration}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.RBIRegistration && !!errors.RBIRegistration}
                                                        />
                                                        <ErrorMessage name="RBIRegistration" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Loan Agreement footers, RBI submissions" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            PAN Number <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="PANNumber"
                                                            placeholder="AAAAA0000A"
                                                            value={values.PANNumber}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.PANNumber && !!errors.PANNumber}
                                                        />
                                                        <ErrorMessage name="PANNumber" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: TDS computation, income tax filings" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="12">
                                                    <FormGroup>
                                                        <Label>
                                                            Registered Address <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="textarea"
                                                            name="RegisteredAddress"
                                                            rows={3}
                                                            placeholder="Full registered address as per MCA"
                                                            value={values.RegisteredAddress}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.RegisteredAddress && !!errors.RegisteredAddress}
                                                        />
                                                        <ErrorMessage name="RegisteredAddress" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: NOC letters, loan agreements, regulatory filings" />
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
                                                        <HelperText text="Used in: Address on official documents" />
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
                                                        <HelperText text="Used in: GST state code, regional mapping" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            PIN Code <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="PINCode"
                                                            placeholder="400001"
                                                            value={values.PINCode}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.PINCode && !!errors.PINCode}
                                                        />
                                                        <ErrorMessage name="PINCode" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Address validation, geo-mapping" />
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
                                                        <HelperText text="Used in: SMS gateway config, official communication" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Email Address <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="email"
                                                            name="EmailAddress"
                                                            placeholder="admin@abcfinance.com"
                                                            value={values.EmailAddress}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.EmailAddress && !!errors.EmailAddress}
                                                        />
                                                        <ErrorMessage name="EmailAddress" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Email alerts, scheduled MIS reports, notifications" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Website
                                                        </Label>
                                                        <Input
                                                            type="url"
                                                            name="Website"
                                                            placeholder="https://www.abcfinance.com"
                                                            value={values.Website}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.Website && !!errors.Website}
                                                        />
                                                        <ErrorMessage name="Website" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Optional - Used in: Loan Agreement footer" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            Logo Upload <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="file"
                                                            name="LogoUpload"
                                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                                setFieldValue("LogoUpload", event.currentTarget.files ? event.currentTarget.files[0] : null);
                                                            }}
                                                            onBlur={handleBlur}
                                                            invalid={touched.LogoUpload && !!errors.LogoUpload}
                                                        />
                                                        <ErrorMessage name="LogoUpload" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: All printed reports, certificates, loan documents" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>
                                                            HO Establishment Date <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="date"
                                                            name="HOEstablishmentDate"
                                                            value={values.HOEstablishmentDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.HOEstablishmentDate && !!errors.HOEstablishmentDate}
                                                        />
                                                        <ErrorMessage name="HOEstablishmentDate" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Company profile reports, audit documents" />
                                                    </FormGroup>
                                                </Col>

                                            </Row>
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="primary" type="submit" disabled={isSubmitting}>
                                                <i className="fa fa-plus me-1"></i> {isEditMode ? "Update Head Office" : "Create Head Office"}
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

export default HOCreation;
