import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage, FieldArray } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_FillListData } from "../../store/Functions";
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
    AccountType: string;
}

interface CustomerFormValues {
    FullName: string;
    DOB: string;
    Gender: string;
    MobileNumber: string;
    AlternateMobile: string;
    EmailAddress: string;
    AadhaarNumber: string;
    PANNumber: string;
    CurrentAddress: string;
    City: string;
    State: string;
    PINCode: string;
    GPSLocation: string;
    Occupation: string;
    YearsInBusiness: string;
    MonthlyIncome: string;
    BusinessAddress: string;
    CustomerPhoto: any;
    ITRAvailable: string;
    FieldUnitCentre: string;
    MemberGroup: string;
    BankAccounts: BankAccount[];
}

const initialValues: CustomerFormValues = {
    FullName: "",
    DOB: "",
    Gender: "",
    MobileNumber: "",
    AlternateMobile: "",
    EmailAddress: "",
    AadhaarNumber: "",
    PANNumber: "",
    CurrentAddress: "",
    City: "",
    State: "",
    PINCode: "",
    GPSLocation: "",
    Occupation: "",
    YearsInBusiness: "",
    MonthlyIncome: "",
    BusinessAddress: "",
    CustomerPhoto: null,
    ITRAvailable: "No",
    FieldUnitCentre: "",
    MemberGroup: "",
    BankAccounts: [
        { BankName: "", AccountNumber: "", IFSCCode: "", AccountType: "Savings" }
    ],
};

interface KYCFormValues {
    IDProofType: string;
    IDProofUpload: any;
    IDProofBackSide: any;
    AddressProofType: string;
    AddressProofUpload: any;
    Photograph: any;
    SignatureUpload: any;
    ITRIncomeProof: any;
    CKYCStatus: string;
    CreditBureau: string;
    CreditScore: string;
    InternalRiskGrade: string;
    FingerprintAuth: string;
    AadhaarESign: string;
}

