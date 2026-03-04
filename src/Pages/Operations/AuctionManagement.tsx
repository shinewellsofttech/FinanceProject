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

/* ─── Form values ────────────────────────────────────────────────────────── */
interface AuctionFormValues {
    LoanAccountGold: string;
    DPDAsOnDate: string;
    NoticeSentDate: string;
    AuctionDate: string;
    BidderName: string;
    FinalSaleAmount: string;
    TotalOutstanding: string;
    SurplusShortfall: string;
}

const initialValues: AuctionFormValues = {
    LoanAccountGold: "",
    DPDAsOnDate: "e.g. 120 days",
    NoticeSentDate: "",
    AuctionDate: "",
    BidderName: "",
    FinalSaleAmount: "",
    TotalOutstanding: "",
    SurplusShortfall: "",
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const AuctionManagement = () => {

    const validationSchema = useMemo(
        () =>
            Yup.object({
                LoanAccountGold: Yup.string().trim().required("Loan Account (Gold) is required"),
                NoticeSentDate: Yup.string().trim().required("Notice Sent Date is required"),
                AuctionDate: Yup.string().trim().required("Auction Date is required"),
                FinalSaleAmount: Yup.number()
                    .typeError("Must be a number")
                    .required("Final Sale Amount is required")
                    .min(0.01, "Must be greater than 0"),
            }),
        []
    );

    const handleSubmit = async (
        values: AuctionFormValues,
        { setSubmitting }: FormikHelpers<AuctionFormValues>
    ) => {
        try {
            console.log("Auction Management submit:", values);
            setSubmitting(false);
        } catch (error) {
            console.error("Submit failed:", error);
            setSubmitting(false);
        }
    };

    /* Auto-compute surplus / shortfall */
    const calcSurplusShortfall = (values: AuctionFormValues): string => {
        const sale = parseFloat(values.FinalSaleAmount) || 0;
        const outstanding = parseFloat(values.TotalOutstanding) || 0;
        if (!sale && !outstanding) return "";
        const diff = sale - outstanding;
        return diff >= 0
            ? `+${diff.toFixed(2)} (Surplus)`
            : `${diff.toFixed(2)} (Shortfall)`;
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Auction Management" parent="Operations" />
            <Container fluid>

                {/* ── Dark green header card ── */}
                <Card className="mb-3" style={{ borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#1e6e3e", padding: "14px 20px" }}>
                        <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: "1.3rem" }}>🔨</span>
                            <div>
                                <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "1.05rem" }}>
                                    Form 9: Auction Management (Gold Loan NPA)
                                </h5>
                                <p className="mb-0 text-white-50 small">
                                    HO / Branch Manager → For Gold Loans in NPA → Auction Process
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Main Form ── */}
                <Formik<AuctionFormValues>
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
                    }: FormikProps<AuctionFormValues>) => {

                        const surplusShortfall = calcSurplusShortfall(values);
                        const isSurplus = surplusShortfall.startsWith("+");

                        return (
                            <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                <Card>
                                    <CardBody>

                                        {/* Row 1: Loan Account (Gold) + DPD as on Date */}
                                        <Row className="mb-3">
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>
                                                        Loan Account (Gold) <span className="text-danger">*</span>
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        name="LoanAccountGold"
                                                        placeholder="Gold loan account in NPA"
                                                        value={values.LoanAccountGold}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        invalid={touched.LoanAccountGold && !!errors.LoanAccountGold}
                                                    />
                                                    <ErrorMessage name="LoanAccountGold" component="div" className="text-danger small mt-1" />
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>DPD as on Date — Auto</Label>
                                                    <Input
                                                        type="text"
                                                        name="DPDAsOnDate"
                                                        value={values.DPDAsOnDate}
                                                        readOnly
                                                        style={{ backgroundColor: "#fde8e8" }}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Row 2: Notice Sent Date + Auction Date */}
                                        <Row className="mb-3">
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>
                                                        Notice Sent Date <span className="text-danger">*</span>
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        name="NoticeSentDate"
                                                        value={values.NoticeSentDate}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        invalid={touched.NoticeSentDate && !!errors.NoticeSentDate}
                                                    />
                                                    <small className="text-danger">
                                                        <i className="fa fa-flag me-1" aria-hidden="true" />
                                                        Legal notice date. Auction can only proceed after notice period is over.
                                                    </small>
                                                    <ErrorMessage name="NoticeSentDate" component="div" className="text-danger small mt-1" />
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>
                                                        Auction Date <span className="text-danger">*</span>
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        name="AuctionDate"
                                                        value={values.AuctionDate}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        invalid={touched.AuctionDate && !!errors.AuctionDate}
                                                    />
                                                    <ErrorMessage name="AuctionDate" component="div" className="text-danger small mt-1" />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Row 3: Bidder Name + Final Sale Amount */}
                                        <Row className="mb-3">
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>Bidder Name</Label>
                                                    <Input
                                                        type="text"
                                                        name="BidderName"
                                                        placeholder="Name of winning bidder"
                                                        value={values.BidderName}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>
                                                        Final Sale Amount (₹) <span className="text-danger">*</span>
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        name="FinalSaleAmount"
                                                        value={values.FinalSaleAmount}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        invalid={touched.FinalSaleAmount && !!errors.FinalSaleAmount}
                                                    />
                                                    <small className="text-danger">
                                                        <i className="fa fa-flag me-1" aria-hidden="true" />
                                                        Actual amount received from auction
                                                    </small>
                                                    <ErrorMessage name="FinalSaleAmount" component="div" className="text-danger small mt-1" />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Row 4: Total Outstanding + Surplus / Shortfall */}
                                        <Row>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>Total Outstanding (₹) — Auto</Label>
                                                    <Input
                                                        type="text"
                                                        name="TotalOutstanding"
                                                        value={values.TotalOutstanding}
                                                        readOnly
                                                        className="bg-light"
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup className="mb-0">
                                                    <Label>Surplus / Shortfall (₹) — Auto</Label>
                                                    <Input
                                                        type="text"
                                                        value={surplusShortfall}
                                                        readOnly
                                                        style={{
                                                            backgroundColor: surplusShortfall
                                                                ? (isSurplus ? "#d4edda" : "#fde8e8")
                                                                : "#f8f9fa",
                                                            fontWeight: surplusShortfall ? 600 : 400,
                                                            color: surplusShortfall
                                                                ? (isSurplus ? "#155724" : "#721c24")
                                                                : "#6c757d",
                                                        }}
                                                    />
                                                    <small className="text-danger">
                                                        <i className="fa fa-flag me-1" aria-hidden="true" />
                                                        Surplus: refund to customer. Shortfall: still recoverable from customer.
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                    </CardBody>

                                    <CardFooter className="d-flex flex-wrap gap-2">
                                        <Btn color="warning" type="button" className="text-dark">
                                            <i className="fa fa-bell me-1" aria-hidden="true" /> Generate Auction Notice
                                        </Btn>
                                        <Btn color="danger" type="button" className="text-white">
                                            <i className="fa fa-gavel me-1" aria-hidden="true" /> Process Auction
                                        </Btn>
                                        <Btn color="info" type="button" className="text-white">
                                            <i className="fa fa-calculator me-1" aria-hidden="true" /> Calculate Surplus/Shortfall
                                        </Btn>
                                        <Btn color="success" type="submit" disabled={isSubmitting} className="text-white">
                                            <i className="fa fa-check me-1" aria-hidden="true" /> Settle Loan Account
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

export default AuctionManagement;
