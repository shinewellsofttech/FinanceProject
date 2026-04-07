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
import { toast } from "react-toastify";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormValues {
    Name: string;
    F_AccountType: string;
    F_LoanType: string;
    F_EMIType: string;
    F_Periodicity: string;
    F_InterestLedger: string;
    F_InterestCalculationType: string;
    F_PenaltyCalculationType: string;
    F_PenaltyLedger: string;
    F_ForeclosureLedger: string;
    F_ForeclosureCalculationType: string;
    ForeclosureCharges: string;
    MinAmount: string;
    MaxAmount: string;
    MultipleAmount: string;
    MinMemberValue: string;
    MaxMemberValue: string;
    MinTenure: string;
    MaxTenure: string;
    InterestRate: string;
    PenaltyRate: string;
    GracePeriod: string;
    Moratorium: string;
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
    F_PenaltyCalculationType: "",
    F_PenaltyLedger: "",
    F_ForeclosureLedger: "",
    F_ForeclosureCalculationType: "",
    ForeclosureCharges: "",
    MinAmount: "",
    MaxAmount: "",
    MultipleAmount: "",
    MinMemberValue: "",
    MaxMemberValue: "",
    MinTenure: "",
    MaxTenure: "",
    InterestRate: "",
    PenaltyRate: "",
    GracePeriod: "",
    Moratorium: "",
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

type DropdownOption = { Id?: number; ID?: number; Name?: string };

// Helper to get ID from option (handles both Id and ID)
const getOptionId = (opt: DropdownOption): number | undefined => opt.Id ?? opt.ID;

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

const AccountTypeScheme = () => {
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
                MinTenure: Yup.number().typeError("Must be a number").required("Min Tenure is required"),
                MaxTenure: Yup.number().typeError("Must be a number").required("Max Tenure is required"),
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
        Fn_FillListData(dispatch, setDropdowns, "interestLedgers", `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/tbl.F_LedgerGroupMaster/27`);
        Fn_FillListData(dispatch, setDropdowns, "interestCalculationTypes", `${API_WEB_URLS.MASTER}/0/token/InterestCalculationType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "collateralTypes", `${API_WEB_URLS.MASTER}/0/token/CollateralType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "chargeTypes", `${API_WEB_URLS.MASTER}/0/token/ChargeType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "calcTypes", `${API_WEB_URLS.MASTER}/0/token/CalculationType/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "ledgers", `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/tbl.F_LedgerGroupMaster/27`);
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

    // ─── Process JSON Fields for Edit Mode ───────────────────────────────────

    useEffect(() => {
        if (schemeState.id > 0 && schemeState.formData) {
            // Parse CollateralJson to get F_CollateralType
            if (schemeState.formData.CollateralJson) {
                try {
                    const collateralData = typeof schemeState.formData.CollateralJson === 'string'
                        ? JSON.parse(schemeState.formData.CollateralJson)
                        : schemeState.formData.CollateralJson;
                    
                    if (Array.isArray(collateralData) && collateralData.length > 0) {
                        const collateralType = collateralData[0].F_CollateralType;
                        if (collateralType) {
                            setSchemeState((prev) => ({
                                ...prev,
                                formData: {
                                    ...prev.formData,
                                    F_CollateralType: String(collateralType)
                                }
                            }));
                        }
                    }
                } catch (error) {
                    console.error("Error parsing CollateralJson:", error);
                }
            }

            // Parse ChargesJson to populate charges table
            if (schemeState.formData.ChargesJson) {
                try {
                    const chargesData = typeof schemeState.formData.ChargesJson === 'string'
                        ? JSON.parse(schemeState.formData.ChargesJson)
                        : schemeState.formData.ChargesJson;
                    
                    if (Array.isArray(chargesData) && chargesData.length > 0) {
                        const mappedCharges: ChargeRow[] = chargesData.map((charge: any) => ({
                            ChargeType: String(charge.F_ChargeType || charge.ChargeType || ""),
                            CalculationType: String(charge.F_CalculationType || charge.CalculationType || ""),
                            Amount: String(charge.Amount || ""),
                            Ledger: String(charge.F_Ledger || charge.Ledger || ""),
                            IsDeductFromLoan: charge.IsDeductFromLoan === true || charge.IsDeductFromLoan === "1" || charge.IsDeductFromLoan === 1 ? "1" : "0",
                        }));
                        setCharges(mappedCharges);
                    }
                } catch (error) {
                    console.error("Error parsing ChargesJson:", error);
                }
            }
        }
    }, [schemeState.id, schemeState.formData.CollateralJson, schemeState.formData.ChargesJson]);

    // ─── Charges Table Helpers ───────────────────────────────────────────────

    const addCharge = () => {
        setCharges((prev) => [...prev, { ChargeType: "", CalculationType: "", Amount: "", Ledger: "", IsDeductFromLoan: "1" }]);
    };

    const removeCharge = (index: number) => {
        setCharges((prev) => prev.filter((_, i) => i !== index));
    };

    // Helper to check if calculation type is "Percentage"
    const isPercentageCalcType = (calcTypeId: string): boolean => {
        if (!calcTypeId) return false;
        const calcType = dropdowns.calcTypes.find((ct) => {
            const id = getOptionId(ct);
            return id != null && String(id) === calcTypeId;
        });
        return calcType?.Name?.toLowerCase().includes("percent") || false;
    };

    const updateCharge = (index: number, field: keyof ChargeRow, value: string) => {
        setCharges((prev) => prev.map((row, i) => {
            if (i !== index) return row;

            const updatedRow = { ...row, [field]: value };

            // Show warning if CalculationType is Percentage and Amount > 100
            if (field === "Amount" || field === "CalculationType") {
                const calcTypeId = field === "CalculationType" ? value : row.CalculationType;
                const amountValue = field === "Amount" ? value : row.Amount;

                if (isPercentageCalcType(calcTypeId) && Number(amountValue) > 100) {
                    toast.warning("Amount cannot exceed 100 when Calculation Type is Percentage", { toastId: `charge-${index}` });
                }
            }

            return updatedRow;
        }));
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
        F_PenaltyCalculationType: toStringOrEmpty(schemeState.formData.F_PenaltyCalculationType),
        F_PenaltyLedger: toStringOrEmpty(schemeState.formData.F_PenaltyLedger),
        F_ForeclosureLedger: toStringOrEmpty(schemeState.formData.F_ForeclosureLedger),
        F_ForeclosureCalculationType: toStringOrEmpty(schemeState.formData.F_ForeclosureCalculationType),
        ForeclosureCharges: toStringOrEmpty(schemeState.formData.ForeclosureCharges),
        MinAmount: toStringOrEmpty(schemeState.formData.MinAmount),
        MaxAmount: toStringOrEmpty(schemeState.formData.MaxAmount),
        MultipleAmount: toStringOrEmpty(schemeState.formData.MultipleAmount),
        MinMemberValue: toStringOrEmpty(schemeState.formData.MinMemberValue),
        MaxMemberValue: toStringOrEmpty(schemeState.formData.MaxMemberValue),
        MinTenure: toStringOrEmpty(schemeState.formData.MinTenure),
        MaxTenure: toStringOrEmpty(schemeState.formData.MaxTenure),
        InterestRate: toStringOrEmpty(schemeState.formData.InterestRate),
        PenaltyRate: toStringOrEmpty(schemeState.formData.PenaltyRate),
        GracePeriod: toStringOrEmpty(schemeState.formData.GracePeriod),
        Moratorium: toStringOrEmpty(schemeState.formData.Moratorium),
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
            // Validate charges: Amount cannot exceed 100 when CalculationType is Percentage
            const invalidCharge = charges.find((row) => 
                isPercentageCalcType(row.CalculationType) && Number(row.Amount) > 100
            );
            if (invalidCharge) {
                toast.error("Charges validation failed: Amount cannot exceed 100 when Calculation Type is Percentage");
                setSubmitting(false);
                return;
            }

            const formData = new FormData();
            formData.append("Id", String(schemeState.id ?? 0));

            formData.append("Name", values.Name || "");
            formData.append("F_AccountType", values.F_AccountType || "");
            formData.append("F_LoanType", values.F_LoanType || "");
            formData.append("F_EMIType", values.F_EMIType || "");
            formData.append("F_Periodicity", values.F_Periodicity || "");
            formData.append("F_InterestLedger", values.F_InterestLedger || "");
            formData.append("F_InterestCalculationType", values.F_InterestCalculationType || "");
            formData.append("F_PenaltyCalculationType", values.F_PenaltyCalculationType || "");
            formData.append("F_PenaltyLedger", values.F_PenaltyLedger || "");
            formData.append("F_ForeclosureLedger", values.F_ForeclosureLedger || "");
            formData.append("F_ForeclosureCalculationType", values.F_ForeclosureCalculationType || "");
            formData.append("ForeclosureCharges", values.ForeclosureCharges || "");
            formData.append("MinAmount", values.MinAmount || "");
            formData.append("MaxAmount", values.MaxAmount || "");
            formData.append("MultipleAmount", values.MultipleAmount || "");
            formData.append("MinMemberValue", values.MinMemberValue || "");
            formData.append("MaxMemberValue", values.MaxMemberValue || "");
            formData.append("MinTenure", values.MinTenure || "");
            formData.append("MaxTenure", values.MaxTenure || "");
            formData.append("InterestRate", values.InterestRate || "");
            formData.append("PenaltyRate", values.PenaltyRate || "");
            formData.append("GracePeriod", values.GracePeriod || "");
            formData.append("Moratorium", "0");
            formData.append("PreMaturityAfter", values.PreMaturityAfter || "");

            formData.append("IsFixedTerm", String(values.IsFixedTerm));
            formData.append("IsInterestBased", String(values.IsInterestBased));
            formData.append("IsInterestVariable", String(values.IsInterestVariable));
            formData.append("IsPrematurityAllowed", String(values.IsPrematurityAllowed));
            formData.append("IsPaymentAllowed", String(values.IsPaymentAllowed));
            formData.append("IsBlockScheme", String(values.IsBlockScheme));
            formData.append("IsGracePeriodAllowed", String(values.IsGracePeriodAllowed));
            formData.append("IsMoratoriumAllowed", "false");

            // F_CollateralType - send only the ID
            formData.append("F_CollateralType", values.F_CollateralType || "");

            // ChargesJSON - send as array of number values
            const chargesPayload = charges.map((row) => ({
                F_ChargeType: Number(row.ChargeType) || 0,
                F_CalculationType: Number(row.CalculationType) || 0,
                Amount: Number(row.Amount) || 0,
                F_Ledger: Number(row.Ledger) || 0,
                IsDeductFromLoan: row.IsDeductFromLoan === "1",
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
                "/accountTypeScheme"
            );
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Render Helpers ──────────────────────────────────────────────────────

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
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Account Type <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="F_AccountType"
                                                            value={values.F_AccountType}
                                                            onChange={(e) => setFieldValue("F_AccountType", e.target.value)}
                                                            invalid={touched.F_AccountType && !!errors.F_AccountType}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.accountTypes.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `at-${id}` : `at-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_AccountType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Loan Type <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="F_LoanType"
                                                            value={values.F_LoanType}
                                                            onChange={(e) => setFieldValue("F_LoanType", e.target.value)}
                                                            invalid={touched.F_LoanType && !!errors.F_LoanType}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.loanTypes.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `lt-${id}` : `lt-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_LoanType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>EMI Type <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="F_EMIType"
                                                            value={values.F_EMIType}
                                                            onChange={(e) => setFieldValue("F_EMIType", e.target.value)}
                                                            invalid={touched.F_EMIType && !!errors.F_EMIType}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.emiTypes.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `emi-${id}` : `emi-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_EMIType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Periodicity <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="F_Periodicity"
                                                            value={values.F_Periodicity}
                                                            onChange={(e) => setFieldValue("F_Periodicity", e.target.value)}
                                                            invalid={touched.F_Periodicity && !!errors.F_Periodicity}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.periodicities.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `per-${id}` : `per-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_Periodicity" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Interest Ledger</Label>
                                                        <Input
                                                            type="select"
                                                            name="F_InterestLedger"
                                                            value={values.F_InterestLedger}
                                                            onChange={(e) => setFieldValue("F_InterestLedger", e.target.value)}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.interestLedgers.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `il-${id}` : `il-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_InterestLedger" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Interest Calculation Type <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="F_InterestCalculationType"
                                                            value={values.F_InterestCalculationType}
                                                            onChange={(e) => setFieldValue("F_InterestCalculationType", e.target.value)}
                                                            invalid={touched.F_InterestCalculationType && !!errors.F_InterestCalculationType}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.interestCalculationTypes.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `ict-${id}` : `ict-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_InterestCalculationType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                {renderNumber("MinAmount", "Min Amount", values, handleChange, handleBlur, touched, errors, true)}
                                                {renderNumber("MaxAmount", "Max Amount", values, handleChange, handleBlur, touched, errors, true)}
                                                {renderNumber("MultipleAmount", "Multiple Amount", values, handleChange, handleBlur, touched, errors)}
                                                {renderNumber("MinMemberValue", "Min Member ", values, handleChange, handleBlur, touched, errors)}
                                                {renderNumber("MaxMemberValue", "Max Member ", values, handleChange, handleBlur, touched, errors)}
                                                {renderNumber("MinTenure", "Min Tenure", values, handleChange, handleBlur, touched, errors, true)}
                                                {renderNumber("MaxTenure", "Max Tenure", values, handleChange, handleBlur, touched, errors, true)}
                                                {renderNumber("InterestRate", "Interest Rate", values, handleChange, handleBlur, touched, errors, true, "0.01")}
                                                {renderNumber("PenaltyRate", "Penalty Rate", values, handleChange, handleBlur, touched, errors, false, "0.01")}
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Penalty Calculation Type</Label>
                                                        <Input
                                                            type="select"
                                                            name="F_PenaltyCalculationType"
                                                            value={values.F_PenaltyCalculationType}
                                                            onChange={(e) => setFieldValue("F_PenaltyCalculationType", e.target.value)}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.calcTypes.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `pct-${id}` : `pct-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_PenaltyCalculationType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Penalty Ledger</Label>
                                                        <Input
                                                            type="select"
                                                            name="F_PenaltyLedger"
                                                            value={values.F_PenaltyLedger}
                                                            onChange={(e) => setFieldValue("F_PenaltyLedger", e.target.value)}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.interestLedgers.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `pl-${id}` : `pl-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_PenaltyLedger" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Foreclosure Calculation Type</Label>
                                                        <Input
                                                            type="select"
                                                            name="F_ForeclosureCalculationType"
                                                            value={values.F_ForeclosureCalculationType}
                                                            onChange={(e) => setFieldValue("F_ForeclosureCalculationType", e.target.value)}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.calcTypes.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `fct-${id}` : `fct-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_ForeclosureCalculationType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Foreclosure Ledger</Label>
                                                        <Input
                                                            type="select"
                                                            name="F_ForeclosureLedger"
                                                            value={values.F_ForeclosureLedger}
                                                            onChange={(e) => setFieldValue("F_ForeclosureLedger", e.target.value)}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.interestLedgers.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `fl-${id}` : `fl-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_ForeclosureLedger" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                {renderNumber("ForeclosureCharges", "Foreclosure Charges", values, handleChange, handleBlur, touched, errors, false, "0.01")}
                                                {renderNumber("GracePeriod", "Grace Period", values, handleChange, handleBlur, touched, errors)}
                                                {renderNumber("PreMaturityAfter", "Prematurity After", values, handleChange, handleBlur, touched, errors)}
                                            </Row>

                                            <Row className="mt-3">
                                                {[
                                                    { name: "IsFixedTerm", label: "Fixed Term" },
                                                    { name: "IsPrematurityAllowed", label: "Prematurity Allowed" },
                                                    { name: "IsBlockScheme", label: "Block Scheme" },
                                                    { name: "IsGracePeriodAllowed", label: "Grace Period Allowed" },
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
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Collateral Type</Label>
                                                        <Input
                                                            type="select"
                                                            name="F_CollateralType"
                                                            value={values.F_CollateralType}
                                                            onChange={(e) => setFieldValue("F_CollateralType", e.target.value)}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.collateralTypes.map((opt, idx) => {
                                                                const id = getOptionId(opt);
                                                                return <option key={id != null ? `ct-${id}` : `ct-idx-${idx}`} value={id != null ? String(id) : ""}>{opt.Name || ""}</option>;
                                                            })}
                                                        </Input>
                                                        <ErrorMessage name="F_CollateralType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            <h6 className="mt-3 mb-2">Charges</h6>
                                            <Table bordered responsive>
                                                <thead>
                                                    <tr>
                                                        <th>Charge Type</th>
                                                        <th>Calculation Type</th>
                                                        <th>Amount</th>
                                                        <th>Ledger</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {charges.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <select 
                                                                    className="form-control form-select"
                                                                    value={row.ChargeType || ""} 
                                                                    onChange={(e) => updateCharge(idx, "ChargeType", e.target.value)}
                                                                >
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.chargeTypes.map((o, i) => {
                                                                        const id = getOptionId(o);
                                                                        return <option key={i} value={id != null ? String(id) : ""}>{o.Name || ""}</option>;
                                                                    })}
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <select 
                                                                    className="form-control form-select"
                                                                    value={row.CalculationType || ""} 
                                                                    onChange={(e) => updateCharge(idx, "CalculationType", e.target.value)}
                                                                >
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.calcTypes.map((o, i) => {
                                                                        const id = getOptionId(o);
                                                                        return <option key={i} value={id != null ? String(id) : ""}>{o.Name || ""}</option>;
                                                                    })}
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <Input 
                                                                    type="number" 
                                                                    value={row.Amount} 
                                                                    onChange={(e) => updateCharge(idx, "Amount", e.target.value)}
                                                                    invalid={isPercentageCalcType(row.CalculationType) && Number(row.Amount) > 100}
                                                                    max={isPercentageCalcType(row.CalculationType) ? 100 : undefined}
                                                                />
                                                                {isPercentageCalcType(row.CalculationType) && Number(row.Amount) > 100 && (
                                                                    <small className="text-danger">Max 100 for percentage</small>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <select 
                                                                    className="form-control form-select"
                                                                    value={row.Ledger || ""} 
                                                                    onChange={(e) => updateCharge(idx, "Ledger", e.target.value)}
                                                                >
                                                                    <option value="">-- Select --</option>
                                                                    {dropdowns.ledgers.map((o, i) => {
                                                                        const id = getOptionId(o);
                                                                        return <option key={i} value={id != null ? String(id) : ""}>{o.Name || ""}</option>;
                                                                    })}
                                                                </select>
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

export default AccountTypeScheme;
