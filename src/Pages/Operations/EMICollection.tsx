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

interface EMICollectionFormValues {
    LoanAccountNumber: string;
    ReceiptDate: string;
    AmountReceived: string;
    URTTransactionRef: string;
    ChequeDDDate: string;
    PrincipalReceived: string;
    PenalChargesCollected: string;
    CustomerName: string;
    EMINumber: string;
    PaymentMode: string;
    ChequeDDNumber: string;
    CollectedBy: string;
    InterestReceived: string;
    Remarks: string;
}

const initialValues: EMICollectionFormValues = {
    LoanAccountNumber: "",
    ReceiptDate: "",
    AmountReceived: "",
    URTTransactionRef: "",
    ChequeDDDate: "",
    PrincipalReceived: "Auto-split",
    PenalChargesCollected: "0.00",
    CustomerName: "",
    EMINumber: "",
    PaymentMode: "",
    ChequeDDNumber: "",
    CollectedBy: "",
    InterestReceived: "Auto-split",
    Remarks: "",
};

const PAYMENT_MODES = [
    { value: "", label: "---Select---" },
    { value: "Cash", label: "Cash" },
    { value: "Bank_NEFT", label: "Bank / NEFT" },
    { value: "UPI", label: "UPI" },
    { value: "NACH", label: "NACH" },
    { value: "Cheque", label: "Cheque" },
    { value: "DD", label: "DD" },
];

