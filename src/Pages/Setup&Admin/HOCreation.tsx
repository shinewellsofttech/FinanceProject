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
    F_CountryMaster: string;
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
    F_CountryMaster: "",
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
    countries: Array<{ Id?: number; Name?: string }>;
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
        countries: [],
        states: [],
        cities: [],
    });

    const isEditMode = hoState.id > 0;

    const COUNTRY_API_URL = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.CountryMaster}/Id/0`;
    const STATE_API_URL = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.StateMaster}/Id/0`;
    const CITY_API_URL = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.CityMaster}/Id/0`;
    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/HeadOffice/Id`;

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
                F_CountryMaster: Yup.string().trim().required("Country is required"),
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
        Fn_FillListData(dispatch, setDropdowns, "countries", COUNTRY_API_URL)
            .catch((err) => console.error("Failed to fetch countries:", err));
    }, [dispatch]);

    useEffect(() => {
        const run = async () => {
            const locationState = location.state as { Id?: number } | undefined;
            // Automatically select ID 1 if no specific valid ID is passed, so data is fetched and pre-filled on load/reload.
            const recordId = (locationState?.Id && locationState.Id > 0) ? locationState.Id : 1;

            console.log("HOCreation: navigation state:", locationState, "resolved recordId:", recordId, "API_URL_EDIT:", API_URL_EDIT);

            if (recordId > 0) {
                setHoState((prev) => ({
                    ...prev,
                    id: recordId,
                }));
                try {
                    await Fn_DisplayData(dispatch, setHoState, recordId, API_URL_EDIT);
                    console.log("Fn_DisplayData resolved for id:", recordId);
                } catch (err) {
                    console.error("Fn_DisplayData failed:", err);
                }
            } else {
                setHoState((prev) => ({
                    ...prev,
                    id: 0,
                    formData: { ...initialValues },
                }));
            }
        };

        run();
    }, [dispatch, location.state, API_URL_EDIT]);

    // When Fn_DisplayData sets `hoState.formData` with API fields (Name, Code, CountryName, etc.), map
    // those API field names into our FormValues keys so Formik initialValues populate correctly.
    useEffect(() => {
        const record: any = hoState.formData as any;

        console.log("Mapping effect triggered - hoState.id:", hoState.id, "record:", record);

        if (!hoState.id || hoState.id === 0) {
            console.log("Skipping mapping - no ID or in add mode");
            return;
        }

        // Check if record has actual data (not just initialValues)
        if (!record.Name && !record.Code) {
            console.log("Skipping mapping - record has no Name or Code data yet");
            return;
        }

        if (record.isMapped) {
            console.log("Skipping mapping - record is already mapped");
            return;
        }

        const mapAndPopulate = async () => {
            console.log("Starting to map and populate data...");

            // Map basic fields
            const mapped: Partial<FormValues> & any = {
                ...hoState.formData,
                HOName: record.Name ?? "",
                ShortCode: record.Code ?? "",
                GSTNumber: record.GST ?? "",
                CIN: record.CIN ?? "",
                RBIRegistration: record.LicenseNo ?? record.Licenseinfo ?? record.LicenseInfo ?? "",
                PANNumber: record.PAN ?? record.PAN ?? "",
                RegisteredAddress: record.Address ?? "",
                PINCode: record.Pincode ?? record.PINCODE ?? "",
                ContactNumber: record.ContactNo ?? record.Contactno ?? record.ContactNumber ?? "",
                EmailAddress: record.Email ?? record.EmailAddress ?? "",
                Website: record.Website ?? "",
                HOEstablishmentDate: record.EstablishmentDate ? String(record.EstablishmentDate).split("T")[0] : "",
                isMapped: true,
            };

            console.log("Mapped fields:", mapped);

            // Resolve country id: prefer explicit id fields, otherwise match by name from countries dropdown
            let countryId = record.F_CountryMaster ?? record.CountryId ?? record.CountryMasterId ?? null;

            if (!countryId && record.CountryName && dropdowns.countries.length > 0) {
                const found = dropdowns.countries.find((c) => c.Name === record.CountryName || String(c.Id) === String(record.CountryName));
                countryId = found?.Id ?? null;
            }

            console.log("Resolved countryId:", countryId);

            if (countryId) {
                mapped.F_CountryMaster = String(countryId);
                // fetch states for this country, then try to map state and city
                try {
                    const statesList: any = await Fn_FillListData(dispatch, setDropdowns, "states", `${API_WEB_URLS.MASTER}/0/token/StateMasterByCountry/Id/${countryId}`);
                    console.log("Fetched states:", statesList);

                    // Try to find state id
                    let stateId = record.F_StateMaster ?? record.StateId ?? record.StateMasterId ?? null;
                    if (!stateId && record.StateName && Array.isArray(statesList)) {
                        const foundState = statesList.find((s: any) => s.Name === record.StateName || String(s.Id) === String(record.StateName));
                        stateId = foundState?.Id ?? null;
                    }

                    console.log("Resolved stateId:", stateId);

                    if (stateId) {
                        mapped.F_StateMaster = String(stateId);
                        // fetch cities for this state and try to map city
                        try {
                            const citiesList: any = await Fn_FillListData(dispatch, setDropdowns, "cities", `${API_WEB_URLS.MASTER}/0/token/CityMasterByState/Id/${stateId}`);
                            console.log("Fetched cities:", citiesList);

                            let cityId = record.F_CityMaster ?? record.CityId ?? record.CityMasterId ?? null;
                            if (!cityId && record.CityName && Array.isArray(citiesList)) {
                                const foundCity = citiesList.find((c: any) => c.Name === record.CityName || String(c.Id) === String(record.CityName));
                                cityId = foundCity?.Id ?? null;
                            }

                            console.log("Resolved cityId:", cityId);
                            if (cityId) mapped.F_CityMaster = String(cityId);
                        } catch (err) {
                            console.error("Failed to fetch cities while mapping display data:", err);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch states while mapping display data:", err);
                }
            }

            console.log("Final mapped object:", mapped);

            // Finally update hoState.formData with mapped values
            setHoState((prev) => ({
                ...prev,
                formData: {
                    ...prev.formData,
                    ...mapped,
                },
            }));
        };

        mapAndPopulate();
    }, [hoState.formData, dispatch, dropdowns.countries]);

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
        F_CountryMaster: toStringOrEmpty(hoState.formData.F_CountryMaster),
        F_CityMaster: toStringOrEmpty(hoState.formData.F_CityMaster),
        F_StateMaster: toStringOrEmpty(hoState.formData.F_StateMaster),
        PINCode: toStringOrEmpty(hoState.formData.PINCode),
        ContactNumber: toStringOrEmpty(hoState.formData.ContactNumber),
        EmailAddress: toStringOrEmpty(hoState.formData.EmailAddress),
        Website: toStringOrEmpty(hoState.formData.Website),
        HOEstablishmentDate: toStringOrEmpty(hoState.formData.HOEstablishmentDate),
        LogoUpload: hoState.formData.LogoUpload || null,
    };

    const handleCountryChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        handleChange: FormikProps<FormValues>["handleChange"],
        setFieldValue: FormikProps<FormValues>["setFieldValue"]
    ) => {
        handleChange(e);
        const selectedCountry = e.target.value;
        if (selectedCountry) {
            Fn_FillListData(dispatch, setDropdowns, "states", `${API_WEB_URLS.MASTER}/0/token/StateMasterByCountry/Id/${selectedCountry}`).catch((err) => {
                console.error("Failed to fetch states by country:", err);
            });
        } else {
            setDropdowns((prev) => ({ ...prev, states: [], cities: [] }));
        }
        setFieldValue("F_StateMaster", "");
        setFieldValue("F_CityMaster", "");
    };

    const handleStateChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        handleChange: FormikProps<FormValues>["handleChange"],
        setFieldValue: FormikProps<FormValues>["setFieldValue"]
    ) => {
        handleChange(e);
        const selectedState = e.target.value;
        if (selectedState) {
            Fn_FillListData(dispatch, setDropdowns, "cities", `${API_WEB_URLS.MASTER}/0/token/CityMasterByState/Id/${selectedState}`).catch((err) => {
                console.error("Failed to fetch cities by state:", err);
            });
        } else {
            setDropdowns((prev) => ({ ...prev, cities: [] }));
        }
        setFieldValue("F_CityMaster", "");
    };

    const API_URL_SAVE = `HeadOffice/0/token`;

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Name", values.HOName || "");
            formData.append("Code", values.ShortCode || "");
            formData.append("GST", values.GSTNumber || "");
            formData.append("CIN", values.CIN || "");
            formData.append("LicenseNo", values.RBIRegistration || "");
            formData.append("PAN", values.PANNumber || "");
            formData.append("Address", values.RegisteredAddress || "");
            formData.append("F_CountryMaster", values.F_CountryMaster || "");
            formData.append("F_StateMaster", values.F_StateMaster || "");
            formData.append("F_CityMaster", values.F_CityMaster || "");
            formData.append("Pincode", values.PINCode || "");
            formData.append("Contactno", values.ContactNumber || "");
            formData.append("Email", values.EmailAddress || "");
            formData.append("Website", values.Website || "");
            formData.append("EstablishmentDate", values.HOEstablishmentDate || "");

            if (values.LogoUpload) {
                formData.append("Logo", values.LogoUpload);
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
                                            <Row className="gy-0">
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>

                                                <Col md="12">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Country <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="F_CountryMaster"
                                                            value={values.F_CountryMaster}
                                                            onChange={(e) => handleCountryChange(e, handleChange, setFieldValue)}
                                                            onBlur={handleBlur}
                                                            invalid={touched.F_CountryMaster && !!errors.F_CountryMaster}
                                                        >
                                                            <option value="">-- Select Country --</option>
                                                            {dropdowns.countries.map((countryOption) => (
                                                                <option key={countryOption?.Id} value={countryOption?.Id ?? ""}>
                                                                    {countryOption?.Name || `Country ${countryOption?.Id ?? ""}`}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="F_CountryMaster" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
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
