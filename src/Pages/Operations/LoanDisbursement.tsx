import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
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
import { Fn_AddEditData, Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";

/* ─── Types ───────────────────────────────────────────────── */

interface FormValues {
    F_MemberAccountMaster: string;
    DisbursementDate: string;
    Amount: string;
    F_DisbursementType: string;
    Remarks: string;
}

const initialValues: FormValues = {
    F_MemberAccountMaster: "",
    DisbursementDate: "",
    Amount: "",
    F_DisbursementType: "",
    Remarks: "",
};

interface DropState { dataList: any[]; isProgress: boolean; filterText: string; }

const emptyDropState = (): DropState => ({ dataList: [], isProgress: false, filterText: "" });

/* ─── Component ────────────────────────────────────────────── */

const LoanDisbursement = () => {
    const dispatch = useDispatch();
    const firstRef = useRef<HTMLInputElement | null>(null);

    // Member Account dropdown
    const [memberAccountState, setMemberAccountState] = useState<DropState>({ dataList: [], isProgress: true, filterText: "" });
    // Disbursement Type dropdown
    const [disbTypeState, setDisbTypeState] = useState<DropState>(emptyDropState());

    const storedUser  = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const loggedUserId = String(currentUser?.uid ?? currentUser?.id ?? "");

    /* ── Load dropdowns ── */
    useEffect(() => {
        Fn_FillListData(dispatch, setMemberAccountState, "dataList", `${API_WEB_URLS.MASTER}/0/token/MemberAccount/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setDisbTypeState,       "dataList", `${API_WEB_URLS.MASTER}/0/token/DisbursementType/Id/0`).catch(console.error);
    }, [dispatch]);

    useEffect(() => { firstRef.current?.focus(); }, []);

    /* ── Validation ── */
    const validationSchema = useMemo(() =>
        Yup.object({
            F_MemberAccountMaster: Yup.string().required("Member Account is required"),
            DisbursementDate:      Yup.string().required("Disbursement Date is required"),
            Amount:                Yup.number().typeError("Must be a number").required("Amount is required").min(1, "Amount must be > 0"),
            F_DisbursementType:    Yup.string().required("Disbursement Type is required"),
        }), []);

    /* ── Submit ── */
    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const fd = new FormData();
            fd.append("F_MemberAccountMaster", values.F_MemberAccountMaster);
            fd.append("DisbursementDate",      values.DisbursementDate);
            fd.append("Amount",                values.Amount);
            fd.append("F_DisbursementType",    values.F_DisbursementType);
            fd.append("Remarks",               values.Remarks || "");
            fd.append("UserId",                loggedUserId);
            fd.append("F_BranchOffice", localStorage.getItem("F_BranchOffice") || "");

            await Fn_AddEditData(
                dispatch,
                () => { },
                { arguList: { id: 0, formData: fd } },
                `LoanDisbursement/${loggedUserId}/token`,
                true,
                "memberid",
                undefined,
                undefined
            );
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    /* ─── Render ──────────────────────────────────────────── */
    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Loan Disbursement" parent="Operations" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<FormValues>
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleChange, handleBlur, errors, touched, isSubmitting }: FormikProps<FormValues>) => (
                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                    <Card>
                                        <CardHeaderCommon
                                            title="Loan Disbursement"
                                            tagClass="card-title mb-0"
                                        />
                                        <CardBody>
                                            <Row className="gy-2">

                                                {/* Member Account */}
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Member Account <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="F_MemberAccountMaster"
                                                            value={values.F_MemberAccountMaster}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.F_MemberAccountMaster && !!errors.F_MemberAccountMaster}
                                                            innerRef={firstRef}
                                                        >
                                                            <option value="">
                                                                {memberAccountState.isProgress ? "Loading..." : "-- Select Member Account --"}
                                                            </option>
                                                            {memberAccountState.dataList.map((m: any) => (
                                                                <option key={m.Id} value={m.Id}>
                                                                    {m.AccountNo ?? m.Name ?? m.Id}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="F_MemberAccountMaster" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                {/* Disbursement Date */}
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Date <span className="text-danger">*</span></Label>
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
                                                </Col>

                                                {/* Amount */}
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Amount <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="number"
                                                            name="Amount"
                                                            placeholder="e.g. 50000"
                                                            value={values.Amount}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.Amount && !!errors.Amount}
                                                        />
                                                        <ErrorMessage name="Amount" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                {/* Disbursement Type */}
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Disbursement Type <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="F_DisbursementType"
                                                            value={values.F_DisbursementType}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.F_DisbursementType && !!errors.F_DisbursementType}
                                                        >
                                                            <option value="">-- Select Type --</option>
                                                            {disbTypeState.dataList.map((d: any) => (
                                                                <option key={d.Id} value={d.Id}>{d.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="F_DisbursementType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                {/* Remarks */}
                                                <Col md="8">
                                                    <FormGroup className="mb-0">
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
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="primary" type="submit" disabled={isSubmitting}>
                                                <i className="fa fa-save me-1" />
                                                {isSubmitting ? "Saving..." : "Add Disbursement"}
                                            </Btn>
                                            <Btn
                                                color="light"
                                                type="button"
                                                className="text-dark"
                                                onClick={() => {
                                                    // reset is handled by Formik; navigate away if needed
                                                }}
                                            >
                                                <i className="fa fa-times me-1" />
                                                Cancel
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
