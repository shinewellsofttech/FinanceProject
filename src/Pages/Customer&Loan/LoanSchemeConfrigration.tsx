import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_AddEditData, Fn_DisplayData, Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import * as Yup from "yup";
import { Card, CardBody, CardFooter, CardHeader, Col, Container, FormGroup, Input, Label, Row, Table } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormValues {
    Name: string;
    F_AccountType: string;
    F_LoanType: string;
    F_EMIType: string;
    F_Periodicity: string;
    F_InterestLedger: string;
    F_InterestCalculationType: string;
    MinAmount: string;
    MaxAmount: string;
    MultipleAmount: string;
    MinMemberValue: string;
    MaxMemberValue: string;
    MinTenureMonths: string;
    MaxTenureMonths: string;
    InterestRate: string;
    PenaltyRate: string;
    GracePeriodMonths: string;
    MoratoriumMonths: string;
    PreMaturityAfter: string;
    IsFixedTerm: boolean;
    IsInterestBased: boolean;
    IsInterestVariable: boolean;
    IsPrematurityAllowed: boolean;
    IsPaymentAllowed: boolean;
    IsBlockScheme: boolean;
    IsGracePeriodAllowed: boolean;
    IsMoratoriumAllowed: boolean;
    F_CollateralType: string;
}

interface ChargeRow {
    ChargeType: string;
    CalculationType: string;
    Amount: string;
    Ledger: string;
    IsDeductFromLoan: string;
}

const initialValues: FormValues = {
    Name: "",
    F_AccountType: "",
    F_LoanType: "",
    F_EMIType: "",
    F_Periodicity: "",
    F_InterestLedger: "",
    F_InterestCalculationType: "",
    MinAmount: "",
    MaxAmount: "",
    MultipleAmount: "",
    MinMemberValue: "",
    MaxMemberValue: "",
    MinTenureMonths: "",
    MaxTenureMonths: "",
    InterestRate: "",
    PenaltyRate: "",
    GracePeriodMonths: "",
    MoratoriumMonths: "",
    PreMaturityAfter: "",
    IsFixedTerm: false,
    IsInterestBased: false,
    IsInterestVariable: false,
    IsPrematurityAllowed: false,
    IsPaymentAllowed: false,
    IsBlockScheme: false,
    IsGracePeriodAllowed: false,
    IsMoratoriumAllowed: false,
    F_CollateralType: "",
};

type DropdownOption = { Id?: number; Name?: string };

interface DropdownState {
    accountTypes: DropdownOption[];
    loanTypes: DropdownOption[];
    emiTypes: DropdownOption[];
    periodicities: DropdownOption[];
    interestLedgers: DropdownOption[];
    interestCalculationTypes: DropdownOption[];
    collateralTypes: DropdownOption[];
    chargeTypes: DropdownOption[];
    calcTypes: DropdownOption[];
    ledgers: DropdownOption[];
}

