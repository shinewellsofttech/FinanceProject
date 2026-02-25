import React, { useRef } from "react";
import { Formik, Form } from "formik";
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

interface EligibilityFormValues {
    FOIRRatio: string;
    BureauScoreCheck: string;
    IncomeEligibility: string;
    InternalRiskGrade: string;
    OverallEligibilityResult: string;
    RejectionReason: string;
    SanctionedAmount: string;
    SanctionDate: string;
    ApprovalRemarks: string;
}

const initialValues: EligibilityFormValues = {
    FOIRRatio: "",
    BureauScoreCheck: "",
    IncomeEligibility: "",
    InternalRiskGrade: "",
    OverallEligibilityResult: "",
    RejectionReason: "",
    SanctionedAmount: "",
    SanctionDate: "",
    ApprovalRemarks: "",
};



const readOnlyInputClass = "bg-light";

const EligibilityCheck = () => {
    const foirRef = useRef<HTMLInputElement | null>(null);

    const validationSchema = Yup.object({
        SanctionedAmount: Yup.number().nullable().transform((v) => (v === "" || isNaN(Number(v)) ? undefined : Number(v))),
        SanctionDate: Yup.string().nullable(),
    });

    const handleSubmit = async (
        values: EligibilityFormValues,
        { setSubmitting }: FormikHelpers<EligibilityFormValues>
    ) => {
        try {
            console.log("Eligibility Check submit:", values);
            setSubmitting(false);
        } catch (error) {
            console.error("Submit failed:", error);
            setSubmitting(false);
        }
    };
    
    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Eligibility Check" parent="Customer & Loan" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<EligibilityFormValues>
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({
                                values,
                                handleChange,
                                handleBlur,
                                setFieldValue,
                                isSubmitting,
                            }: FormikProps<EligibilityFormValues>) => (
                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                    <Card>
                                        <CardHeaderCommon
                                            title="Eligibility Check"
                                            tagClass="card-title mb-0"
                                        />
                                        <CardBody>
                                            <Row>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>FOIR Ratio (Auto-calculated)</Label>
                                                        <Input
                                                            type="text"
                                                            name="FOIRRatio"
                                                            placeholder="e.g. 42% (Max allowed: 50%)"
                                                            value={values.FOIRRatio}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={readOnlyInputClass}
                                                            readOnly
                                                            innerRef={foirRef}
                                                        />
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label>Bureau Score Check</Label>
                                                        <Input
                                                            type="text"
                                                            name="BureauScoreCheck"
                                                            placeholder="Auto: PASS (750) / FAIL (580)"
                                                            value={values.BureauScoreCheck}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={readOnlyInputClass}
                                                            readOnly
                                                        />
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label>Overall Eligibility Result</Label>
                                                        <Input
                                                            type="text"
                                                            name="OverallEligibilityResult"
                                                            placeholder="ELIGIBLE / NOT ELIGIBLE"
                                                            value={values.OverallEligibilityResult}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={readOnlyInputClass}
                                                            readOnly
                                                        />
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label>Sanctioned Amount (₹)</Label>
                                                        <Input
                                                            type="text"
                                                            name="SanctionedAmount"
                                                            placeholder="May differ from requested amount"
                                                            value={values.SanctionedAmount}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label>Approval Remarks</Label>
                                                        <Input
                                                            type="textarea"
                                                            name="ApprovalRemarks"
                                                            placeholder="Notes from approver (Branch Manager / HO Credit)"
                                                            value={values.ApprovalRemarks}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            rows={3}
                                                        />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Income Eligibility</Label>
                                                        <Input
                                                            type="text"
                                                            name="IncomeEligibility"
                                                            placeholder="Auto: PASS / FAIL"
                                                            value={values.IncomeEligibility}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={readOnlyInputClass}
                                                            readOnly
                                                        />
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label>Internal Risk Grade</Label>
                                                        <Input
                                                            type="text"
                                                            name="InternalRiskGrade"
                                                            placeholder="A / B / C / D"
                                                            value={values.InternalRiskGrade}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={readOnlyInputClass}
                                                            readOnly
                                                        />
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label>Rejection Reason (if applicable)</Label>
                                                        <Input
                                                            type="text"
                                                            name="RejectionReason"
                                                            placeholder="e.g. Low CIBIL Score"
                                                            value={values.RejectionReason}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label>Sanction Date</Label>
                                                        <Input
                                                            type="date"
                                                            name="SanctionDate"
                                                            placeholder="dd-mm-yyyy"
                                                            value={values.SanctionDate}
                                                            onChange={(e) => setFieldValue("SanctionDate", e.target.value)}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                        <CardFooter className="d-flex flex-wrap align-items-center gap-2">
                                            <Btn color="success" type="button" className="text-white">
                                                <i className="fa fa-check me-1" aria-hidden="true" /> Approve Loan
                                            </Btn>
                                            <Btn color="danger" type="button" className="text-white">
                                                <i className="fa fa-times me-1" aria-hidden="true" /> Reject Loan
                                            </Btn>
                                            <Btn color="warning" type="button" className="text-dark">
                                                <i className="fa fa-undo me-1" aria-hidden="true" /> Send Back for Correction
                                            </Btn>
                                            <Btn color="info" type="button" className="text-white">
                                                <i className="fa fa-file-text me-1" aria-hidden="true" /> Generate Sanction Letter
                                            </Btn>
                                            <Btn color="primary" type="button" className="text-white">
                                                <i className="fa fa-table me-1" aria-hidden="true" /> Generate EMI Schedule
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

export default EligibilityCheck;