const EMICollection = () => {
    const loanAccountRef = useRef<HTMLInputElement | null>(null);

    const validationSchema = useMemo(
        () =>
            Yup.object({
                LoanAccountNumber: Yup.string().trim().required("Loan Account Number is required"),
                ReceiptDate: Yup.string().trim().required("Receipt Date is required"),
                AmountReceived: Yup.number()
                    .typeError("Must be a number")
                    .required("Amount Received is required")
                    .min(0.01, "Amount must be greater than 0"),
                PaymentMode: Yup.string().trim().required("Payment Mode is required"),
                ChequeDDNumber: Yup.string().when("PaymentMode", {
                    is: (val: string) => val === "Cheque" || val === "DD",
                    then: (schema) => schema.trim().required("Cheque/DD Number is required when mode is Cheque or DD"),
                    otherwise: (schema) => schema.optional(),
                }),
            }),
        []
    );

    const handleSubmit = async (
        values: EMICollectionFormValues,
        { setSubmitting }: FormikHelpers<EMICollectionFormValues>
    ) => {
        try {
            console.log("EMI Collection submit:", values);
            setSubmitting(false);
        } catch (error) {
            console.error("Submit failed:", error);
            setSubmitting(false);
        }
    };

    const isChequeOrDD = (mode: string) => mode === "Cheque" || mode === "DD";

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="EMI Collection" parent="Operations" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<EMICollectionFormValues>
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
                            }: FormikProps<EMICollectionFormValues>) => (
                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                    <Card>
                                        <CardBody>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <i className="fa fa-money text-primary" style={{ fontSize: "1.25rem" }} aria-hidden="true" />
                                                <h5 className="card-title mb-0 fw-bold">Form 2: EMI Collection / Receipt Entry</h5>
                                            </div>
                                            <p className="text-muted small mb-3">
                                                Cashier / Loan Officer - Collections | Table: tbl_receipts, tbl_emi_schedule
                                            </p>

                                            <Alert color="warning" className="d-flex align-items-start gap-2 py-2 mb-3" style={{ backgroundColor: "#fff3cd" }}>
                                                <i className="fa fa-wrench mt-1 text-warning" aria-hidden="true" />
                                                <div className="small">
                                                    <strong>Dev Note:</strong> On save: (1) Update tbl_emi_schedule EMI status to PAID/PARTIALLY PAID.
                                                    (2) Create GL entry: Cash/Bank Dr → Interest Income Cr + Loan Portfolio Cr.
                                                    (3) Update loan outstanding. (4) Log in audit trail.
                                                    URT (Unique Reference Transaction) required for online payments to prevent duplicate entry.
                                                    Receipt Number format: [BRANCH_CODE] RCP [DATE] [SEQ].
                                                </div>
                                            </Alert>

                                            <Row>
                                                <Col md="6">
                                                    <FormGroup className="mb-2">
                                                        <Label>Loan Account Number <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="text"
                                                            name="LoanAccountNumber"
                                                            placeholder="Scan / Search Account"
                                                            value={values.LoanAccountNumber}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.LoanAccountNumber && !!errors.LoanAccountNumber}
                                                            innerRef={loanAccountRef}
                                                        />
                                                        <ErrorMessage name="LoanAccountNumber" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Receipt Date <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="date"
                                                            name="ReceiptDate"
                                                            value={values.ReceiptDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.ReceiptDate && !!errors.ReceiptDate}
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Amount Received (₹) <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            name="AmountReceived"
                                                            placeholder="e.g. 5200"
                                                            value={values.AmountReceived}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.AmountReceived && !!errors.AmountReceived}
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>URT / Transaction Ref No.</Label>
                                                        <Input
                                                            type="text"
                                                            name="URTTransactionRef"
                                                            placeholder="Unique reference for online payment"
                                                            value={values.URTTransactionRef}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Cheque / DD Date</Label>
                                                        <Input
                                                            type="date"
                                                            name="ChequeDDDate"
                                                            value={values.ChequeDDDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Principal Received (₹) — Auto</Label>
                                                        <Input
                                                            type="text"
                                                            name="PrincipalReceived"
                                                            value={values.PrincipalReceived}
                                                            readOnly
                                                            className="bg-light"
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Penal Charges Collected (₹)</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            name="PenalChargesCollected"
                                                            value={values.PenalChargesCollected}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup className="mb-2">
                                                        <Label>Customer Name (Auto-filled)</Label>
                                                        <Input
                                                            type="text"
                                                            name="CustomerName"
                                                            value={values.CustomerName}
                                                            readOnly
                                                            className="bg-light"
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>EMI Number (Auto-suggested)</Label>
                                                        <Input
                                                            type="text"
                                                            name="EMINumber"
                                                            value={values.EMINumber}
                                                            readOnly
                                                            className="bg-light"
                                                            placeholder="Next due EMI: 3"
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Payment Mode <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="PaymentMode"
                                                            value={values.PaymentMode}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.PaymentMode && !!errors.PaymentMode}
                                                        >
                                                            {PAYMENT_MODES.map((opt) => (
                                                                <option key={opt.value || "empty"} value={opt.value}>{opt.label}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="PaymentMode" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>

                                                    {isChequeOrDD(values.PaymentMode) && (
                                                        <FormGroup className="mb-2">
                                                            <Label>Cheque / DD Number</Label>
                                                            <Input
                                                                type="text"
                                                                name="ChequeDDNumber"
                                                                placeholder="Cheque or DD number"
                                                                value={values.ChequeDDNumber}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.ChequeDDNumber && !!errors.ChequeDDNumber}
                                                            />
                                                            <ErrorMessage name="ChequeDDNumber" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                    )}

                                                    <FormGroup className="mb-2">
                                                        <Label>Collected By (Field Officer)</Label>
                                                        <Input
                                                            type="text"
                                                            name="CollectedBy"
                                                            placeholder="Name of field officer (if door collection)"
                                                            value={values.CollectedBy}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                        </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Interest Received (₹) — Auto</Label>
                                                        <Input
                                                            type="text"
                                                            name="InterestReceived"
                                                            value={values.InterestReceived}
                                                            readOnly
                                                            className="bg-light"
                                                        />
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label>Remarks</Label>
                                                        <Input
                                                            type="text"
                                                            name="Remarks"
                                                            placeholder="Optional remarks"
                                                            value={values.Remarks}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            <Alert color="success" className="py-2 mb-0 small" style={{ backgroundColor: "#d4edda" }}>
                                                <strong>Auto GL Entry on Receipt Save:</strong><br />
                                                Cash / Bank A/C: Dr [Amount] | To Interest Income A/c: Cr [Interest] | To Loan Portfolio A/c: Cr [Principal] | To Penal Income A/c (if penal): Cr [Penal]
                                            </Alert>
                                        </CardBody>
                                        <CardFooter className="d-flex flex-wrap gap-2">
                                            <Btn color="success" type="submit" disabled={isSubmitting} className="text-white">
                                                <i className="fa fa-check me-1" aria-hidden="true" /> Collect EMI &amp; Print Receipt
                                            </Btn>
                                            <Btn color="primary" type="button" className="text-white">
                                                <i className="fa fa-print me-1" aria-hidden="true" /> Reprint Receipt
                                            </Btn>
                                            <Btn color="warning" type="button" className="text-dark">
                                                <i className="fa fa-exchange me-1" aria-hidden="true" /> Adjust Advance
                                            </Btn>
                                            <Btn color="danger" type="button" className="text-white">
                                                <i className="fa fa-undo me-1" aria-hidden="true" /> Reverse Receipt
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

export default EMICollection;
