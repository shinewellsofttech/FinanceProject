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

/* ─── Branch options ─────────────────────────────────────────────────────── */
const BRANCH_OPTIONS = [
    { value: "", label: "-- Select Branch --" },
    { value: "BR001", label: "Andheri Branch (BR001)" },
    { value: "BR002", label: "Borivali Branch (BR002)" },
    { value: "BR003", label: "Dadar Branch (BR003)" },
];

/* ─── Form values ────────────────────────────────────────────────────────── */
interface DayClosingFormValues {
    Branch: string;
    ClosingDate: string;
    SystemCashBalance: string;
    PhysicalCashCount: string;
    Difference: string;
    BranchBalanceStatus: string;
    ClosingRemarks: string;
}

const initialValues: DayClosingFormValues = {
    Branch: "BR001",
    ClosingDate: "",
    SystemCashBalance: "Auto from all transactions",
    PhysicalCashCount: "",
    Difference: "Physical – System",
    BranchBalanceStatus: "BALANCED / UNBALANCED",
    ClosingRemarks: "",
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const DayClosing = () => {

    const validationSchema = useMemo(
        () =>
            Yup.object({
                Branch: Yup.string().trim().required("Branch is required"),
                ClosingDate: Yup.string().trim().required("Closing Date is required"),
                PhysicalCashCount: Yup.number()
                    .typeError("Must be a number")
                    .required("Physical Cash Count is required")
                    .min(0, "Cannot be negative"),
            }),
        []
    );

    const handleSubmit = async (
        values: DayClosingFormValues,
        { setSubmitting }: FormikHelpers<DayClosingFormValues>
    ) => {
        try {
            console.log("Day Closing submit:", values);
            setSubmitting(false);
        } catch (error) {
            console.error("Submit failed:", error);
            setSubmitting(false);
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Day Closing" parent="Operations" />
            <Container fluid>

                {/* ── Dark green header card ── */}
                <Card className="mb-3" style={{ borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#1e6e3e", padding: "14px 20px" }}>
                        <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: "1.3rem" }}>🔒</span>
                            <div>
                                <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "1.05rem" }}>
                                    Form 6: Day Closing / Branch Balancing
                                </h5>
                                <p className="mb-0 text-white-50 small">
                                    Branch Manager → End of Day | Must be done before next business day starts
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Main Form ── */}
                <Formik<DayClosingFormValues>
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
                        setFieldValue,
                    }: FormikProps<DayClosingFormValues>) => {

                        /* Auto-compute Difference whenever PhysicalCashCount changes */
                        const physicalNum = parseFloat(values.PhysicalCashCount) || 0;
                        const systemNum = 0; // Replace with real system value from API
                        const diff = physicalNum - systemNum;
                        const diffDisplay = isNaN(diff) ? "Physical – System" : diff.toFixed(2);
                        const isBalanced = diff === 0;

                        return (
                            <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                <Card>
                                    <CardBody>

                                        {/* Row 1: Branch + Closing Date */}
                                        <Row className="mb-3">
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>
                                                        Branch <span className="text-danger">*</span>
                                                    </Label>
                                                    <Input
                                                        type="select"
                                                        name="Branch"
                                                        value={values.Branch}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        invalid={touched.Branch && !!errors.Branch}
                                                    >
                                                        {BRANCH_OPTIONS.map((opt) => (
                                                            <option key={opt.value || "empty"} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </Input>
                                                    <ErrorMessage name="Branch" component="div" className="text-danger small mt-1" />
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>
                                                        Closing Date <span className="text-danger">*</span>
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        name="ClosingDate"
                                                        value={values.ClosingDate}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        invalid={touched.ClosingDate && !!errors.ClosingDate}
                                                    />
                                                    <ErrorMessage name="ClosingDate" component="div" className="text-danger small mt-1" />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Row 2: System Cash Balance + Physical Cash Count */}
                                        <Row className="mb-3">
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>System Cash Balance (₹) — Auto</Label>
                                                    <Input
                                                        type="text"
                                                        name="SystemCashBalance"
                                                        value={values.SystemCashBalance}
                                                        readOnly
                                                        className="bg-light"
                                                    />
                                                    <small className="text-danger">
                                                        <i className="fa fa-flag me-1" aria-hidden="true" />
                                                        System-calculated. Total cash inflows – outflows for the day.
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>
                                                        Physical Cash Count (₹) <span className="text-danger">*</span>
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        name="PhysicalCashCount"
                                                        placeholder="Actual cash counted in drawer"
                                                        value={values.PhysicalCashCount}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                        }}
                                                        onBlur={handleBlur}
                                                        invalid={touched.PhysicalCashCount && !!errors.PhysicalCashCount}
                                                    />
                                                    <small className="text-danger">
                                                        <i className="fa fa-flag me-1" aria-hidden="true" />
                                                        Branch Manager physically counts and enters this value
                                                    </small>
                                                    <ErrorMessage name="PhysicalCashCount" component="div" className="text-danger small mt-1" />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Row 3: Difference + Branch Balance Status */}
                                        <Row className="mb-3">
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>Difference (₹) — Auto</Label>
                                                    <Input
                                                        type="text"
                                                        value={values.PhysicalCashCount ? diffDisplay : "Physical – System"}
                                                        readOnly
                                                        style={{
                                                            backgroundColor: values.PhysicalCashCount
                                                                ? (diff !== 0 ? "#fde8e8" : "#d4edda")
                                                                : "#fff8e1",
                                                        }}
                                                    />
                                                    <small className="text-danger">
                                                        <i className="fa fa-flag me-1" aria-hidden="true" />
                                                        If non-zero: generates shortage/excess alert to HO
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>Branch Balance Status — Auto</Label>
                                                    <Input
                                                        type="text"
                                                        value={
                                                            values.PhysicalCashCount
                                                                ? (isBalanced ? "BALANCED" : "UNBALANCED")
                                                                : "BALANCED / UNBALANCED"
                                                        }
                                                        readOnly
                                                        style={{
                                                            backgroundColor: values.PhysicalCashCount
                                                                ? (isBalanced ? "#d4edda" : "#fde8e8")
                                                                : "#f8f9fa",
                                                            color: values.PhysicalCashCount
                                                                ? (isBalanced ? "#155724" : "#721c24")
                                                                : "#6c757d",
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <small className="text-danger">
                                                        <i className="fa fa-flag me-1" aria-hidden="true" />
                                                        All Dr = Cr. If unbalanced: cannot close until resolved.
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Row 4: Closing Remarks */}
                                        <Row>
                                            <Col md="12">
                                                <FormGroup className="mb-0">
                                                    <Label>Closing Remarks</Label>
                                                    <Input
                                                        type="textarea"
                                                        name="ClosingRemarks"
                                                        placeholder="Remarks for any differences or issues"
                                                        value={values.ClosingRemarks}
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
                                            <i className="fa fa-book me-1" aria-hidden="true" /> Generate Day Book
                                        </Btn>
                                        <Btn color="success" type="submit" disabled={isSubmitting} className="text-white">
                                            <i className="fa fa-lock me-1" aria-hidden="true" /> Post Day Closing
                                        </Btn>
                                        <Btn color="warning" type="button" className="text-dark">
                                            <i className="fa fa-undo me-1" aria-hidden="true" /> Reopen Day (HO Admin only)
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

export default DayClosing;
