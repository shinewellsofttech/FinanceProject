import React, { useMemo, useRef } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import * as Yup from "yup";
import {
    Alert,
    Card,
    CardBody,
    CardFooter,
    Col,
    Container,
    FormGroup,
    Input,
    Label,
    Row,
} from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";
import { handleEnterToNextField } from "../../utils/formUtils";

interface LoanDisbursementFormValues {
    LoanAccountNumber: string;
    ProcessingFee: string;
    DisbursementDate: string;
    BankAccountCustomer: string;
    BlackWhiteEntry: string;
    SanctionedAmount: string;
    NetDisbursementAmount: string;
    DisbursementMode: string;
    TransactionReferenceUTR: string;
    DisbursementRemarks: string;
}

const initialValues: LoanDisbursementFormValues = {
    LoanAccountNumber: "",
    ProcessingFee: "Auto from scheme %",
    DisbursementDate: "",
    BankAccountCustomer: "",
    BlackWhiteEntry: "White",
    SanctionedAmount: "From sanction",
    NetDisbursementAmount: "Sanctioned - Fees",
    DisbursementMode: "Bank_NEFT",
    TransactionReferenceUTR: "",
    DisbursementRemarks: "",
};

const DISBURSEMENT_MODES = [
    { value: "Bank_NEFT", label: "Bank Transfer (NEFT/IMPS)" },
    { value: "Cash", label: "Cash" },
];

const BLACK_WHITE_OPTIONS = [
    { value: "White", label: "White (Normal - Visible in standard reports)" },
    { value: "Black", label: "Black (Visible only with 'Can View Black Data' permission)" },
];

