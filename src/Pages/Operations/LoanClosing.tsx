import React, { useMemo } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import * as Yup from "yup";
import {
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
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Btn } from "../../AbstractElements";
import { handleEnterToNextField } from "../../utils/formUtils";

/* ─── Payment mode options ───────────────────────────────────────────────── */
const PAYMENT_MODES = [
    { value: "", label: "-- Select --" },
    { value: "Cash", label: "Cash" },
    { value: "Bank_NEFT", label: "Bank / NEFT" },
    { value: "UPI", label: "UPI" },
    { value: "Cheque", label: "Cheque" },
    { value: "DD", label: "DD" },
];

/* ─── Form values ────────────────────────────────────────────────────────── */
interface LoanClosingFormValues {
    LoanAccountNumber: string;
    CustomerName: string;
    OutstandingPrincipal: string;
    AccruedInterest: string;
    PenalCharges: string;
    PreClosurePenalty: string;
    TotalPayable: string;
    PaymentMode: string;
    ReceiptUTR: string;
    ForeclosureDate: string;
    Remarks: string;
}

const initialValues: LoanClosingFormValues = {
    LoanAccountNumber: "",
    CustomerName: "",
    OutstandingPrincipal: "Auto from loan account",
    AccruedInterest: "Auto-calculated",
    PenalCharges: "Auto-calculated",
    PreClosurePenalty: "0.00",
    TotalPayable: "Auto-calculated",
    PaymentMode: "",
    ReceiptUTR: "",
    ForeclosureDate: "",
    Remarks: "",
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const LoanClosing = () => {

    const validationSchema = useMemo(
        () =>
            Yup.object({
                LoanAccountNumber: Yup.string().trim().required("Loan Account Number is required"),
                PaymentMode: Yup.string().trim().required("Payment Mode is required"),
                ForeclosureDate: Yup.string().trim().required("Foreclosure Date is required"),
            }),
        []
    );

    const handleSubmit = async (
        values: LoanClosingFormValues,
        { setSubmitting }: FormikHelpers<LoanClosingFormValues>
    ) => {
        try {
            console.log("Loan Closing submit:", values);
            setSubmitting(false);
        } catch (error) {
            console.error("Submit failed:", error);
            setSubmitting(false);
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Loan Closing" parent="Operations" />
            <Container fluid>

                {/* ── Main Form ── */}
                <Formik<LoanClosingFormValues>
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
                    }: FormikProps<LoanClosingFormValues>) => (
                        <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                            <Card>
                                <CardHeaderCommon
                                    title="Form 7: Loan Closing / Foreclosure"
                                    span={[{ text: "Loan Officer / Accountant → Operations | Table: tbl_loan_accounts, tbl_receipts, tbl_loan_closure" }]}
                                    tagClass="card-title mb-0"
                                />
                                <CardBody>

                                    {/* Row 1: Loan Account Number + Customer Name */}
                                    <Row className="mb-3">
                                        <Col md="6">
                                            <FormGroup className="mb-0">
                                                <Label>
                                                    Loan Account Number <span className="text-danger">*</span>
                                                </Label>
                                                <Input
                                                    type="text"
                                                    name="LoanAccountNumber"
                                                    placeholder="Scan / Search loan account"
                                                    value={values.LoanAccountNumber}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={touched.LoanAccountNumber && !!errors.LoanAccountNumber}
                                                />
                                                <ErrorMessage name="LoanAccountNumber" component="div" className="text-danger small mt-1" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup className="mb-0">
                                                <Label>Customer Name (Auto-filled)</Label>
                                                <Input
                                                    type="text"
                                                    name="CustomerName"
                                                    value={values.CustomerName}
                                                    placeholder="Auto-filled on account search"
                                                    readOnly
                                                    className="bg-light"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {/* Row 2: Outstanding Principal + Accrued Interest */}
                                    <Row className="mb-3">
                                        <Col md="6">
                                            <FormGroup className="mb-0">
                                                <Label>Outstanding Principal (₹) — Auto</Label>
                                                <Input
                                                    type="text"
                                                    name="OutstandingPrincipal"
                                                    value={values.OutstandingPrincipal}
                                                    readOnly
                                                    className="bg-light"
                                                />
                                                <small className="text-danger">
                                                    <i className="fa fa-flag me-1" aria-hidden="true" />
                                                    Remaining principal as on foreclosure date
                                                </small>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup className="mb-0">
                                                <Label>Accrued Interest (₹) — Auto</Label>
                                                <Input
                                                    type="text"
                                                    name="AccruedInterest"
                                                    value={values.AccruedInterest}
                                                    readOnly
                                                    className="bg-light"
                                                />
                                                <small className="text-danger">
                                                    <i className="fa fa-flag me-1" aria-hidden="true" />
                                                    Interest accrued up to foreclosure date
                                                </small>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {/* Row 3: Penal Charges + Pre-Closure Penalty */}
                                    <Row className="mb-3">
                                        <Col md="6">
                                            <FormGroup className="mb-0">
                                                <Label>Penal Charges (₹) — Auto</Label>
                                                <Input
                                                    type="text"
                                                    name="PenalCharges"
                                                    value={values.PenalCharges}
                                                    readOnly
                                                    className="bg-light"
                                                />
                                                <small className="text-danger">
                                                    <i className="fa fa-flag me-1" aria-hidden="true" />
                                                    Overdue penal interest if any
                                                </small>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup className="mb-0">
                                                <Label>Pre-Closure Penalty (₹)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    name="PreClosurePenalty"
                                                    value={values.PreClosurePenalty}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <small className="text-danger">
                                                    <i className="fa fa-flag me-1" aria-hidden="true" />
                                                    As per scheme rules (if pre-closure before lock-in)
                                                </small>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {/* Row 4: Total Payable (auto) + Payment Mode */}
                                    <Row className="mb-3">
                                        <Col md="6">
                                            <FormGroup className="mb-0">
                                                <Label>Total Payable Amount (₹) — Auto</Label>
                                                <Input
                                                    type="text"
                                                    name="TotalPayable"
                                                    value={values.TotalPayable}
                                                    readOnly
                                                    style={{ backgroundColor: "#d4edda", fontWeight: 600 }}
                                                />
                                                <small className="text-danger">
                                                    <i className="fa fa-flag me-1" aria-hidden="true" />
                                                    Principal + Interest + Penal + Pre-closure Penalty
                                                </small>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup className="mb-0">
                                                <Label>
                                                    Payment Mode <span className="text-danger">*</span>
                                                </Label>
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
                                        </Col>
                                    </Row>

                                    {/* Row 5: Receipt / UTR + Foreclosure Date */}
                                    <Row className="mb-3">
                                        <Col md="6">
                                            <FormGroup className="mb-0">
                                                <Label>Receipt / UTR Reference No.</Label>
                                                <Input
                                                    type="text"
                                                    name="ReceiptUTR"
                                                    placeholder="Transaction reference number"
                                                    value={values.ReceiptUTR}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup className="mb-0">
                                                <Label>
                                                    Foreclosure Date <span className="text-danger">*</span>
                                                </Label>
                                                <Input
                                                    type="date"
                                                    name="ForeclosureDate"
                                                    value={values.ForeclosureDate}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={touched.ForeclosureDate && !!errors.ForeclosureDate}
                                                />
                                                <ErrorMessage name="ForeclosureDate" component="div" className="text-danger small mt-1" />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {/* Row 6: Remarks */}
                                    <Row>
                                        <Col md="12">
                                            <FormGroup className="mb-0">
                                                <Label>Remarks</Label>
                                                <Input
                                                    type="textarea"
                                                    name="Remarks"
                                                    placeholder="Reason for closure, any special notes"
                                                    value={values.Remarks}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    rows={3}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                </CardBody>

                                <CardFooter className="d-flex flex-wrap gap-2">
                                    <Btn color="primary" type="button" className="text-white">
                                        <i className="fa fa-calculator me-1" aria-hidden="true" /> Calculate Foreclosure Amount
                                    </Btn>
                                    <Btn color="success" type="submit" disabled={isSubmitting} className="text-white">
                                        <i className="fa fa-check me-1" aria-hidden="true" /> Post Loan Closure
                                    </Btn>
                                    <Btn color="info" type="button" className="text-white">
                                        <i className="fa fa-file-text-o me-1" aria-hidden="true" /> Generate NOC
                                    </Btn>
                                    <Btn color="danger" type="button" className="text-white">
                                        <i className="fa fa-times me-1" aria-hidden="true" /> Cancel
                                    </Btn>
                                </CardFooter>
                            </Card>
                        </Form>
                    )}
                </Formik>

            </Container>
        </div>
    );
};

export default LoanClosing;