const initialKYCValues: KYCFormValues = {
    IDProofType: "",
    IDProofUpload: null,
    IDProofBackSide: null,
    AddressProofType: "",
    AddressProofUpload: null,
    Photograph: null,
    SignatureUpload: null,
    ITRIncomeProof: null,
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
        occupations: [],
        fieldUnits: [],
        memberGroups: [],
        accountTypes: [],
        idProofTypes: [],
        addressProofTypes: []
    });

    const MASTER_URL = `${API_WEB_URLS.MASTER}/0/token`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                FullName: Yup.string().trim().required("Full Name is required"),
                DOB: Yup.date().required("Date of Birth is required").nullable(),
                Gender: Yup.string().required("Gender is required"),
                MobileNumber: Yup.string().matches(/^[0-9]{10}$/, "Must be a 10-digit number").required("Mobile Number is required"),
                AadhaarNumber: Yup.string().matches(/^[0-9]{12}$/, "Must be a 12-digit number").required("Aadhaar Number is required"),
                PANNumber: Yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").required("PAN Number is required"),
                CurrentAddress: Yup.string().required("Current Address is required"),
                City: Yup.string().required("City is required"),
                State: Yup.string().required("State is required"),
                PINCode: Yup.string().matches(/^[0-9]{6}$/, "Must be a 6-digit number").required("PIN Code is required"),
                Occupation: Yup.string().required("Occupation is required"),
                MonthlyIncome: Yup.number().typeError("Must be a number").required("Monthly Income is required"),
                BankAccounts: Yup.array().of(
                    Yup.object().shape({
                        BankName: Yup.string().required("Bank Name is required"),
                        AccountNumber: Yup.string().required("Account Number is required"),
                        IFSCCode: Yup.string().required("IFSC Code is required"),
                    })
                ).min(1, "At least one bank account is required")
            }),
        []
    );

    const kycValidationSchema = useMemo(
        () =>
            Yup.object({
                IDProofType: Yup.string().required("ID Proof Type is required"),
                IDProofUpload: Yup.mixed().required("ID Proof is required"),
                AddressProofType: Yup.string().required("Address Proof Type is required"),
                AddressProofUpload: Yup.mixed().required("Address Proof is required"),
                Photograph: Yup.mixed().required("Photograph is required"),
                SignatureUpload: Yup.mixed().required("Signature is required"),
            }),
        []
    );

    useEffect(() => {
        nameRef.current?.focus();
        Fn_FillListData(dispatch, setDropdowns, "genders", `${MASTER_URL}/GenderMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "states", `${MASTER_URL}/StateMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "occupations", `${MASTER_URL}/OccupationMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "fieldUnits", `${MASTER_URL}/FieldUnitMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "memberGroups", `${MASTER_URL}/MemberGroupMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "accountTypes", `${MASTER_URL}/AccountTypeMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "idProofTypes", `${MASTER_URL}/IDProofMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "addressProofTypes", `${MASTER_URL}/AddressProofMaster/Id/0`);
    }, [dispatch, MASTER_URL]);

    const initialFormValues: CustomerFormValues = {
        ...initialValues,
        ...savedData
    };

    const initialKYCSavedValues: KYCFormValues = {
        ...initialKYCValues,
        ...savedKYCData
    };

    const handleSubmit = async (values: CustomerFormValues, { setSubmitting }: FormikHelpers<CustomerFormValues>) => {
        try {
            console.log("Submitting Basic Info payload:", values);
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
                                                                <Label>Full Name <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="FullName" placeholder="As per Aadhaar/PAN" value={values.FullName} onChange={handleChange} onBlur={handleBlur} invalid={touched.FullName && !!errors.FullName} innerRef={nameRef} />
                                                                <ErrorMessage name="FullName" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Date of Birth <span className="text-danger">*</span></Label>
                                                                <Input type="date" name="DOB" value={values.DOB} onChange={handleChange} onBlur={handleBlur} invalid={touched.DOB && !!errors.DOB} />
                                                                <ErrorMessage name="DOB" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Gender <span className="text-danger">*</span></Label>
                                                                <Input type="select" name="Gender" value={values.Gender} onChange={handleChange} onBlur={handleBlur} invalid={touched.Gender && !!errors.Gender}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.genders.length === 0 && (
                                                                        <>
                                                                            <option value="Male">Male</option>
                                                                            <option value="Female">Female</option>
                                                                            <option value="Other">Other</option>
                                                                        </>
                                                                    )}
                                                                    {dropdowns.genders.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="Gender" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Mobile Number <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="MobileNumber" placeholder="10-digit mobile" value={values.MobileNumber} onChange={handleChange} onBlur={handleBlur} invalid={touched.MobileNumber && !!errors.MobileNumber} />
                                                                <ErrorMessage name="MobileNumber" component="div" className="text-danger small mt-1" />
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
                                                                <Input type="email" name="EmailAddress" placeholder="customer@email.com" value={values.EmailAddress} onChange={handleChange} onBlur={handleBlur} invalid={touched.EmailAddress && !!errors.EmailAddress} />
                                                                <ErrorMessage name="EmailAddress" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Aadhaar Number <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="AadhaarNumber" placeholder="XXXX-XXXX-XXXX" value={values.AadhaarNumber} onChange={handleChange} onBlur={handleBlur} invalid={touched.AadhaarNumber && !!errors.AadhaarNumber} />
                                                                <ErrorMessage name="AadhaarNumber" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>PAN Number <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="PANNumber" placeholder="ABCDE1234F" value={values.PANNumber} onChange={handleChange} onBlur={handleBlur} invalid={touched.PANNumber && !!errors.PANNumber} />
                                                                <ErrorMessage name="PANNumber" component="div" className="text-danger small mt-1" />
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
                                                                <Label>City <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="City" value={values.City} onChange={handleChange} onBlur={handleBlur} invalid={touched.City && !!errors.City} />
                                                                <ErrorMessage name="City" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>State <span className="text-danger">*</span></Label>
                                                                <Input type="select" name="State" value={values.State} onChange={handleChange} onBlur={handleBlur} invalid={touched.State && !!errors.State}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.states.length === 0 && <option value="1">Mock State</option>}
                                                                    {dropdowns.states.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="State" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>PIN Code <span className="text-danger">*</span></Label>
                                                                <Input type="text" name="PINCode" value={values.PINCode} onChange={handleChange} onBlur={handleBlur} invalid={touched.PINCode && !!errors.PINCode} />
                                                                <ErrorMessage name="PINCode" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>GPS Location</Label>
                                                                <Input type="text" name="GPSLocation" placeholder="Lat, Long (auto-capture or manual)" value={values.GPSLocation} onChange={handleChange} onBlur={handleBlur} invalid={touched.GPSLocation && !!errors.GPSLocation} />
                                                                <ErrorMessage name="GPSLocation" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Occupation / Business Type <span className="text-danger">*</span></Label>
                                                                <Input type="select" name="Occupation" value={values.Occupation} onChange={handleChange} onBlur={handleBlur} invalid={touched.Occupation && !!errors.Occupation}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.occupations.length === 0 && <option value="1">Salaried</option>}
                                                                    {dropdowns.occupations.length === 0 && <option value="2">Self-Employed</option>}
                                                                    {dropdowns.occupations.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="Occupation" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Years in Business / Employed</Label>
                                                                <Input type="text" name="YearsInBusiness" placeholder="e.g. 5" value={values.YearsInBusiness} onChange={handleChange} onBlur={handleBlur} invalid={touched.YearsInBusiness && !!errors.YearsInBusiness} />
                                                                <ErrorMessage name="YearsInBusiness" component="div" className="text-danger small mt-1" />
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
                                                                <Input type="select" name="ITRAvailable" value={values.ITRAvailable} onChange={handleChange} onBlur={handleBlur} invalid={touched.ITRAvailable && !!errors.ITRAvailable}>
                                                                    <option value="No">No</option>
                                                                    <option value="Yes">Yes</option>
                                                                </Input>
                                                                <ErrorMessage name="ITRAvailable" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Field Unit / Centre (MFI only)</Label>
                                                                <Input type="select" name="FieldUnitCentre" value={values.FieldUnitCentre} onChange={handleChange} onBlur={handleBlur} invalid={touched.FieldUnitCentre && !!errors.FieldUnitCentre}>
                                                                    <option value="">-- Select Centre --</option>
                                                                    {dropdowns.fieldUnits.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="FieldUnitCentre" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Member Group (MFI only)</Label>
                                                                <Input type="select" name="MemberGroup" value={values.MemberGroup} onChange={handleChange} onBlur={handleBlur} invalid={touched.MemberGroup && !!errors.MemberGroup}>
                                                                    <option value="">-- Select Group --</option>
                                                                    {dropdowns.memberGroups.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="MemberGroup" component="div" className="text-danger small mt-1" />
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
                                                                                                    <Input type="select" name={`BankAccounts[${index}].AccountType`} value={account.AccountType} onChange={handleChange} onBlur={handleBlur} invalid={rowTouched?.AccountType && !!rowErrors?.AccountType}>
                                                                                                        <option value="Savings">Savings</option>
                                                                                                        <option value="Current">Current</option>
                                                                                                        <option value="CC/OD">CC/OD</option>
                                                                                                    </Input>
                                                                                                    <ErrorMessage name={`BankAccounts[${index}].AccountType`} component="div" className="text-danger small mt-1" />
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
                                                                                        <Btn color="primary" outline type="button" onClick={() => push({ BankName: '', AccountNumber: '', IFSCCode: '', AccountType: 'Savings' })} className="d-flex align-items-center gap-2">
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
                                                            <i className="fa fa-save"></i> Save & Proceed to KYC
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
                                                                <Input type="select" name="IDProofType" value={values.IDProofType} onChange={handleChange} onBlur={handleBlur} invalid={touched.IDProofType && !!errors.IDProofType}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.idProofTypes.length === 0 && <option value="1">Aadhaar Card</option>}
                                                                    {dropdowns.idProofTypes.length === 0 && <option value="2">Voter ID</option>}
                                                                    {dropdowns.idProofTypes.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="IDProofType" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>ID Proof Upload <span className="text-danger">*</span></Label>
                                                                <Input type="file" name="IDProofUpload" onChange={(e) => setFieldValue('IDProofUpload', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.IDProofUpload && !!errors.IDProofUpload} />
                                                                <ErrorMessage name="IDProofUpload" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>ID Proof Back Side</Label>
                                                                <Input type="file" name="IDProofBackSide" onChange={(e) => setFieldValue('IDProofBackSide', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.IDProofBackSide && !!errors.IDProofBackSide} />
                                                                <ErrorMessage name="IDProofBackSide" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Address Proof Type <span className="text-danger">*</span></Label>
                                                                <Input type="select" name="AddressProofType" value={values.AddressProofType} onChange={handleChange} onBlur={handleBlur} invalid={touched.AddressProofType && !!errors.AddressProofType}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.addressProofTypes.length === 0 && <option value="1">Utility Bill</option>}
                                                                    {dropdowns.addressProofTypes.length === 0 && <option value="2">Ration Card</option>}
                                                                    {dropdowns.addressProofTypes.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                </Input>
                                                                <ErrorMessage name="AddressProofType" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Address Proof Upload <span className="text-danger">*</span></Label>
                                                                <Input type="file" name="AddressProofUpload" onChange={(e) => setFieldValue('AddressProofUpload', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.AddressProofUpload && !!errors.AddressProofUpload} />
                                                                <ErrorMessage name="AddressProofUpload" component="div" className="text-danger small mt-1" />
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
                                                                <Input type="file" name="SignatureUpload" onChange={(e) => setFieldValue('SignatureUpload', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.SignatureUpload && !!errors.SignatureUpload} />
                                                                <ErrorMessage name="SignatureUpload" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>ITR / Income Proof</Label>
                                                                <Input type="file" name="ITRIncomeProof" onChange={(e) => setFieldValue('ITRIncomeProof', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.ITRIncomeProof && !!errors.ITRIncomeProof} />
                                                                <ErrorMessage name="ITRIncomeProof" component="div" className="text-danger small mt-1" />
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
                                                    <Col md="4"><strong>Full Name:</strong> {savedData.FullName}</Col>
                                                    <Col md="4"><strong>Mobile:</strong> {savedData.MobileNumber}</Col>
                                                    <Col md="4"><strong>DOB:</strong> {savedData.DOB}</Col>
                                                    <Col md="4"><strong>Gender:</strong> {savedData.Gender}</Col>
                                                    <Col md="4"><strong>Aadhaar:</strong> {savedData.AadhaarNumber}</Col>
                                                    <Col md="4"><strong>PAN:</strong> {savedData.PANNumber}</Col>
                                                    <Col md="8"><strong>Current Address:</strong> {savedData.CurrentAddress}, {savedData.City}, {savedData.State} - {savedData.PINCode}</Col>
                                                    <Col md="4"><strong>Monthly Income:</strong> ₹{savedData.MonthlyIncome}</Col>
                                                    <Col md="4"><strong>Occupation:</strong> {savedData.Occupation}</Col>
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
