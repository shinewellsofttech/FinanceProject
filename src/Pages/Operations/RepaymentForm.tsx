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

/* ─── Types ─────────────────────────────────────────────── */

interface FormValues {
    F_MemberAccountMaster: string;
    PaymentDate: string;
    Amount: string;
}

const initialValues: FormValues = {
    F_MemberAccountMaster: "",
    PaymentDate: "",
    Amount: "",
};

interface DropState { dataList: any[]; isProgress: boolean; filterText: string; }

/* ─── Component ─────────────────────────────────────────── */

const RepaymentForm = () => {
    const dispatch = useDispatch();
    const firstRef = useRef<HTMLInputElement | null>(null);

    const [memberAccountState, setMemberAccountState] = useState<DropState>({
        dataList: [],
        isProgress: true,
        filterText: "",
    });

    const storedUser   = localStorage.getItem("user");
    const currentUser  = storedUser ? JSON.parse(storedUser) : null;
    const loggedUserId = String(currentUser?.uid ?? currentUser?.id ?? "");

    /* ── Load Member Account dropdown ── */
    useEffect(() => {
        Fn_FillListData(
            dispatch,
            setMemberAccountState,
            "dataList",
            `${API_WEB_URLS.MASTER}/0/token/MemberAccountData/Id/0`
        ).catch(console.error);
    }, [dispatch]);

    useEffect(() => { firstRef.current?.focus(); }, []);

    /* ── Validation ── */
    const validationSchema = useMemo(() =>
        Yup.object({
            F_MemberAccountMaster: Yup.string().required("Member Account is required"),
            PaymentDate:           Yup.string().required("Payment Date is required"),
            Amount:                Yup.number()
                .typeError("Must be a number")
                .required("Amount is required")
                .min(1, "Amount must be greater than 0"),
        }), []);

    /* ── Submit ── */
    const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
        try {
            const fd = new FormData();
            fd.append("F_MemberAccountMaster", values.F_MemberAccountMaster);
            fd.append("PaymentDate",           values.PaymentDate);
            fd.append("Amount",                values.Amount);
            fd.append("UserId",                loggedUserId);

            await Fn_AddEditData(
                dispatch,
                () => { },
                { arguList: { id: 0, formData: fd } },
                `LoanRepayment/${loggedUserId}/token`,
                true,
                "memberid",
                undefined,
                undefined
            );

            resetForm();
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    /* ─── Render ─────────────────────────────────────────── */
    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Loan Repayment" parent="Operations" />
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
                                            title="Loan Repayment"
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

                                                {/* Payment Date */}
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Payment Date <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="date"
                                                            name="PaymentDate"
                                                            value={values.PaymentDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.PaymentDate && !!errors.PaymentDate}
                                                        />
                                                        <ErrorMessage name="PaymentDate" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                {/* Amount */}
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Amount <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="number"
                                                            name="Amount"
                                                            placeholder="e.g. 5000"
                                                            value={values.Amount}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.Amount && !!errors.Amount}
                                                        />
                                                        <ErrorMessage name="Amount" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                            </Row>
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="success" type="submit" disabled={isSubmitting} className="text-white">
                                                <i className="fa fa-check me-1" />
                                                {isSubmitting ? "Paying..." : "Pay"}
                                            </Btn>
                                            <Btn
                                                color="light"
                                                type="reset"
                                                className="text-dark"
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

export default RepaymentForm;