const LoanDisbursement = () => {
    const loanAccountRef = useRef<HTMLInputElement | null>(null);

    const validationSchema = useMemo(
        () =>
            Yup.object({
                LoanAccountNumber: Yup.string().trim().required("Loan Account Number is required"),
                DisbursementDate: Yup.string().trim().required("Disbursement Date is required"),
                BankAccountCustomer: Yup.string().trim().required("Bank Account (Customer) is required"),
                BlackWhiteEntry: Yup.string().trim().required("Black / White Entry is required"),
                DisbursementMode: Yup.string().trim().required("Disbursement Mode is required"),
            }),
        []
    );

    const handleSubmit = async (
        values: LoanDisbursementFormValues,
        { setSubmitting }: FormikHelpers<LoanDisbursementFormValues>
    ) => {
        try {
            console.log("Loan Disbursement submit:", values);
            setSubmitting(false);
        } catch (error) {
            console.error("Submit failed:", error);
            setSubmitting(false);
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Loan Disbursement" parent="Operations" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<LoanDisbursementFormValues>
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({
                                values,
                                handleChange,
                                handleBlur,
                                errors,
                                touched,
                                isSubmitting,
                            }: FormikProps<LoanDisbursementFormValues>) => (
                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                    <Card>
                                        <CardBody>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <i className="fa fa-credit-card text-success" style={{ fontSize: "1.25rem" }} aria-hidden="true" />
                                                <h5 className="card-title mb-0 text-success fw-bold">Form 3: Loan Disbursement</h5>
                                            </div>
                                            <p className="text-muted small mb-3">
                                                After Sanction → Disburse Loan Amount | Requires Approval (Maker-Checker)
                                            </p>

                                            <Alert color="warning" className="d-flex align-items-start gap-2 py-2 mb-3" style={{ backgroundColor: "#fff3cd" }}>
                                                <i className="fa fa-exclamation-circle mt-1 text-warning" aria-hidden="true" />
                                                <div className="small">
                                                    <strong>Dev Note:</strong> Disbursement changes loan status to ACTIVE.
                                                    Processing Fee deducted from disbursement amount before transfer.
                                                    Net disbursed = Sanctioned Amount - Processing Fee - Insurance Premium (if any).
                                                    GL entry: Loan Portfolio A/c Dr → Bank/Cash A/c Cr.
                                                    Processing Fee: Bank A/c Dr → Processing Fee Income A/c Cr.
                                                    Table: tbl_disbursements. Black/White flag stored here.
                                                </div>
                                            </Alert>

                                            <Row>
                                                <Col md="6">
                                                    <FormGroup className="mb-2">
                                                        <Label>Loan Account Number <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="LoanAccountNumber"
                                                            value={values.LoanAccountNumber}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.LoanAccountNumber && !!errors.LoanAccountNumber}
                                                            innerRef={loanAccountRef}
                                                        >
                                                            <option value="">Select sanctioned loan</option>
                                                            <option value="1">LA-2024-0001</option>
                                                            <option value="2">LA-2024-0002</option>
                                                        </Input>
                                                        <ErrorMessage name="LoanAccountNumber" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Processing Fee (₹) — Auto</Label>
                                                        <Input
                                                            type="text"
                                                            name="ProcessingFee"
                                                            value={values.ProcessingFee}
                                                            readOnly
                                                            className="bg-light"
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Disbursement Date <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="date"
                                                            name="DisbursementDate"
                                                            value={values.DisbursementDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.DisbursementDate && !!errors.DisbursementDate}
                                                        />
                                                        <ErrorMessage name="DisbursementDate" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Bank Account (Customer) <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="BankAccountCustomer"
                                                            value={values.BankAccountCustomer}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.BankAccountCustomer && !!errors.BankAccountCustomer}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            <option value="1">SBI - ****1234</option>
                                                            <option value="2">HDFC - ****5678</option>
                                                        </Input>
                                                        <ErrorMessage name="BankAccountCustomer" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Black / White Entry <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="BlackWhiteEntry"
                                                            value={values.BlackWhiteEntry}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.BlackWhiteEntry && !!errors.BlackWhiteEntry}
                                                        >
                                                            {BLACK_WHITE_OPTIONS.map((opt) => (
                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="BlackWhiteEntry" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup className="mb-2">
                                                        <Label>Sanctioned Amount (₹) — Auto</Label>
                                                        <Input
                                                            type="text"
                                                            name="SanctionedAmount"
                                                            value={values.SanctionedAmount}
                                                            readOnly
                                                            className="bg-light"
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Net Disbursement Amount (₹) — Auto</Label>
                                                        <Input
                                                            type="text"
                                                            name="NetDisbursementAmount"
                                                            value={values.NetDisbursementAmount}
                                                            readOnly
                                                            className="bg-light"
                                                            style={{ backgroundColor: "#d4edda" }}
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Disbursement Mode <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="DisbursementMode"
                                                            value={values.DisbursementMode}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.DisbursementMode && !!errors.DisbursementMode}
                                                        >
                                                            {DISBURSEMENT_MODES.map((opt) => (
                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="DisbursementMode" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Transaction Reference (UTR)</Label>
                                                        <Input
                                                            type="text"
                                                            name="TransactionReferenceUTR"
                                                            placeholder="NEFT/IMPS transaction ID"
                                                            value={values.TransactionReferenceUTR}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Disbursement Remarks</Label>
                                                        <Input
                                                            type="textarea"
                                                            name="DisbursementRemarks"
                                                            placeholder="Optional remarks"
                                                            value={values.DisbursementRemarks}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            rows={3}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            <Alert color="success" className="py-2 mb-0 small d-flex align-items-start gap-2" style={{ backgroundColor: "#d4edda" }}>
                                                <i className="fa fa-book mt-1 text-success" aria-hidden="true" />
                                                <div>
                                                    <strong>Auto GL Entry on Disbursement:</strong><br />
                                                    Loan Portfolio A/c Dr [Sanctioned] | To Bank / Cash A/c Cr [Net Disbursed] | To Processing Fee Income Cr [Processing Fee]
                                                </div>
                                            </Alert>
                                        </CardBody>
                                        <CardFooter className="d-flex flex-wrap gap-2">
                                            <Btn color="primary" type="submit" disabled={isSubmitting} className="text-white">
                                                <i className="fa fa-file-text-o me-1" aria-hidden="true" /> Create Disbursement Request
                                            </Btn>
                                            <Btn color="success" type="button" className="text-white">
                                                <i className="fa fa-check me-1" aria-hidden="true" /> Approve Disbursement
                                            </Btn>
                                            <Btn color="info" type="button" className="text-white">
                                                <i className="fa fa-print me-1" aria-hidden="true" /> Print Disbursement Voucher
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

export default LoanDisbursement;