interface SchemeState {
    id: number;
    formData: Partial<FormValues> & Record<string, unknown>;
    isProgress?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/AccountTypeSchemeData/Id`;
const API_URL_SAVE = `AccountTypeScheme/0/token`;

// ─── Component ───────────────────────────────────────────────────────────────

const LoanSchemeConfiguration = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const nameRef = useRef<HTMLInputElement | null>(null);

    const [schemeState, setSchemeState] = useState<SchemeState>({
        id: 0,
        formData: { ...initialValues },
        isProgress: false,
    });

    const [dropdowns, setDropdowns] = useState<DropdownState>({
        accountTypes: [],
        loanTypes: [],
        emiTypes: [],
        periodicities: [],
        interestLedgers: [],
        interestCalculationTypes: [],
        collateralTypes: [],
        chargeTypes: [],
        calcTypes: [],
        ledgers: [],
    });

    const [charges, setCharges] = useState<ChargeRow[]>([]);

    const isEditMode = schemeState.id > 0;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                Name: Yup.string().trim().required("Scheme Name is required"),
                F_AccountType: Yup.string().required("Account Type is required"),
                F_LoanType: Yup.string().required("Loan Type is required"),
                F_EMIType: Yup.string().required("EMI Type is required"),
                F_Periodicity: Yup.string().required("Periodicity is required"),
                F_InterestCalculationType: Yup.string().required("Interest Calculation Type is required"),
                MinAmount: Yup.number().typeError("Must be a number").required("Min Amount is required"),
                MaxAmount: Yup.number().typeError("Must be a number").required("Max Amount is required"),
                MinTenureMonths: Yup.number().typeError("Must be a number").required("Min Tenure is required"),
                MaxTenureMonths: Yup.number().typeError("Must be a number").required("Max Tenure is required"),
                InterestRate: Yup.number().typeError("Must be a number").required("Interest Rate is required"),
            }),
        []
    );

    // ─── Load Dropdowns ──────────────────────────────────────────────────────

    useEffect(() => {
        nameRef.current?.focus();

        Fn_FillListData(dispatch, setDropdowns, "accountTypes", `${API_WEB_URLS.MASTER}/0/token/AccountType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "loanTypes", `${API_WEB_URLS.MASTER}/0/token/LoanType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "emiTypes", `${API_WEB_URLS.MASTER}/0/token/EMIType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "periodicities", `${API_WEB_URLS.MASTER}/0/token/Periodicity/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "interestLedgers", `${API_WEB_URLS.MASTER}/0/token/InterestLedger/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "interestCalculationTypes", `${API_WEB_URLS.MASTER}/0/token/InterestCalculationType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "collateralTypes", `${API_WEB_URLS.MASTER}/0/token/CollateralType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "chargeTypes", `${API_WEB_URLS.MASTER}/0/token/ChargeType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "calcTypes", `${API_WEB_URLS.MASTER}/0/token/CalculationType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "ledgers", `${API_WEB_URLS.MASTER}/0/token/Ledger/Id/0`);
    }, [dispatch]);

    // ─── Load Edit Data ──────────────────────────────────────────────────────

    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;

        if (recordId > 0) {
            setSchemeState((prev) => ({ ...prev, id: recordId }));
            Fn_DisplayData(dispatch, setSchemeState, recordId, API_URL_EDIT);
        } else {
            setSchemeState((prev) => ({ ...prev, id: 0, formData: { ...initialValues } }));
        }
    }, [dispatch, location.state]);

    // ─── Charges Table Helpers ───────────────────────────────────────────────

    const addCharge = () => {
        setCharges((prev) => [...prev, { ChargeType: "", CalculationType: "", Amount: "", Ledger: "", IsDeductFromLoan: "1" }]);
    };

    const removeCharge = (index: number) => {
        setCharges((prev) => prev.filter((_, i) => i !== index));
    };

    const updateCharge = (index: number, field: keyof ChargeRow, value: string) => {
        setCharges((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    };

    // ─── Form Value Mapping ──────────────────────────────────────────────────

    const toStringOrEmpty = (value: unknown): string => {
        if (value === undefined || value === null) return "";
        const str = String(value);
        return str === "null" || str === "undefined" ? "" : str;
    };
    const toBool = (value: unknown) => value === true || value === "true" || value === 1;

    const initialFormValues: FormValues = {
        ...initialValues,
        Name: toStringOrEmpty(schemeState.formData.Name),
        F_AccountType: toStringOrEmpty(schemeState.formData.F_AccountType),
        F_LoanType: toStringOrEmpty(schemeState.formData.F_LoanType),
        F_EMIType: toStringOrEmpty(schemeState.formData.F_EMIType),
        F_Periodicity: toStringOrEmpty(schemeState.formData.F_Periodicity),
        F_InterestLedger: toStringOrEmpty(schemeState.formData.F_InterestLedger),
        F_InterestCalculationType: toStringOrEmpty(schemeState.formData.F_InterestCalculationType),
        MinAmount: toStringOrEmpty(schemeState.formData.MinAmount),
        MaxAmount: toStringOrEmpty(schemeState.formData.MaxAmount),
        MultipleAmount: toStringOrEmpty(schemeState.formData.MultipleAmount),
        MinMemberValue: toStringOrEmpty(schemeState.formData.MinMemberValue),
        MaxMemberValue: toStringOrEmpty(schemeState.formData.MaxMemberValue),
        MinTenureMonths: toStringOrEmpty(schemeState.formData.MinTenureMonths),
        MaxTenureMonths: toStringOrEmpty(schemeState.formData.MaxTenureMonths),
        InterestRate: toStringOrEmpty(schemeState.formData.InterestRate),
        PenaltyRate: toStringOrEmpty(schemeState.formData.PenaltyRate),
        GracePeriodMonths: toStringOrEmpty(schemeState.formData.GracePeriodMonths),
        MoratoriumMonths: toStringOrEmpty(schemeState.formData.MoratoriumMonths),
        PreMaturityAfter: toStringOrEmpty(schemeState.formData.PreMaturityAfter),
        IsFixedTerm: toBool(schemeState.formData.IsFixedTerm),
        IsInterestBased: toBool(schemeState.formData.IsInterestBased),
        IsInterestVariable: toBool(schemeState.formData.IsInterestVariable),
        IsPrematurityAllowed: toBool(schemeState.formData.IsPrematurityAllowed),
        IsPaymentAllowed: toBool(schemeState.formData.IsPaymentAllowed),
        IsBlockScheme: toBool(schemeState.formData.IsBlockScheme),
        IsGracePeriodAllowed: toBool(schemeState.formData.IsGracePeriodAllowed),
        IsMoratoriumAllowed: toBool(schemeState.formData.IsMoratoriumAllowed),
        F_CollateralType: toStringOrEmpty(schemeState.formData.F_CollateralType),
    };

    // ─── Submit ──────────────────────────────────────────────────────────────

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();
            formData.append("Id", String(schemeState.id ?? 0));

            formData.append("Name", values.Name || "");
            formData.append("F_AccountType", values.F_AccountType || "");
            formData.append("F_LoanType", values.F_LoanType || "");
            formData.append("F_EMIType", values.F_EMIType || "");
            formData.append("F_Periodicity", values.F_Periodicity || "");
            formData.append("F_InterestLedger", values.F_InterestLedger || "");
            formData.append("F_InterestCalculationType", values.F_InterestCalculationType || "");
            formData.append("MinAmount", values.MinAmount || "");
            formData.append("MaxAmount", values.MaxAmount || "");
            formData.append("MultipleAmount", values.MultipleAmount || "");
            formData.append("MinMemberValue", values.MinMemberValue || "");
            formData.append("MaxMemberValue", values.MaxMemberValue || "");
            formData.append("MinTenureMonths", values.MinTenureMonths || "");
            formData.append("MaxTenureMonths", values.MaxTenureMonths || "");
            formData.append("InterestRate", values.InterestRate || "");
            formData.append("PenaltyRate", values.PenaltyRate || "");
            formData.append("GracePeriodMonths", values.GracePeriodMonths || "");
            formData.append("MoratoriumMonths", values.MoratoriumMonths || "");
            formData.append("PreMaturityAfter", values.PreMaturityAfter || "");
            formData.append("F_CollateralType", values.F_CollateralType || "");

            formData.append("IsFixedTerm", String(values.IsFixedTerm));
            formData.append("IsInterestBased", String(values.IsInterestBased));
            formData.append("IsInterestVariable", String(values.IsInterestVariable));
            formData.append("IsPrematurityAllowed", String(values.IsPrematurityAllowed));
            formData.append("IsPaymentAllowed", String(values.IsPaymentAllowed));
            formData.append("IsBlockScheme", String(values.IsBlockScheme));
            formData.append("IsGracePeriodAllowed", String(values.IsGracePeriodAllowed));
            formData.append("IsMoratoriumAllowed", String(values.IsMoratoriumAllowed));

            // ChargesJSON - send as array of number values
            const chargesPayload = charges.map((row) => ({
                ChargeType: Number(row.ChargeType) || 0,
                CalculationType: Number(row.CalculationType) || 0,
                Amount: Number(row.Amount) || 0,
                Ledger: Number(row.Ledger) || 0,
                IsDeductFromLoan: Number(row.IsDeductFromLoan) || 0,
            }));
            formData.append("ChargesJSON", JSON.stringify(chargesPayload));

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            formData.append("UserId", currentUser?.uid ?? currentUser?.id ?? "0");
            formData.append("F_BranchOffice", localStorage.getItem("F_BranchOffice") || "");

            await Fn_AddEditData(
                dispatch,
                () => undefined,
                { arguList: { id: schemeState.id, formData } },
                API_URL_SAVE,
                true,
                "memberid",
                navigate,
                "/loanSchemeConfig"
            );
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Render Helpers ──────────────────────────────────────────────────────

    const renderSelect = (
        name: string,
        label: string,
        options: DropdownOption[],
        values: FormValues,
        handleChange: FormikProps<FormValues>["handleChange"],
        handleBlur: FormikProps<FormValues>["handleBlur"],
        touched: FormikProps<FormValues>["touched"],
        errors: FormikProps<FormValues>["errors"],
        required = false
    ) => (
        <Col md="4">
            <FormGroup className="mb-0">
                <Label>{label} {required && <span className="text-danger">*</span>}</Label>
                <Input
                    type="select"
                    name={name}
                    value={(values as unknown as Record<string, string>)[name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={!!(touched as unknown as Record<string, boolean>)[name] && !!(errors as unknown as Record<string, string>)[name]}
                >
                    <option value="">-- Select --</option>
                    {options.map((opt) => (
                        <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                    ))}
                </Input>
                <ErrorMessage name={name} component="div" className="text-danger small mt-1" />
            </FormGroup>
        </Col>
    );

    const renderNumber = (
        name: string,
        label: string,
        values: FormValues,
        handleChange: FormikProps<FormValues>["handleChange"],
        handleBlur: FormikProps<FormValues>["handleBlur"],
        touched: FormikProps<FormValues>["touched"],
        errors: FormikProps<FormValues>["errors"],
        required = false,
        step?: string
    ) => (
        <Col md="4">
            <FormGroup className="mb-0">
                <Label>{label} {required && <span className="text-danger">*</span>}</Label>
                <Input
                    type="number"
                    name={name}
                    step={step}
                    value={(values as unknown as Record<string, string>)[name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={!!(touched as unknown as Record<string, boolean>)[name] && !!(errors as unknown as Record<string, string>)[name]}
                />
                <ErrorMessage name={name} component="div" className="text-danger small mt-1" />
            </FormGroup>
        </Col>
    );

    // ─── JSX ─────────────────────────────────────────────────────────────────

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Account Type Scheme" parent="Customer & Loan" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<FormValues>
                            initialValues={initialFormValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleChange, handleBlur, errors, touched, setFieldValue, isSubmitting }: FormikProps<FormValues>) => (
                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>

                                    {/* ═══════ BASIC DETAILS ═══════ */}
                                    <Card>
                                        <CardHeader><h5>Basic Details</h5></CardHeader>
                                        <CardBody>
                                            <Row className="gy-2">
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Scheme Name <span className="text-danger">*</span></Label>
                                                        <Input type="text" name="Name" value={values.Name} onChange={handleChange} onBlur={handleBlur} invalid={touched.Name && !!errors.Name} innerRef={nameRef} />
                                                        <ErrorMessage name="Name" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                {renderSelect("F_AccountType", "Account Type", dropdowns.accountTypes, values, handleChange, handleBlur, touched, errors, true)}
                                                {renderSelect("F_LoanType", "Loan Type", dropdowns.loanTypes, values, handleChange, handleBlur, touched, errors, true)}
                                                {renderSelect("F_EMIType", "EMI Type", dropdowns.emiTypes, values, handleChange, handleBlur, touched, errors, true)}
                                                {renderSelect("F_Periodicity", "Periodicity", dropdowns.periodicities, values, handleChange, handleBlur, touched, errors, true)}
                                                {renderSelect("F_InterestLedger", "Interest Ledger", dropdowns.interestLedgers, values, handleChange, handleBlur, touched, errors)}
                                                {renderSelect("F_InterestCalculationType", "Interest Calculation Type", dropdowns.interestCalculationTypes, values, handleChange, handleBlur, touched, errors, true)}

                                                {renderNumber("MinAmount", "Min Amount", values, handleChange, handleBlur, touched, errors, true)}
                                                {renderNumber("MaxAmount", "Max Amount", values, handleChange, handleBlur, touched, errors, true)}
                                                {renderNumber("MultipleAmount", "Multiple Amount", values, handleChange, handleBlur, touched, errors)}
                                                {renderNumber("MinMemberValue", "Min Member Value", values, handleChange, handleBlur, touched, errors)}
                                                {renderNumber("MaxMemberValue", "Max Member Value", values, handleChange, handleBlur, touched, errors)}
                                                {renderNumber("MinTenureMonths", "Min Tenure Months", values, handleChange, handleBlur, touched, errors, true)}
                                                {renderNumber("MaxTenureMonths", "Max Tenure Months", values, handleChange, handleBlur, touched, errors, true)}
                                                {renderNumber("InterestRate", "Interest Rate", values, handleChange, handleBlur, touched, errors, true, "0.01")}
                                                {renderNumber("PenaltyRate", "Penalty Rate", values, handleChange, handleBlur, touched, errors, false, "0.01")}
                                                {renderNumber("GracePeriodMonths", "Grace Period Months", values, handleChange, handleBlur, touched, errors)}
                                                {renderNumber("MoratoriumMonths", "Moratorium Months", values, handleChange, handleBlur, touched, errors)}
                                                {renderNumber("PreMaturityAfter", "Prematurity After", values, handleChange, handleBlur, touched, errors)}
                                            </Row>

                                            <Row className="mt-3">
                                                {[
                                                    { name: "IsFixedTerm", label: "Fixed Term" },
                                                    { name: "IsInterestBased", label: "Interest Based" },
                                                    { name: "IsInterestVariable", label: "Variable Interest" },
                                                    { name: "IsPrematurityAllowed", label: "Prematurity Allowed" },
                                                    { name: "IsPaymentAllowed", label: "Payment Allowed" },
                                                    { name: "IsBlockScheme", label: "Block Scheme" },
                                                    { name: "IsGracePeriodAllowed", label: "Grace Period Allowed" },
                                                    { name: "IsMoratoriumAllowed", label: "Moratorium Allowed" },
                                                ].map((chk) => (
                                                    <Col md="3" key={chk.name}>
                                                        <FormGroup check className="mb-2">
                                                            <Input
                                                                type="checkbox"
                                                                name={chk.name}
                                                                id={chk.name}
                                                                checked={(values as unknown as Record<string, boolean>)[chk.name]}
                                                                onChange={handleChange}
                                                            />
                                                            <Label check htmlFor={chk.name}>{chk.label}</Label>
                                                        </FormGroup>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </CardBody>
                                    </Card>

                                    {/* ═══════ COLLATERAL & CHARGES ═══════ */}
                                    <Card>
                                        <CardHeader><h5>Collateral & Charges</h5></CardHeader>
                                        <CardBody>
                                            <Row className="gy-2 mb-3">
                                                {renderSelect("F_CollateralType", "Collateral Type", dropdowns.collateralTypes, values, handleChange, handleBlur, touched, errors)}
                                            </Row>

                                            <h6 className="mt-3 mb-2">Charges</h6>
                                            <Table bordered responsive>
                                                <thead>
                                                    <tr>
                                                        <th>Charge Type</th>
                                                        <th>Calculation Type</th>
                                                        <th>Amount</th>
                                                        <th>Ledger</th>
                                                        <th>Deduct From Loan</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {charges.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <Input type="select" value={row.ChargeType} onChange={(e) => updateCharge(idx, "ChargeType", e.target.value)}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.chargeTypes.map((o) => <option key={o.Id} value={String(o.Id)}>{o.Name}</option>)}
                                                                </Input>
                                                            </td>
                                                            <td>
                                                                <Input type="select" value={row.CalculationType} onChange={(e) => updateCharge(idx, "CalculationType", e.target.value)}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.calcTypes.map((o) => <option key={o.Id} value={String(o.Id)}>{o.Name}</option>)}
                                                                </Input>
                                                            </td>
                                                            <td>
                                                                <Input type="number" value={row.Amount} onChange={(e) => updateCharge(idx, "Amount", e.target.value)} />
                                                            </td>
                                                            <td>
                                                                <Input type="select" value={row.Ledger} onChange={(e) => updateCharge(idx, "Ledger", e.target.value)}>
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.ledgers.map((o) => <option key={o.Id} value={String(o.Id)}>{o.Name}</option>)}
                                                                </Input>
                                                            </td>
                                                            <td>
                                                                <Input type="select" value={row.IsDeductFromLoan} onChange={(e) => updateCharge(idx, "IsDeductFromLoan", e.target.value)}>
                                                                    <option value="1">Yes</option>
                                                                    <option value="0">No</option>
                                                                </Input>
                                                            </td>
                                                            <td>
                                                                <Btn color="danger" type="button" size="sm" onClick={() => removeCharge(idx)}>X</Btn>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                            <Btn color="info" type="button" onClick={addCharge} className="mt-2">
                                                <i className="fa fa-plus me-1"></i> Add Charge
                                            </Btn>
                                        </CardBody>
                                    </Card>

                                    {/* ═══════ FOOTER ═══════ */}
                                    <Card>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="success" type="submit" disabled={isSubmitting} className="px-4">
                                                <i className="fa fa-check me-1"></i> {isEditMode ? "Update Scheme" : "Save Scheme"}
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

export default LoanSchemeConfiguration;
