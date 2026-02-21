import React, { useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import * as Yup from "yup";
import { Card, CardBody, CardHeader, Col, Container, FormGroup, Input, Label, Row, Alert } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";

interface LoanAppFormValues {
    CustomerID: string;
    LoanScheme: string;
    LoanAmount: string;
    Tenure: string;
    ApplicationDate: string;
    PurposeOfLoan: string;
    DisbursementMode: string;
    DisbursementBankAccount: string;
    NACHSetup: string;
    GPSLocation: string;

    // Co-Applicant
    CoApplicantName: string;
    Relationship: string;
    CoAppAadhaarPAN: string;
    CoAppMonthlyIncome: string;

    // Guarantor
    GuarantorCustomerID: string;
    GuarantorCIBILScore: string;
    GuarantorAadhaar: string;
    GuarantorPAN: string;

    // Documents
    LoanAppFormFile: any;
    IncomeDocumentsFile: any;
    BusinessProofFile: any;
    OtherDocsFile: any;
}

const initialValues: LoanAppFormValues = {
    CustomerID: "",
    LoanScheme: "",
    LoanAmount: "",
    Tenure: "",
    ApplicationDate: "", // default could be today's date
    PurposeOfLoan: "",
    DisbursementMode: "",
    DisbursementBankAccount: "",
    NACHSetup: "No",
    GPSLocation: "",

    CoApplicantName: "",
    Relationship: "",
    CoAppAadhaarPAN: "",
    CoAppMonthlyIncome: "",

    GuarantorCustomerID: "",
    GuarantorCIBILScore: "Auto-filled", // mockup text
    GuarantorAadhaar: "",
    GuarantorPAN: "",

    LoanAppFormFile: null,
    IncomeDocumentsFile: null,
    BusinessProofFile: null,
    OtherDocsFile: null,
};

interface DropdownState {
    schemes: Array<{ Id?: number; Name?: string }>;
    tenures: Array<{ Id?: number; Name?: string }>;
    purposes: Array<{ Id?: number; Name?: string }>;
    customerBanks: Array<{ Id?: number; Name?: string }>;
    relationships: Array<{ Id?: number; Name?: string }>;
}

const LoanApplication = () => {
    const dispatch = useDispatch();
    const customerIdRef = useRef<HTMLInputElement | null>(null);

    const [dropdowns, setDropdowns] = useState<DropdownState>({
        schemes: [],
        tenures: [],
        purposes: [],
        customerBanks: [],
        relationships: []
    });

    const MASTER_URL = `${API_WEB_URLS.MASTER}/0/token`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                CustomerID: Yup.string().required("Customer ID is required"),
                LoanScheme: Yup.string().required("Loan Scheme is required"),
                LoanAmount: Yup.number().typeError("Must be a number").required("Loan Amount is required"),
                Tenure: Yup.string().required("Tenure is required"),
                ApplicationDate: Yup.date().required("Application Date is required").nullable(),
                PurposeOfLoan: Yup.string().required("Purpose of Loan is required"),
                DisbursementMode: Yup.string().required("Disbursement Mode is required"),
                DisbursementBankAccount: Yup.string().required("Disbursement Bank Account is required"),

                // File upload validation
                LoanAppFormFile: Yup.mixed().required("Signed Application Form is required"),

                // Co-applicant validation (if fields are filled)
                CoAppMonthlyIncome: Yup.number().typeError("Must be a number").nullable(),
            }),
        []
    );

    useEffect(() => {
        customerIdRef.current?.focus();
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        initialValues.ApplicationDate = today;

        // Fetch Dropdowns
        // Real endpoints might differ, using placeholder IDs for now
        Fn_FillListData(dispatch, setDropdowns, "schemes", `${MASTER_URL}/LoanSchemeMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "purposes", `${MASTER_URL}/LoanPurposeMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "relationships", `${MASTER_URL}/RelationshipMaster/Id/0`);
    }, [dispatch, MASTER_URL]);

    const handleSubmit = async (values: LoanAppFormValues, { setSubmitting, resetForm }: FormikHelpers<LoanAppFormValues>) => {
        try {
            console.log("Submitting Loan Application:", values);
            // Submit API Call would go here
            setTimeout(() => {
                setSubmitting(false);
                alert("Application Submitted!");
                // resetForm(); // optional
            }, 1000);
        } catch (error) {
            console.error("Submission failed:", error);
            setSubmitting(false);
        }
    };

    const HelperText = ({ text }: { text: string }) => (
        <div className="text-muted small mt-1" style={{ fontSize: "0.80rem", fontStyle: "italic" }}>
            <i className="fa fa-thumb-tack text-danger me-1"></i> {text}
        </div>
    );

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Loan Application" parent="Customer & Loan" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Card>
                            <CardBody>
                                <Formik<LoanAppFormValues>
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                    enableReinitialize
                                >
                                    {({ values, handleChange, handleBlur, errors, touched, setFieldValue, isSubmitting }: FormikProps<LoanAppFormValues>) => (
                                        <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                            <Row className="gy-3">
                                                {/* Primary Application Details */}
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Customer ID / Search <span className="text-danger">*</span></Label>
                                                        <Input type="text" name="CustomerID" placeholder="Search by Customer ID / Name / Mobile" value={values.CustomerID} onChange={handleChange} onBlur={handleBlur} invalid={touched.CustomerID && !!errors.CustomerID} innerRef={customerIdRef} />
                                                        <ErrorMessage name="CustomerID" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Only KYC-Approved customers visible. Auto-fills customer details." />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Loan Scheme <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="LoanScheme" value={values.LoanScheme} onChange={handleChange} onBlur={handleBlur} invalid={touched.LoanScheme && !!errors.LoanScheme}>
                                                            <option value="">-- Select Scheme --</option>
                                                            {dropdowns.schemes.length === 0 && <option value="1">Personal Loan Scheme</option>}
                                                            {dropdowns.schemes.length === 0 && <option value="2">Gold Loan Scheme</option>}
                                                            {dropdowns.schemes.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                        </Input>
                                                        <ErrorMessage name="LoanScheme" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Scheme selection drives: interest rate, tenure options, extra fields (Gold Loan)" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Loan Amount Requested (₹) <span className="text-danger">*</span></Label>
                                                        <Input type="number" name="LoanAmount" placeholder="e.g. 50000" value={values.LoanAmount} onChange={handleChange} onBlur={handleBlur} invalid={touched.LoanAmount && !!errors.LoanAmount} />
                                                        <ErrorMessage name="LoanAmount" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Validated against scheme Min/Max. For Gold: overridden by LTV calculation." />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Tenure <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="Tenure" value={values.Tenure} onChange={handleChange} onBlur={handleBlur} invalid={touched.Tenure && !!errors.Tenure}>
                                                            <option value="">-- Select Tenure --</option>
                                                            {dropdowns.tenures.length === 0 && <option value="12">12 Months</option>}
                                                            {dropdowns.tenures.length === 0 && <option value="24">24 Months</option>}
                                                            {dropdowns.tenures.length === 0 && <option value="36">36 Months</option>}
                                                            {dropdowns.tenures.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                        </Input>
                                                        <ErrorMessage name="Tenure" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Options from scheme config. Drives EMI schedule generation." />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Application Date <span className="text-danger">*</span></Label>
                                                        <Input type="date" name="ApplicationDate" value={values.ApplicationDate} onChange={handleChange} onBlur={handleBlur} invalid={touched.ApplicationDate && !!errors.ApplicationDate} />
                                                        <ErrorMessage name="ApplicationDate" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Purpose of Loan <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="PurposeOfLoan" value={values.PurposeOfLoan} onChange={handleChange} onBlur={handleBlur} invalid={touched.PurposeOfLoan && !!errors.PurposeOfLoan}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.purposes.length === 0 && <option value="1">Home Renovation</option>}
                                                            {dropdowns.purposes.length === 0 && <option value="2">Medical Emergency</option>}
                                                            {dropdowns.purposes.length === 0 && <option value="3">Business Expansion</option>}
                                                            {dropdowns.purposes.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                        </Input>
                                                        <ErrorMessage name="PurposeOfLoan" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Used in: Loan agreement, RBI portfolio classification" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Disbursement Mode <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="DisbursementMode" value={values.DisbursementMode} onChange={handleChange} onBlur={handleBlur} invalid={touched.DisbursementMode && !!errors.DisbursementMode}>
                                                            <option value="">-- Select --</option>
                                                            <option value="Bank Transfer (NEFT/IMPS)">Bank Transfer (NEFT/IMPS)</option>
                                                            <option value="Cash">Cash</option>
                                                        </Input>
                                                        <ErrorMessage name="DisbursementMode" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="Cash disbursement restricted by Branch Cash Limit rule" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Disbursement Bank Account <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="DisbursementBankAccount" value={values.DisbursementBankAccount} onChange={handleChange} onBlur={handleBlur} invalid={touched.DisbursementBankAccount && !!errors.DisbursementBankAccount}>
                                                            <option value="">-- Select Customer Bank --</option>
                                                            {dropdowns.customerBanks.length === 0 && <option value="1">State Bank of India - 1234xxx</option>}
                                                            {dropdowns.customerBanks.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                        </Input>
                                                        <ErrorMessage name="DisbursementBankAccount" component="div" className="text-danger small mt-1" />
                                                        <HelperText text="From customer's registered bank accounts" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>NACH / Auto-Debit Setup?</Label>
                                                        <Input type="select" name="NACHSetup" value={values.NACHSetup} onChange={handleChange} onBlur={handleBlur}>
                                                            <option value="No">No</option>
                                                            <option value="Yes">Yes</option>
                                                        </Input>
                                                        <HelperText text="If Yes: NACH sanction letter generated. Bank mandate registered." />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>GPS Location at Application</Label>
                                                        <Input type="text" name="GPSLocation" placeholder="Lat, Long" value={values.GPSLocation} onChange={handleChange} onBlur={handleBlur} />
                                                        <HelperText text="System auto-captures. Stored for field audit verification." />
                                                    </FormGroup>
                                                </Col>

                                                {/* Co-Applicant Details */}
                                                <Col md="12" className="mt-4">
                                                    <Card className="border border-primary bg-light-primary mb-0 shadow-sm">
                                                        <CardBody>
                                                            <h6 className="mb-3 text-primary"><i className="fa fa-users me-2"></i> Co-Applicant Details (Optional)</h6>
                                                            <Row className="gy-3">
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Co-Applicant Name</Label>
                                                                        <Input type="text" name="CoApplicantName" placeholder="Full name as per KYC" value={values.CoApplicantName} onChange={handleChange} onBlur={handleBlur} />
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Relationship with Applicant</Label>
                                                                        <Input type="select" name="Relationship" value={values.Relationship} onChange={handleChange} onBlur={handleBlur}>
                                                                            <option value="">-- Select --</option>
                                                                            {dropdowns.relationships.length === 0 && <>
                                                                                <option value="Spouse">Spouse</option>
                                                                                <option value="Parent">Parent</option>
                                                                                <option value="Sibling">Sibling</option>
                                                                            </>}
                                                                            {dropdowns.relationships.map(opt => <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>)}
                                                                        </Input>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Aadhaar / PAN</Label>
                                                                        <Input type="text" name="CoAppAadhaarPAN" placeholder="Co-applicant Aadhaar or PAN" value={values.CoAppAadhaarPAN} onChange={handleChange} onBlur={handleBlur} />
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Monthly Income (₹)</Label>
                                                                        <Input type="number" name="CoAppMonthlyIncome" placeholder="Income of co-applicant" value={values.CoAppMonthlyIncome} onChange={handleChange} onBlur={handleBlur} invalid={touched.CoAppMonthlyIncome && !!errors.CoAppMonthlyIncome} />
                                                                        <ErrorMessage name="CoAppMonthlyIncome" component="div" className="text-danger small mt-1" />
                                                                        <HelperText text="Added to primary income for FOIR calculation" />
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>
                                                        </CardBody>
                                                    </Card>
                                                </Col>

                                                {/* Guarantor Details */}
                                                <Col md="12" className="mt-4">
                                                    <Card className="border border-warning bg-light-warning mb-0 shadow-sm" style={{ backgroundColor: "#fffdf0" }}>
                                                        <CardBody>
                                                            <h6 className="mb-3 text-warning" style={{ color: "#e6a23c" }}><i className="fa fa-shield me-2"></i> Guarantor Details (If Required by Scheme)</h6>

                                                            <Alert color="warning" className="border-warning p-2 small mb-3 text-dark" style={{ backgroundColor: "#fdf6e3" }}>
                                                                <strong>Rule:</strong> A member acting as Guarantor CANNOT take a new loan until the guaranteed loan is closed. Enforce this check at application stage. Guarantor CIBIL must also be checked.
                                                            </Alert>

                                                            <Row className="gy-3">
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Guarantor Customer ID</Label>
                                                                        <Input type="text" name="GuarantorCustomerID" placeholder="Search existing customer as guarantor" value={values.GuarantorCustomerID} onChange={handleChange} onBlur={handleBlur} />
                                                                        <HelperText text="Must be an existing KYC-approved customer in the system" />
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Guarantor CIBIL Score (Auto-fetched)</Label>
                                                                        <Input type="text" name="GuarantorCIBILScore" value={values.GuarantorCIBILScore} disabled className="bg-light" />
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Guarantor Aadhaar</Label>
                                                                        <Input type="text" name="GuarantorAadhaar" placeholder="Verify guarantor identity" value={values.GuarantorAadhaar} onChange={handleChange} onBlur={handleBlur} />
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Guarantor PAN</Label>
                                                                        <Input type="text" name="GuarantorPAN" placeholder="For CIBIL check" value={values.GuarantorPAN} onChange={handleChange} onBlur={handleBlur} />
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>
                                                        </CardBody>
                                                    </Card>
                                                </Col>

                                                {/* Documents */}
                                                <Col md="12" className="mt-4">
                                                    <Card className="border border-info bg-light-info mb-0 shadow-sm">
                                                        <CardBody>
                                                            <h6 className="mb-3 text-info"><i className="fa fa-paperclip me-2"></i> Loan Application Documents</h6>
                                                            <Row className="gy-3">
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Loan Application Form (Signed) <span className="text-danger">*</span></Label>
                                                                        <Input type="file" name="LoanAppFormFile" onChange={(e) => setFieldValue('LoanAppFormFile', e.currentTarget.files?.[0])} onBlur={handleBlur} invalid={touched.LoanAppFormFile && !!errors.LoanAppFormFile} />
                                                                        <ErrorMessage name="LoanAppFormFile" component="div" className="text-danger small mt-1" />
                                                                        <HelperText text="Scanned physical form OR e-signed digital form" />
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Income Documents</Label>
                                                                        <Input type="file" name="IncomeDocumentsFile" onChange={(e) => setFieldValue('IncomeDocumentsFile', e.currentTarget.files?.[0])} onBlur={handleBlur} />
                                                                        <HelperText text="Salary slip / bank statement / ITR" />
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Business Proof (if self-employed)</Label>
                                                                        <Input type="file" name="BusinessProofFile" onChange={(e) => setFieldValue('BusinessProofFile', e.currentTarget.files?.[0])} onBlur={handleBlur} />
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="6">
                                                                    <FormGroup>
                                                                        <Label>Other Supporting Documents</Label>
                                                                        <Input type="file" name="OtherDocsFile" multiple onChange={(e) => setFieldValue('OtherDocsFile', e.currentTarget.files)} onBlur={handleBlur} />
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>
                                                        </CardBody>
                                                    </Card>
                                                </Col>
                                            </Row>

                                            {/* Action Buttons */}
                                            <div className="d-flex align-items-center flex-wrap gap-2 mt-4 pt-3 border-top">
                                                <Btn color="primary" type="submit" disabled={isSubmitting} className="d-flex align-items-center gap-2 px-4 shadow-sm">
                                                    <i className="fa fa-check-square-o"></i> Submit Application
                                                </Btn>
                                                <Btn color="light" type="button" className="text-dark d-flex align-items-center gap-2 px-4 border">
                                                    <i className="fa fa-floppy-o"></i> Save Draft
                                                </Btn>
                                                <Btn color="warning" type="button" className="text-dark d-flex align-items-center gap-2 px-4 shadow-sm">
                                                    <i className="fa fa-calculator"></i> Check Eligibility
                                                </Btn>
                                                <Btn color="danger" type="button" className="d-flex align-items-center gap-2 px-4 shadow-sm">
                                                    <i className="fa fa-times-circle"></i> Cancel Application
                                                </Btn>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LoanApplication;
