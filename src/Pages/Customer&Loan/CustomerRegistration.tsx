import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage, FieldArray } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_AddEditData, Fn_DisplayData, Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import * as Yup from "yup";
import { Card, CardBody, CardFooter, Col, Container, FormGroup, Input, Label, Row, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";

interface BankAccount {
    BankName: string;
    AccountNumber: string;
    IFSCCode: string;
    F_AccountTypeMaster: string;
}

interface CustomerFormValues {
    Name: string;
    DateOfBirth: string;
    Gender: string;
    MobileNo: string;
    AlternateMobile: string;
    Email: string;
    AadhaarNo: string;
    PAN: string;
    CurrentAddress: string;
    F_CityMaster: string;
    F_StateMaster: string;
    Pincode: string;
    F_OccupationTypeMaster: string;
    YearsInBusinessOrJob: string;
    MonthlyIncome: string;
    BusinessAddress: string;
    CustomerPhoto: any;
    IsITRAvailable: string;
    F_FieldUnitCentre: string;
    F_MemberGroup: string;
    BankAccounts: BankAccount[];
}

const initialValues: CustomerFormValues = {
    Name: "",
    DateOfBirth: "",
    Gender: "",
    MobileNo: "",
    AlternateMobile: "",
    Email: "",
    AadhaarNo: "",
    PAN: "",
    CurrentAddress: "",
    F_CityMaster: "",
    F_StateMaster: "",
    Pincode: "",
    F_OccupationTypeMaster: "",
    YearsInBusinessOrJob: "",
    MonthlyIncome: "",
    BusinessAddress: "",
    CustomerPhoto: null,
    IsITRAvailable: "false",
    F_FieldUnitCentre: "",
    F_MemberGroup: "",
    BankAccounts: [
        { BankName: "", AccountNumber: "", IFSCCode: "", F_AccountTypeMaster: "" }
    ],
};

interface KYCFormValues {
    F_ProofTypeMaster: string;
    IDProofFront: any;
    IDProofBack: any;
    F_AddressProofTypeMaster: string;
    AddressProofFile: any;
    Photograph: any;
    SignatureFile: any;
    ITRProofFile: any;
    CKYCStatus: string;
    CreditBureau: string;
    CreditScore: string;
    InternalRiskGrade: string;
    FingerprintAuth: string;
    AadhaarESign: string;
}

const initialKYCValues: KYCFormValues = {
    F_ProofTypeMaster: "",
    IDProofFront: null,
    IDProofBack: null,
    F_AddressProofTypeMaster: "",
    AddressProofFile: null,
    Photograph: null,
    SignatureFile: null,
    ITRProofFile: null,
    CKYCStatus: "Not Checked",
    CreditBureau: "Not Fetched",
    CreditScore: "",
    InternalRiskGrade: "",
    FingerprintAuth: "Not Required",
    AadhaarESign: "Pending",
};

interface DropdownState {
    genders: Array<{ Id?: number; Name?: string }>;
    states: Array<{ Id?: number; Name?: string }>;
    cities: Array<{ Id?: number; Name?: string }>;
    occupations: Array<{ Id?: number; Name?: string }>;
    fieldUnits: Array<{ Id?: number; Name?: string }>;
    memberGroups: Array<{ Id?: number; Name?: string }>;
    accountTypes: Array<{ Id?: number; Name?: string }>;
    idProofTypes: Array<{ Id?: number; Name?: string }>;
    addressProofTypes: Array<{ Id?: number; Name?: string }>;
}

const CustomerRegistration = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const nameRef = useRef<HTMLInputElement | null>(null);

    const [activeTab, setActiveTab] = useState("1");
    // State to hold any fetched form data later for edit support
    const [savedData, setSavedData] = useState<Partial<CustomerFormValues>>({});
    const [savedKYCData, setSavedKYCData] = useState<Partial<KYCFormValues>>({});

    const [dropdowns, setDropdowns] = useState<DropdownState>({
        genders: [],
        states: [],
        cities: [],
        occupations: [],
        fieldUnits: [],
        memberGroups: [],
        accountTypes: [],
        idProofTypes: [],
        addressProofTypes: []
    });

    const API_URL_SAVE = `${API_WEB_URLS.BASE}Masters/0/token/CustomerMaster/Id/0`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                Name: Yup.string().trim().required("Name is required"),
                DateOfBirth: Yup.date().required("Date of Birth is required").nullable(),
                Gender: Yup.string().required("Gender is required"),
                MobileNo: Yup.string().matches(/^[0-9]{10}$/, "Must be a 10-digit number").required("Mobile Number is required"),
                AadhaarNo: Yup.string().matches(/^[0-9]{12}$/, "Must be a 12-digit number").required("Aadhaar Number is required"),
                PAN: Yup.string().required("PAN Number is required"),
                CurrentAddress: Yup.string().required("Current Address is required"),
                F_CityMaster: Yup.string().required("City is required"),
                F_StateMaster: Yup.string().required("State is required"),
                Pincode: Yup.string().matches(/^[0-9]{6}$/, "Must be a 6-digit number").required("PIN Code is required"),
                F_OccupationTypeMaster: Yup.string().required("Occupation is required"),
                MonthlyIncome: Yup.number().typeError("Must be a number").required("Monthly Income is required"),
                BankAccounts: Yup.array().of(
                    Yup.object().shape({
                        BankName: Yup.string().required("Bank Name is required"),
                        AccountNumber: Yup.string().required("Account Number is required"),
                        IFSCCode: Yup.string().required("IFSC Code is required"),
                        F_AccountTypeMaster: Yup.string().required("Account Type is required"),
                    })
                ).min(1, "At least one bank account is required")
            }),
        []
    );

    const kycValidationSchema = useMemo(
        () =>
            Yup.object({
                F_ProofTypeMaster: Yup.string().required("ID Proof Type is required"),
                IDProofFront: Yup.mixed().required("ID Proof Front is required"),
                F_AddressProofTypeMaster: Yup.string().required("Address Proof Type is required"),
                AddressProofFile: Yup.mixed().required("Address Proof is required"),
                Photograph: Yup.mixed().required("Photograph is required"),
                SignatureFile: Yup.mixed().required("Signature is required"),
            }),
        []
    );

    useEffect(() => {
        nameRef.current?.focus();
        
        Fn_FillListData(dispatch, setDropdowns, "states", `Masters/0/token/StateMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "occupations", `Masters/0/token/OccupationTypeMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "fieldUnits", `Masters/0/token/FieldUnitCentre/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "memberGroups", `Masters/0/token/MemberGroup/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "accountTypes", `Masters/0/token/AccountTypeMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "idProofTypes", `Masters/0/token/ProofTypeMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "addressProofTypes", `Masters/0/token/AddressProofTypeMaster/Id/0`);
    }, [dispatch]);

    const initialFormValues: CustomerFormValues = {
        ...initialValues,
        ...savedData
    };

    const initialKYCSavedValues: KYCFormValues = {
        ...initialKYCValues,
        ...savedKYCData
    };

    const handleStateChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        handleChange: FormikProps<CustomerFormValues>["handleChange"],
        setFieldValue: FormikProps<CustomerFormValues>["setFieldValue"]
    ) => {
        handleChange(e);
        const selectedState = e.target.value;
        if (selectedState) {
            Fn_FillListData(dispatch, setDropdowns, "cities", `Masters/0/token/CityMasterByState/Id/${selectedState}`)
                .catch((err) => console.error("Failed to fetch cities by state:", err));
        } else {
            setDropdowns((prev) => ({ ...prev, cities: [] }));
        }
        setFieldValue("F_CityMaster", "");
    };

    const handleSubmit = async (values: CustomerFormValues, { setSubmitting }: FormikHelpers<CustomerFormValues>) => {
        try {
            // Format BankJson according to required structure
            const bankJson = values.BankAccounts.map(account => ({
                BankName: account.BankName,
                AccountNumber: account.AccountNumber,
                IFSCCode: account.IFSCCode,
                F_BankAccountTypeMaster: parseInt(account.F_AccountTypeMaster) || 0
            }));

            const formData = new FormData();
            
            // Append all fields
            Object.keys(values).forEach(key => {
                if (key !== 'BankAccounts') {
                    const val = values[key as keyof CustomerFormValues];
                    if (val instanceof File) {
                        formData.append(key, val);
                    } else {
                        formData.append(key, String(val || ""));
                    }
                }
            });
            
            // Append BankJson as JSON string
            formData.append("BankJson", JSON.stringify(bankJson));
            
            // Add UserId
            formData.append("UserId", "0");
            
            console.log("Submitting Basic Info payload:", values);
            console.log("Formatted BankJson:", JSON.stringify(bankJson, null, 2));
            
            setSavedData(values); // Saving states into memory locally
            // After saving successfully hook, proceed to next tab:
            setActiveTab("2");
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleKYCSubmit = async (values: KYCFormValues, { setSubmitting }: FormikHelpers<KYCFormValues>) => {
        try {
            console.log("Submitting KYC Info payload:", values);
            setSavedKYCData(values);
            setActiveTab("3");
        } catch (error) {
            console.error("KYC Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleKYCSave = async (kycValues: KYCFormValues) => {
        try {
            // Combine Basic Info (savedData from Tab 1) + KYC data
            const formData = new FormData();
            
            // --- Basic Info fields from Tab 1 ---
            formData.append("Name", String(savedData.Name || ""));
            formData.append("DateOfBirth", String(savedData.DateOfBirth || ""));
            formData.append("Gender", String(savedData.Gender || ""));
            formData.append("MobileNo", String(savedData.MobileNo || ""));
            formData.append("AlternateMobile", String(savedData.AlternateMobile || ""));
            formData.append("Email", String(savedData.Email || ""));
            formData.append("AadhaarNo", String(savedData.AadhaarNo || ""));
            formData.append("PAN", String(savedData.PAN || ""));
            formData.append("CurrentAddress", String(savedData.CurrentAddress || ""));
            formData.append("F_CityMaster", String(savedData.F_CityMaster || "0"));
            formData.append("F_StateMaster", String(savedData.F_StateMaster || "0"));
            formData.append("Pincode", String(savedData.Pincode || ""));
            formData.append("F_OccupationTypeMaster", String(savedData.F_OccupationTypeMaster || "0"));
            formData.append("YearsInBusinessOrJob", String(savedData.YearsInBusinessOrJob || "0"));
            formData.append("MonthlyIncome", String(savedData.MonthlyIncome || "0"));
            formData.append("BusinessAddress", String(savedData.BusinessAddress || ""));
            formData.append("IsITRAvailable", String(savedData.IsITRAvailable || "false"));
            formData.append("F_FieldUnitCentre", String(savedData.F_FieldUnitCentre || "0"));
            formData.append("F_MemberGroup", String(savedData.F_MemberGroup || "0"));
            
            // CustomerPhoto (file from Tab 1)
            if (savedData.CustomerPhoto instanceof File) {
                formData.append("CustomerPhoto", savedData.CustomerPhoto);
            }
            
            // BankJson
            const bankJson = (savedData.BankAccounts || []).map(account => ({
                BankName: account.BankName,
                AccountNumber: account.AccountNumber,
                IFSCCode: account.IFSCCode,
                F_BankAccountTypeMaster: parseInt(account.F_AccountTypeMaster) || 0
            }));
            formData.append("BankJson", JSON.stringify(bankJson));
            
            // --- KYC fields from Tab 2 ---
            formData.append("F_ProofTypeMaster", String(kycValues.F_ProofTypeMaster || "0"));
            formData.append("F_AddressProofTypeMaster", String(kycValues.F_AddressProofTypeMaster || "0"));
            
            // File uploads from KYC
            if (kycValues.IDProofFront instanceof File) {
                formData.append("IDProofFront", kycValues.IDProofFront);
            }
            if (kycValues.IDProofBack instanceof File) {
                formData.append("IDProofBack", kycValues.IDProofBack);
            }
            if (kycValues.AddressProofFile instanceof File) {
                formData.append("AddressProofFile", kycValues.AddressProofFile);
            }
            if (kycValues.Photograph instanceof File) {
                formData.append("Photograph", kycValues.Photograph);
            }
            if (kycValues.SignatureFile instanceof File) {
                formData.append("SignatureFile", kycValues.SignatureFile);
            }
            if (kycValues.ITRProofFile instanceof File) {
                formData.append("ITRProofFile", kycValues.ITRProofFile);
            }
            
            // UserId
            formData.append("UserId", "0");
            
            const API_URL_KYC_SAVE = `CustomerMaster/0/token`;
            
            console.log("Saving Customer + KYC payload to API:", API_URL_KYC_SAVE);
            console.log("BankJson:", JSON.stringify(bankJson, null, 2));
            
            // Make the actual API call
            await Fn_AddEditData(
                dispatch,
                () => undefined,
                { arguList: { id: 0, formData } },
                API_URL_KYC_SAVE,
                true,
                "memberid",
                navigate,
                "/customerRegistration"
            );
            setSavedKYCData(kycValues);
        } catch (error) {
            console.error("KYC Save failed:", error);
            alert("Failed to save KYC data!");
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Customer Registration" parent="Customer & Loan" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Card>
                            <CardBody className="p-0">
                                <Nav tabs className="border-tab nav-primary mb-0 p-3 pb-0" id="bottom-tab">
                                    <NavItem>
                                        <NavLink className={activeTab === "1" ? "active" : ""} onClick={() => setActiveTab("1")}>
                                            <i className="fa fa-user me-2"></i>Basic Info
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className={activeTab === "2" ? "active" : ""} onClick={() => setActiveTab("2")}>
                                            <i className="fa fa-id-card-o me-2"></i>KYC & Verification
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className={activeTab === "3" ? "active" : ""} onClick={() => setActiveTab("3")}>
                                            <i className="fa fa-thumbs-up me-2"></i>Approve
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <hr className="mt-0" />
                                <TabContent activeTab={activeTab} className="p-3 pt-0">
                                    <TabPane tabId="1">
                                        <Formik<CustomerFormValues>
                                            initialValues={initialFormValues}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit}
                                            enableReinitialize
                                        >
                                            {({ values, handleChange, handleBlur, errors, touched, setFieldValue, isSubmitting }: FormikProps<CustomerFormValues>) => (
                                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                                    <Row className="gy-0">
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Name <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="Name" placeholder="As per Aadhaar/PAN" value={values.Name} onChange={handleChange} onBlur={handleBlur} invalid={touched.Name && !!errors.Name} innerRef={nameRef} />
                                                                <ErrorMessage name="Name" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Date of Birth <span className="text-danger">*</span></Label>
                                                                <Input type="date" name="DateOfBirth" value={values.DateOfBirth} onChange={handleChange} onBlur={handleBlur} invalid={touched.DateOfBirth && !!errors.DateOfBirth} />
                                                                <ErrorMessage name="DateOfBirth" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Gender <span className="text-danger">*</span></Label>
                                                                <Input type="select" name="Gender" value={values.Gender} onChange={handleChange} onBlur={handleBlur} invalid={touched.Gender && !!errors.Gender}>
                                                                    <option value="">-- Select --</option>
                                                                    <option value="Male">Male</option>
                                                                    <option value="Female">Female</option>
                                                                    <option value="Other">Other</option>
                                                                </Input>
                                                                <ErrorMessage name="Gender" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Mobile Number <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="MobileNo" placeholder="10-digit mobile" value={values.MobileNo} onChange={handleChange} onBlur={handleBlur} invalid={touched.MobileNo && !!errors.MobileNo} />
                                                                <ErrorMessage name="MobileNo" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Alternate Mobile</Label>
                                                                <Input type="text" name="AlternateMobile" placeholder="Optional" value={values.AlternateMobile} onChange={handleChange} onBlur={handleBlur} invalid={touched.AlternateMobile && !!errors.AlternateMobile} />
                                                                <ErrorMessage name="AlternateMobile" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Email Address</Label>
                                                                <Input type="email" name="Email" placeholder="customer@email.com" value={values.Email} onChange={handleChange} onBlur={handleBlur} invalid={touched.Email && !!errors.Email} />
                                                                <ErrorMessage name="Email" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Aadhaar Number <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="AadhaarNo" placeholder="XXXX-XXXX-XXXX" value={values.AadhaarNo} onChange={handleChange} onBlur={handleBlur} invalid={touched.AadhaarNo && !!errors.AadhaarNo} />
                                                                <ErrorMessage name="AadhaarNo" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>PAN Number <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="PAN" placeholder="ABCDE1234F" value={values.PAN} onChange={handleChange} onBlur={handleBlur} invalid={touched.PAN && !!errors.PAN} />
                                                                <ErrorMessage name="PAN" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="12">
                                                            <FormGroup className="mb-0">
                                                                <Label>Current Address <span className="text-danger">*</span></Label>
                                                                <Input type="textarea" name="CurrentAddress" placeholder="House No, Street, Area" value={values.CurrentAddress} onChange={handleChange} onBlur={handleBlur} invalid={touched.CurrentAddress && !!errors.CurrentAddress} />
                                                                <ErrorMessage name="CurrentAddress" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>State <span className="text-danger">*</span></Label>
                                                                <Input type="select" name="F_StateMaster" value={values.F_StateMaster} onChange={(e) => handleStateChange(e, handleChange, setFieldValue)} onBlur={handleBlur} invalid={touched.F_StateMaster && !!errors.F_StateMaster}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.states.length === 0 && <option value="1">Mock State</option>}
                                                                    {dropdowns.states.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="F_StateMaster" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>City <span className="text-danger">*</span></Label>
                                                                <Input type="select" name="F_CityMaster" value={values.F_CityMaster} onChange={handleChange} onBlur={handleBlur} invalid={touched.F_CityMaster && !!errors.F_CityMaster} disabled={!values.F_StateMaster}>
                                                                    <option value="">-- Select City --</option>
                                                                    {dropdowns.cities.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="F_CityMaster" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>PIN Code <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="Pincode" value={values.Pincode} onChange={handleChange} onBlur={handleBlur} invalid={touched.Pincode && !!errors.Pincode} />
                                                                <ErrorMessage name="Pincode" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Occupation / Business Type <span className="text-danger">*</span></Label>
                                                                <Input type="select" name="F_OccupationTypeMaster" value={values.F_OccupationTypeMaster} onChange={handleChange} onBlur={handleBlur} invalid={touched.F_OccupationTypeMaster && !!errors.F_OccupationTypeMaster}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.occupations.length === 0 && <option value="1">Salaried</option>}
                                                                    {dropdowns.occupations.length === 0 && <option value="2">Self-Employed</option>}
                                                                    {dropdowns.occupations.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="F_OccupationTypeMaster" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Years in Business / Employed</Label>
                                                                <Input type="text" name="YearsInBusinessOrJob" placeholder="e.g. 5" value={values.YearsInBusinessOrJob} onChange={handleChange} onBlur={handleBlur} invalid={touched.YearsInBusinessOrJob && !!errors.YearsInBusinessOrJob} />
                                                                <ErrorMessage name="YearsInBusinessOrJob" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Monthly Income (₹) <span className="text-danger">*</span></Label>
                                                                <Input type="number" name="MonthlyIncome" placeholder="e.g. 25000" value={values.MonthlyIncome} onChange={handleChange} onBlur={handleBlur} invalid={touched.MonthlyIncome && !!errors.MonthlyIncome} />
                                                                <ErrorMessage name="MonthlyIncome" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Business Address</Label>
                                                                <Input type="textarea" name="BusinessAddress" placeholder="Business / workplace address" value={values.BusinessAddress} onChange={handleChange} onBlur={handleBlur} invalid={touched.BusinessAddress && !!errors.BusinessAddress} />
                                                                <ErrorMessage name="BusinessAddress" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Customer Photo <span className="text-danger">*</span></Label>
                                                                <Input type="file" name="CustomerPhoto" onChange={(e) => setFieldValue('CustomerPhoto', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.CustomerPhoto && !!errors.CustomerPhoto} />
                                                                <ErrorMessage name="CustomerPhoto" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>ITR Available?</Label>
                                                                <Input type="select" name="IsITRAvailable" value={values.IsITRAvailable} onChange={handleChange} onBlur={handleBlur} invalid={touched.IsITRAvailable && !!errors.IsITRAvailable}>
                                                                    <option value="false">No</option>
                                                                    <option value="true">Yes</option>
                                                                </Input>
                                                                <ErrorMessage name="IsITRAvailable" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4" style={{ display: 'none' }}>
                                                            <FormGroup className="mb-0">
                                                                <Label>Field Unit / Centre (MFI only)</Label>
                                                                <Input type="select" name="F_FieldUnitCentre" value={values.F_FieldUnitCentre} onChange={handleChange} onBlur={handleBlur} invalid={touched.F_FieldUnitCentre && !!errors.F_FieldUnitCentre}>
                                                                    <option value="">-- Select Centre --</option>
                                                                    {dropdowns.fieldUnits.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="F_FieldUnitCentre" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4" style={{ display: 'none' }}>
                                                            <FormGroup className="mb-0">
                                                                <Label>Member Group (MFI only)</Label>
                                                                <Input type="select" name="F_MemberGroup" value={values.F_MemberGroup} onChange={handleChange} onBlur={handleBlur} invalid={touched.F_MemberGroup && !!errors.F_MemberGroup}>
                                                                    <option value="">-- Select Group --</option>
                                                                    {dropdowns.memberGroups.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="F_MemberGroup" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        {/* Dynamic Bank Accounts Array */}
                                                        <Col md="12" className="mt-3">
                                                            <Card className="border border-primary bg-light-primary mb-0 shadow-sm">
                                                                <CardBody>
                                                                    <h6 className="mb-3 text-primary"><i className="fa fa-bank me-2"></i> Bank Account Detail (Multiple Allowed)</h6>
                                                                    <FieldArray name="BankAccounts">
                                                                        {({ push, remove }: any) => (
                                                                            <>
                                                                                {values.BankAccounts.map((account, index) => {
                                                                                    const rowErrors = (errors.BankAccounts as any)?.[index];
                                                                                    const rowTouched = (touched.BankAccounts as any)?.[index];
                                                                                    return (
                                                                                        <Row className="gy-2 mb-3 align-items-end" key={index}>
                                                                                            <Col md="3">
                                                                                                <FormGroup className="mb-0">
                                                                                                    <Label>Bank Name <span className="text-danger">*</span></Label>
                                                                                                    <Input type="text" name={`BankAccounts[${index}].BankName`} placeholder="e.g. State Bank of India" value={account.BankName} onChange={handleChange} onBlur={handleBlur} invalid={rowTouched?.BankName && !!rowErrors?.BankName} />
                                                                                                    <ErrorMessage name={`BankAccounts[${index}].BankName`} component="div" className="text-danger small mt-1" />
                                                                                                    {/* <HelperText text="Used in: Disbursement via NEFT/IMPS, NACH mandate setup" /> */}
                                                                                                </FormGroup>
                                                                                            </Col>
                                                                                            <Col md="3">
                                                                                                <FormGroup className="mb-0">
                                                                                                    <Label>Account Number <span className="text-danger">*</span></Label>
                                                                                                    <Input type="text" name={`BankAccounts[${index}].AccountNumber`} placeholder="Enter account number" value={account.AccountNumber} onChange={handleChange} onBlur={handleBlur} invalid={rowTouched?.AccountNumber && !!rowErrors?.AccountNumber} />
                                                                                                    <ErrorMessage name={`BankAccounts[${index}].AccountNumber`} component="div" className="text-danger small mt-1" />
                                                                                                    {/* <HelperText text="Verified via penny drop / NACH verification" /> */}
                                                                                                </FormGroup>
                                                                                            </Col>
                                                                                            <Col md="3">
                                                                                                <FormGroup className="mb-0">
                                                                                                    <Label>IFSC Code <span className="text-danger">*</span></Label>
                                                                                                    <Input type="text" name={`BankAccounts[${index}].IFSCCode`} placeholder="SBIN0001234" value={account.IFSCCode} onChange={handleChange} onBlur={handleBlur} invalid={rowTouched?.IFSCCode && !!rowErrors?.IFSCCode} />
                                                                                                    <ErrorMessage name={`BankAccounts[${index}].IFSCCode`} component="div" className="text-danger small mt-1" />
                                                                                                </FormGroup>
                                                                                            </Col>
                                                                                            <Col md="2">
                                                                                                <FormGroup className="mb-0">
                                                                                                    <Label>Account Type</Label>
                                                                                                    <Input type="select" name={`BankAccounts[${index}].F_AccountTypeMaster`} value={account.F_AccountTypeMaster} onChange={handleChange} onBlur={handleBlur} invalid={rowTouched?.F_AccountTypeMaster && !!rowErrors?.F_AccountTypeMaster}>
                                                                                                        <option value="">-- Select --</option>
                                                                                                        {dropdowns.accountTypes.length === 0 && (
                                                                                                            <>
                                                                                                                <option value="1">Savings</option>
                                                                                                                <option value="2">Current</option>
                                                                                                                <option value="3">CC/OD</option>
                                                                                                            </>
                                                                                                        )}
                                                                                                        {dropdowns.accountTypes.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                                                    </Input>
                                                                                                    <ErrorMessage name={`BankAccounts[${index}].F_AccountTypeMaster`} component="div" className="text-danger small mt-1" />
                                                                                                </FormGroup>
                                                                                            </Col>
                                                                                            <Col md="1" className="text-end">
                                                                                                {values.BankAccounts.length > 1 && (
                                                                                                    <Btn color="danger" outline type="button" onClick={() => remove(index)} className="px-2 py-1">
                                                                                                        <i className="fa fa-trash"></i>
                                                                                                    </Btn>
                                                                                                )}
                                                                                            </Col>
                                                                                        </Row>
                                                                                    )
                                                                                })}
                                                                                <Row>
                                                                                    <Col xs="12">
                                                                                        <Btn color="primary" outline type="button" onClick={() => push({ BankName: '', AccountNumber: '', IFSCCode: '', F_AccountTypeMaster: '' })} className="d-flex align-items-center gap-2">
                                                                                            <i className="fa fa-plus"></i> Add Another Bank Account
                                                                                        </Btn>
                                                                                    </Col>
                                                                                </Row>
                                                                            </>
                                                                        )}
                                                                    </FieldArray>
                                                                </CardBody>
                                                            </Card>
                                                        </Col>
                                                    </Row>
                                                    <div className="d-flex align-items-center gap-2 mt-4 pt-3 border-top">
                                                        <Btn color="primary" type="submit" disabled={isSubmitting} className="d-flex align-items-center gap-2 px-4 shadow-sm">
                                                            <i className="fa fa-arrow-right"></i> Move to next tab
                                                        </Btn>
                                                        <Btn color="light" type="button" className="text-dark d-flex align-items-center gap-2 px-4 border">
                                                            <i className="fa fa-pencil-square-o"></i> Save as Draft
                                                        </Btn>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>
                                    </TabPane>
                                    <TabPane tabId="2">
                                        <Formik<KYCFormValues>
                                            initialValues={initialKYCSavedValues}
                                            validationSchema={kycValidationSchema}
                                            onSubmit={handleKYCSubmit}
                                            enableReinitialize
                                        >
                                            {({ values, handleChange, handleBlur, errors, touched, setFieldValue, isSubmitting }: FormikProps<KYCFormValues>) => (
                                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                                    <Row className="gy-0">
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>ID Proof Type <span className="text-danger">*</span></Label>
                                                                <Input type="select" name="F_ProofTypeMaster" value={values.F_ProofTypeMaster} onChange={handleChange} onBlur={handleBlur} invalid={touched.F_ProofTypeMaster && !!errors.F_ProofTypeMaster}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.idProofTypes.length === 0 && <option value="1">Aadhaar Card</option>}
                                                                    {dropdowns.idProofTypes.length === 0 && <option value="2">Voter ID</option>}
                                                                    {dropdowns.idProofTypes.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="F_ProofTypeMaster" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>ID Proof Front <span className="text-danger">*</span></Label>
                                                                <Input type="file" name="IDProofFront" onChange={(e) => setFieldValue('IDProofFront', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.IDProofFront && !!errors.IDProofFront} />
                                                                <ErrorMessage name="IDProofFront" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>ID Proof Back Side</Label>
                                                                <Input type="file" name="IDProofBack" onChange={(e) => setFieldValue('IDProofBack', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.IDProofBack && !!errors.IDProofBack} />
                                                                <ErrorMessage name="IDProofBack" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Address Proof Type <span className="text-danger">*</span></Label>
                                                                <Input type="select" name="F_AddressProofTypeMaster" value={values.F_AddressProofTypeMaster} onChange={handleChange} onBlur={handleBlur} invalid={touched.F_AddressProofTypeMaster && !!errors.F_AddressProofTypeMaster}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.addressProofTypes.length === 0 && <option value="1">Utility Bill</option>}
                                                                    {dropdowns.addressProofTypes.length === 0 && <option value="2">Ration Card</option>}
                                                                    {dropdowns.addressProofTypes.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="F_AddressProofTypeMaster" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Address Proof Upload <span className="text-danger">*</span></Label>
                                                                <Input type="file" name="AddressProofFile" onChange={(e) => setFieldValue('AddressProofFile', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.AddressProofFile && !!errors.AddressProofFile} />
                                                                <ErrorMessage name="AddressProofFile" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Photograph <span className="text-danger">*</span></Label>
                                                                <Input type="file" name="Photograph" onChange={(e) => setFieldValue('Photograph', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.Photograph && !!errors.Photograph} />
                                                                <ErrorMessage name="Photograph" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Signature Upload <span className="text-danger">*</span></Label>
                                                                <Input type="file" name="SignatureFile" onChange={(e) => setFieldValue('SignatureFile', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.SignatureFile && !!errors.SignatureFile} />
                                                                <ErrorMessage name="SignatureFile" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>ITR / Income Proof</Label>
                                                                <Input type="file" name="ITRProofFile" onChange={(e) => setFieldValue('ITRProofFile', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.ITRProofFile && !!errors.ITRProofFile} />
                                                                <ErrorMessage name="ITRProofFile" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        {/* Verification Actions Box */}
                                                        <Col md="12" className="mt-4">
                                                            <Card className="border border-info bg-light-info mb-0 shadow-sm">
                                                                <CardBody>
                                                                    <h6 className="mb-3 text-info"><i className="fa fa-search me-2"></i> Verification Actions</h6>
                                                                    <Row className="gy-0">
                                                                        <Col md="4">
                                                                            <FormGroup className="mb-0">
                                                                                <Label>CKYC Status</Label>
                                                                                <Input type="select" name="CKYCStatus" value={values.CKYCStatus} onChange={handleChange} onBlur={handleBlur}>
                                                                                    <option value="Not Checked">Not Checked</option>
                                                                                    <option value="Checked">Checked</option>
                                                                                </Input>
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col md="4">
                                                                            <FormGroup className="mb-0">
                                                                                <Label>Credit Bureau</Label>
                                                                                <Input type="select" name="CreditBureau" value={values.CreditBureau} onChange={handleChange} onBlur={handleBlur}>
                                                                                    <option value="Not Fetched">Not Fetched</option>
                                                                                    <option value="Fetched">Fetched</option>
                                                                                </Input>
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col md="4">
                                                                            <FormGroup className="mb-0">
                                                                                <Label>Credit Score (Auto-fetched)</Label>
                                                                                <Input type="text" name="CreditScore" placeholder="e.g. 750" value={values.CreditScore} onChange={handleChange} onBlur={handleBlur} />
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col md="4">
                                                                            <FormGroup className="mb-0">
                                                                                <Label>Internal Risk Grade (Auto)</Label>
                                                                                <Input type="text" name="InternalRiskGrade" placeholder="A / B / C / D" value={values.InternalRiskGrade} onChange={handleChange} onBlur={handleBlur} />
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col md="4">
                                                                            <FormGroup className="mb-0">
                                                                                <Label>Fingerprint Auth (Optional)</Label>
                                                                                <Input type="select" name="FingerprintAuth" value={values.FingerprintAuth} onChange={handleChange} onBlur={handleBlur}>
                                                                                    <option value="Not Required">Not Required</option>
                                                                                    <option value="Required">Required</option>
                                                                                </Input>
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col md="4">
                                                                            <FormGroup className="mb-0">
                                                                                <Label>Aadhaar E-Sign</Label>
                                                                                <Input type="select" name="AadhaarESign" value={values.AadhaarESign} onChange={handleChange} onBlur={handleBlur}>
                                                                                    <option value="Pending">Pending</option>
                                                                                    <option value="Completed">Completed</option>
                                                                                </Input>
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                </CardBody>
                                                            </Card>
                                                        </Col>
                                                    </Row>
                                                    <div className="d-flex align-items-center gap-2 mt-4 pt-3 border-top">
                                                        <Btn color="success" type="button" onClick={() => handleKYCSave(values)} className="d-flex align-items-center gap-2 px-4 shadow-sm">
                                                            <i className="fa fa-save"></i> Save KYC Data
                                                        </Btn>
                                                        <Btn color="info" type="button" className="d-flex align-items-center gap-2 px-4 shadow-sm">
                                                            <i className="fa fa-check-circle"></i> Verify KYC Docs
                                                        </Btn>
                                                        <Btn color="warning" type="button" className="text-dark d-flex align-items-center gap-2 px-4 shadow-sm">
                                                            <i className="fa fa-dashboard"></i> Fetch Credit Bureau
                                                        </Btn>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 mt-3">
                                                        <Btn color="primary" type="submit" disabled={isSubmitting} className="d-flex align-items-center gap-2 px-4 shadow-sm">
                                                            <i className="fa fa-save"></i> Save & Proceed to Approve
                                                        </Btn>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>
                                    </TabPane>
                                    <TabPane tabId="3">
                                        {Object.keys(savedData).length > 0 ? (
                                            <div>
                                                <h5 className="mb-4">Customer Preview Summary</h5>
                                                <Row className="gy-3 mb-4">
                                                    <Col md="4"><strong>Full Name:</strong> {savedData.Name}</Col>
                                                    <Col md="4"><strong>Mobile:</strong> {savedData.MobileNo}</Col>
                                                    <Col md="4"><strong>DOB:</strong> {savedData.DateOfBirth}</Col>
                                                    <Col md="4"><strong>Gender:</strong> {savedData.Gender}</Col>
                                                    <Col md="4"><strong>Aadhaar:</strong> {savedData.AadhaarNo}</Col>
                                                    <Col md="4"><strong>PAN:</strong> {savedData.PAN}</Col>
                                                    <Col md="8"><strong>Current Address:</strong> {savedData.CurrentAddress}, City ID: {savedData.F_CityMaster}, State ID: {savedData.F_StateMaster} - {savedData.Pincode}</Col>
                                                    <Col md="4"><strong>Monthly Income:</strong> ₹{savedData.MonthlyIncome}</Col>
                                                    <Col md="4"><strong>Occupation:</strong> {savedData.F_OccupationTypeMaster}</Col>
                                                </Row>
                                                <div className="p-3 bg-light border rounded">
                                                    <h6>Saved Bank Accounts: {savedData.BankAccounts?.length || 0}</h6>
                                                    <ul className="mb-0">
                                                        {savedData.BankAccounts?.map((acc, idx) => (
                                                            <li key={idx}><strong>{acc.BankName}</strong> - {acc.AccountNumber} ({acc.IFSCCode})</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="d-flex align-items-center gap-2 mt-4 pt-3 border-top">
                                                    <Btn color="success" type="button" className="d-flex align-items-center gap-2 px-4 shadow-sm">
                                                        <i className="fa fa-check"></i> Approve Customer
                                                    </Btn>
                                                    <Btn color="danger" type="button" className="d-flex align-items-center gap-2 px-4 shadow-sm">
                                                        <i className="fa fa-times"></i> Reject KYC
                                                    </Btn>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-5 text-muted">
                                                <h4>No Registration Data</h4>
                                                <p>Please complete the Basic Info and KYC tabs first.</p>
                                            </div>
                                        )}
                                    </TabPane>
                                </TabContent>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CustomerRegistration;
