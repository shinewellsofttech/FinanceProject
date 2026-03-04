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
import { Btn } from "../../AbstractElements";
import { handleEnterToNextField } from "../../utils/formUtils";

/* ─── Payment mode options ───────────────────────────────────────────────── */
const PAYMENT_MODES = [
    { value: "Cash", label: "Cash" },
    { value: "Bank_NEFT", label: "Bank / NEFT" },
    { value: "UPI", label: "UPI" },
    { value: "Cheque", label: "Cheque" },
    { value: "DD", label: "DD" },
];

/* ─── Form values ────────────────────────────────────────────────────────── */
interface ForeclosureFormValues {
    LoanAccountNumber: string;
    ForeclosureDate: string;
    OutstandingPrincipal: string;
    AccruedInterest: string;
    PenalCharges: string;
    PrepaymentCharges: string;
    Rebate: string;
    TotalForeclosureAmount: string;
    PaymentMode: string;
    Remarks: string;
}

const initialValues: ForeclosureFormValues = {
    LoanAccountNumber: "",
    ForeclosureDate: "",
    OutstandingPrincipal: "",
    AccruedInterest: "",
    PenalCharges: "",
    PrepaymentCharges: "",
    Rebate: "0",
    TotalForeclosureAmount: "",
    PaymentMode: "Cash",
    Remarks: "",
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const Foreclosure = () => {

    const validationSchema = useMemo(
        () =>
            Yup.object({
                LoanAccountNumber: Yup.string().trim().required("Loan Account Number is required"),
                ForeclosureDate: Yup.string().trim().required("Foreclosure Date is required"),
                PaymentMode: Yup.string().trim().required("Payment Mode is required"),
            }),
        []
    );

    const handleSubmit = async (
        values: ForeclosureFormValues,
        { setSubmitting }: FormikHelpers<ForeclosureFormValues>
    ) => {
        try {
            console.log("Foreclosure submit:", values);
            setSubmitting(false);
        } catch (error) {
            console.error("Submit failed:", error);
            setSubmitting(false);
        }
    };

    /* Auto-calculate total foreclosure amount */
    const calcTotal = (values: ForeclosureFormValues): string => {
        const principal = parseFloat(values.OutstandingPrincipal) || 0;
        const interest = parseFloat(values.AccruedInterest) || 0;
        const penal = parseFloat(values.PenalCharges) || 0;
        const prepayment = parseFloat(values.PrepaymentCharges) || 0;
        const rebate = parseFloat(values.Rebate) || 0;
        const total = principal + interest + penal + prepayment - rebate;
        return total > 0 ? total.toFixed(2) : "";
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Foreclosure / Pre-payment" parent="Operations" />
            <Container fluid>

                {/* ── Dark green header card ── */}
                <Card className="mb-3" style={{ borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#1e6e3e", padding: "14px 20px" }}>
                        <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: "1.3rem" }}>🏁</span>
                            <div>
                                <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "1.05rem" }}>
                                    Form 8: Foreclosure / Pre-payment
                                </h5>
                                <p className="mb-0 text-white-50 small">
                                    Customer wants to close loan before tenure end | Requires Approval
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Main Form ── */}
                <Formik<ForeclosureFormValues>
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
                    }: FormikProps<ForeclosureFormValues>) => {

                        const totalAmount = calcTotal(values);

                        return (
                            <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                <Card>
                                    <CardBody>

                                        {/* Row 1: Loan Account Number + Foreclosure Date */}
                                        <Row className="mb-3">
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>
                                                        Loan Account Number <span className="text-danger">*</span>
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        name="LoanAccountNumber"
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
                                                        Interest from last EMI date to foreclosure date
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Row 3: Penal Charges + Prepayment Charges */}
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
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>Prepayment Charges (₹) — Auto</Label>
                                                    <Input
                                                        type="text"
                                                        name="PrepaymentCharges"
                                                        value={values.PrepaymentCharges}
                                                        readOnly
                                                        className="bg-light"
                                                    />
                                                    <small className="text-danger">
                                                        <i className="fa fa-flag me-1" aria-hidden="true" />
                                                        From scheme config % applied on outstanding principal
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Row 4: Rebate / Waiver + Total Foreclosure Amount */}
                                        <Row className="mb-3">
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>Rebate / Waiver (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        name="Rebate"
                                                        value={values.Rebate}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    <small className="text-danger">
                                                        <i className="fa fa-flag me-1" aria-hidden="true" />
                                                        Requires checker approval. Credited to customer and reduces total payable.
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>Total Foreclosure Amount (₹) — Auto</Label>
                                                    <Input
                                                        type="text"
                                                        value={totalAmount || ""}
                                                        readOnly
                                                        style={{ backgroundColor: "#d4edda", fontWeight: 600 }}
                                                    />
                                                    <small className="text-danger">
                                                        <i className="fa fa-flag me-1" aria-hidden="true" />
                                                        = Principal + Interest + Penal + Prepayment – Rebate
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Row 5: Payment Mode + Remarks */}
                                        <Row>
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
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </Input>
                                                    <ErrorMessage name="PaymentMode" component="div" className="text-danger small mt-1" />
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>Remarks</Label>
                                                    <Input
                                                        type="text"
                                                        name="Remarks"
                                                        placeholder="Reason for foreclosure"
                                                        value={values.Remarks}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                    </CardBody>

                                    <CardFooter className="d-flex flex-wrap gap-2">
                                        <Btn color="warning" type="button" className="text-dark">
                                            <i className="fa fa-calculator me-1" aria-hidden="true" /> Calculate Foreclosure
                                        </Btn>
                                        <Btn color="success" type="submit" disabled={isSubmitting} className="text-white">
                                            <i className="fa fa-check me-1" aria-hidden="true" /> Approve Closure
                                        </Btn>
                                        <Btn color="primary" type="button" className="text-white">
                                            <i className="fa fa-file-text-o me-1" aria-hidden="true" /> Generate NOC
                                        </Btn>
                                    </CardFooter>
                                </Card>
                            </Form>
                        );
                    }}
                </Formik>

            </Container>
        </div>
    );
};

export default Foreclosure;
