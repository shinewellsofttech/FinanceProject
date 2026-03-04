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
    Table,
} from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";
import { handleEnterToNextField } from "../../utils/formUtils";

/* ─── Key GL Accounts table data ──────────────────────────────────────────── */
interface GLAccountRow {
    ledgerName: string;
    alias: string;
    ledgerGroup: string;
    normalBalance: string;
    remark: string;
}

const GL_ACCOUNTS: GLAccountRow[] = [
    { ledgerName: "Loan Portfolio A/c", alias: "LOAN_PORT", ledgerGroup: "Assets", normalBalance: "Debit", remark: "Total outstanding loan portfolio" },
    { ledgerName: "Interest Income A/c", alias: "INT_INC", ledgerGroup: "Income", normalBalance: "Credit", remark: "Interest collected from borrowers" },
    { ledgerName: "Interest Accrued A/c", alias: "INT_ACC", ledgerGroup: "Assets", normalBalance: "Debit", remark: "Interest earned but not collected (for tenure-end schemes)" },
    { ledgerName: "Processing Fee Income A/c", alias: "PROC_INC", ledgerGroup: "Income", normalBalance: "Credit", remark: "Fee deducted at disbursement" },
    { ledgerName: "Penal Income A/c", alias: "PENAL_INC", ledgerGroup: "Income", normalBalance: "Credit", remark: "Late payment charges" },
    { ledgerName: "Cash A/c", alias: "CASH", ledgerGroup: "Assets", normalBalance: "Debit", remark: "Branch cash in hand" },
    { ledgerName: "Bank A/c", alias: "BANK", ledgerGroup: "Assets", normalBalance: "Debit", remark: "Current bank account of branch" },
    { ledgerName: "NPA Provision Reserve", alias: "NPA_PROV", ledgerGroup: "Liabilities", normalBalance: "Credit", remark: "Provisioning for bad loans" },
    { ledgerName: "Provision for Bad Debts", alias: "PROV_BAD", ledgerGroup: "Expenses", normalBalance: "Debit", remark: "P&L charge for NPA provisioning" },
    { ledgerName: "Deposit Liability A/c", alias: "DEP_LIAB", ledgerGroup: "Liabilities", normalBalance: "Credit", remark: "Amount received from depositors" },
    { ledgerName: "Interest Payment A/c", alias: "INT_PAY", ledgerGroup: "Expenses", normalBalance: "Debit", remark: "Interest paid to depositors" },
];

/* ─── GL Account options for Dr / Cr dropdowns ───────────────────────────── */
const GL_OPTIONS = [
    { value: "", label: "-- Select GL Account --" },
    { value: "LOAN_PORT", label: "Loan Portfolio A/c" },
    { value: "INT_INC", label: "Interest Income A/c" },
    { value: "INT_ACC", label: "Interest Accrued A/c" },
    { value: "PROC_INC", label: "Processing Fee Income A/c" },
    { value: "PENAL_INC", label: "Penal Income A/c" },
    { value: "CASH", label: "Cash A/c" },
    { value: "BANK", label: "Bank A/c" },
    { value: "NPA_PROV", label: "NPA Provision Reserve" },
    { value: "PROV_BAD", label: "Provision for Bad Debts" },
    { value: "DEP_LIAB", label: "Deposit Liability A/c" },
    { value: "INT_PAY", label: "Interest Payment A/c" },
];

const VOUCHER_TYPES = [
    { value: "", label: "-- Select --" },
    { value: "Journal", label: "Journal" },
    { value: "Payment", label: "Payment" },
    { value: "Receipt", label: "Receipt" },
    { value: "Contra", label: "Contra" },
    { value: "Adjustment", label: "Adjustment" },
];

/* ─── Form types ─────────────────────────────────────────────────────────── */
interface GLEntryFormValues {
    EntryDate: string;
    VoucherType: string;
    DrAccount: string;
    CrAccount: string;
    Amount: string;
    Narration: string;
}

const initialValues: GLEntryFormValues = {
    EntryDate: "",
    VoucherType: "",
    DrAccount: "",
    CrAccount: "",
    Amount: "",
    Narration: "",
};

/* ─── Helper: normal-balance badge ───────────────────────────────────────── */
const balanceBadge = (nb: string) =>
    nb === "Debit"
        ? <span className="text-primary fw-semibold">Debit</span>
        : <span className="text-success fw-semibold">Credit</span>;

/* ─── Component ──────────────────────────────────────────────────────────── */
const COAManualGLEntry = () => {

    const validationSchema = useMemo(
        () =>
            Yup.object({
                EntryDate: Yup.string().trim().required("Entry Date is required"),
                VoucherType: Yup.string().trim().required("Voucher Type is required"),
                DrAccount: Yup.string().trim().required("Dr Account is required"),
                CrAccount: Yup.string().trim().required("Cr Account is required")
                    .notOneOf([Yup.ref("DrAccount")], "Dr and Cr accounts must be different"),
                Amount: Yup.number()
                    .typeError("Must be a number")
                    .required("Amount is required")
                    .min(0.01, "Amount must be greater than 0"),
                Narration: Yup.string().trim().required("Narration / Remarks is required"),
            }),
        []
    );

    const handleSubmit = async (
        values: GLEntryFormValues,
        { setSubmitting }: FormikHelpers<GLEntryFormValues>
    ) => {
        try {
            console.log("GL Entry submit:", values);
            setSubmitting(false);
        } catch (error) {
            console.error("Submit failed:", error);
            setSubmitting(false);
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="COA & Manual GL Entry" parent="Operations" />
            <Container fluid>

                {/* ── Form header card (dark green, like image) ── */}
                <Card className="mb-3" style={{ borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#1e6e3e", padding: "14px 20px" }}>
                        <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: "1.3rem" }}>📒</span>
                            <div>
                                <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "1.05rem" }}>
                                    Form 5: Chart of Accounts (COA) &amp; Manual GL Entry
                                </h5>
                                <p className="mb-0 text-white-50 small">
                                    Accountant / HO Admin → Accounting Module | Table: tbl_chart_of_accounts, tbl_gl_entries
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Key GL Accounts (Pre-seeded) ── */}
                <Card className="mb-4">
                    <CardBody>
                        <h6 className="mb-3 fw-bold" style={{ color: "#555" }}>
                            <i className="fa fa-archive me-2" aria-hidden="true" />
                            Key GL Accounts (Pre-seeded)
                        </h6>
                        <div className="table-responsive">
                            <Table bordered hover size="sm" className="mb-0">
                                <thead style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                    <tr>
                                        <th className="border-0">Ledger Name</th>
                                        <th className="border-0">Alias</th>
                                        <th className="border-0">Ledger Group</th>
                                        <th className="border-0">Normal Balance</th>
                                        <th className="border-0">Remark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {GL_ACCOUNTS.map((row, idx) => (
                                        <tr key={idx}>
                                            <td>{row.ledgerName}</td>
                                            <td><span className="text-primary">{row.alias}</span></td>
                                            <td>{row.ledgerGroup}</td>
                                            <td>{balanceBadge(row.normalBalance)}</td>
                                            <td>{row.remark}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </CardBody>
                </Card>

                {/* ── Manual Journal Entry Form ── */}
                <Formik<GLEntryFormValues>
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
                    }: FormikProps<GLEntryFormValues>) => (
                        <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                            <Card>
                                <CardBody>
                                    <h6 className="mb-3 fw-bold" style={{ color: "#555" }}>
                                        <span style={{ fontSize: "1rem" }}>🔥</span>{" "}
                                        Manual Journal Entry Form
                                    </h6>

                                    {/* Row 1: Entry Date + Voucher Type */}
                                    <Row>
                                        <Col md="6">
                                            <FormGroup className="mb-3">
                                                <Label>
                                                    Entry Date <span className="text-danger">*</span>
                                                </Label>
                                                <Input
                                                    type="date"
                                                    name="EntryDate"
                                                    value={values.EntryDate}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={touched.EntryDate && !!errors.EntryDate}
                                                />
                                                <small className="text-danger">
                                                    <i className="fa fa-flag me-1" aria-hidden="true" />
                                                    Must be in open financial period. Locked periods rejected.
                                                </small>
                                                <ErrorMessage name="EntryDate" component="div" className="text-danger small mt-1" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup className="mb-3">
                                                <Label>
                                                    Voucher Type <span className="text-danger">*</span>
                                                </Label>
                                                <Input
                                                    type="select"
                                                    name="VoucherType"
                                                    value={values.VoucherType}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={touched.VoucherType && !!errors.VoucherType}
                                                >
                                                    {VOUCHER_TYPES.map((opt) => (
                                                        <option key={opt.value || "empty"} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </Input>
                                                <ErrorMessage name="VoucherType" component="div" className="text-danger small mt-1" />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {/* Row 2: Dr Account + Cr Account */}
                                    <Row>
                                        <Col md="6">
                                            <FormGroup className="mb-3">
                                                <Label>
                                                    Dr Account <span className="text-danger">*</span>
                                                </Label>
                                                <Input
                                                    type="select"
                                                    name="DrAccount"
                                                    value={values.DrAccount}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={touched.DrAccount && !!errors.DrAccount}
                                                >
                                                    {GL_OPTIONS.map((opt) => (
                                                        <option key={opt.value || "empty"} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </Input>
                                                <ErrorMessage name="DrAccount" component="div" className="text-danger small mt-1" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup className="mb-3">
                                                <Label>
                                                    Cr Account <span className="text-danger">*</span>
                                                </Label>
                                                <Input
                                                    type="select"
                                                    name="CrAccount"
                                                    value={values.CrAccount}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={touched.CrAccount && !!errors.CrAccount}
                                                >
                                                    {GL_OPTIONS.map((opt) => (
                                                        <option key={opt.value || "empty"} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </Input>
                                                <ErrorMessage name="CrAccount" component="div" className="text-danger small mt-1" />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {/* Row 3: Amount */}
                                    <Row>
                                        <Col md="6">
                                            <FormGroup className="mb-3">
                                                <Label>
                                                    Amount (₹) <span className="text-danger">*</span>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    name="Amount"
                                                    placeholder="Enter amount"
                                                    value={values.Amount}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={touched.Amount && !!errors.Amount}
                                                />
                                                <ErrorMessage name="Amount" component="div" className="text-danger small mt-1" />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {/* Row 4: Narration */}
                                    <Row>
                                        <Col md="12">
                                            <FormGroup className="mb-1">
                                                <Label>
                                                    Narration / Remarks <span className="text-danger">*</span>
                                                </Label>
                                                <Input
                                                    type="text"
                                                    name="Narration"
                                                    placeholder="Description of transaction"
                                                    value={values.Narration}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={touched.Narration && !!errors.Narration}
                                                />
                                                <small className="text-danger">
                                                    <i className="fa fa-flag me-1" aria-hidden="true" />
                                                    Printed in Day Book, Ledger. Be descriptive.
                                                </small>
                                                <ErrorMessage name="Narration" component="div" className="text-danger small mt-1" />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </CardBody>

                                <CardFooter className="d-flex flex-wrap gap-2">
                                    <Btn color="primary" type="submit" disabled={isSubmitting} className="text-white">
                                        <i className="fa fa-paper-plane me-1" aria-hidden="true" /> Submit for Checker Approval
                                    </Btn>
                                    <Btn color="success" type="button" className="text-white">
                                        <i className="fa fa-check me-1" aria-hidden="true" /> Approve (Checker)
                                    </Btn>
                                    <Btn color="danger" type="button" className="text-white">
                                        <i className="fa fa-times me-1" aria-hidden="true" /> Reject Entry
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

export default COAManualGLEntry;
