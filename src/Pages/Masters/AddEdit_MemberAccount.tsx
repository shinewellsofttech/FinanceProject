import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_AddEditData, Fn_DisplayData, Fn_FillListData, Fn_GetReport } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import * as Yup from "yup";
import {
    Card, CardBody, CardFooter, Col, Container,
    FormGroup, Input, Label, Row, InputGroup, InputGroupText, Spinner, Table
} from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";

/* ─── EMI Schedule Interface ─────────────────── */
interface EMIScheduleItem {
    InstallmentNo: number;
    DueDate: string;
    OpeningPrincipal: number;
    EMIAmount: number;
    PrincipalAmount: number;
    InterestAmount: number;
    ClosingPrincipal: number;
    IsPaid: boolean;
}

/* ─── Loan Type IDs (from API response) ─────────────────── */
const LOAN_TYPE = {
    PERSONAL:  "1",
    GOLD:      "2",
    VEHICLE:   "3",
    HOUSING:   "4",
    MORTGAGE:  "5",
    EDUCATION: "6",
} as const;

/* ─────────────────────────── Types ─────────────────────────── */

interface FormValues {
    // Main
    AccountNo: string;
    F_Member: string;
    F_AccountTypeScheme: string;
    F_LoanType: string;
    LoanAmount: string;
    InterestRate: string;
    F_InterestCalculationType: string;
    F_RepaymentMode: string;
    PeriodCount: string;
    EMIAmount: string;
    RepaymentStartDate: string;
    TotalInterest: string;
    TotalRepaymentAmount: string;
    // Personal Loan
    Purpose: string;
    MonthlyIncome: string;
    EmployerName: string;
    IsSalaryAccount: boolean;
    // Collateral / Mortgage
    F_CollateralType: string;
    CollateralValue: string;
    CollateralDescription: string;
    MortgageType: string;
    // Gold Loan
    GoldWeight: string;
    GoldRate: string;
    LTVPercentage: string;
    // Education Loan
    CourseName: string;
    CourseDurationYears: string;
    InstituteName: string;
    // Vehicle Loan
    VehicleType: string;
    VehicleNumber: string;
    // Housing Loan
    PropertyAddress: string;
    PropertyValue: string;
    PropertyType: string;
    // API JSON fields (for parsing)
    EMIScheduleJson?: string;
    CollateralJson?: string;
    PersonalJson?: string;
    GoldJson?: string;
    VehicleJson?: string;
    HousingJson?: string;
    MortgageJson?: string;
    EducationJson?: string;
}

const initialValues: FormValues = {
    AccountNo: "",
    F_Member: "",
    F_AccountTypeScheme: "",
    F_LoanType: "",
    LoanAmount: "",
    InterestRate: "",
    F_InterestCalculationType: "",
    F_RepaymentMode: "",
    PeriodCount: "",
    EMIAmount: "",
    RepaymentStartDate: "",
    TotalInterest: "",
    TotalRepaymentAmount: "",
    Purpose: "",
    MonthlyIncome: "",
    EmployerName: "",
    IsSalaryAccount: false,
    F_CollateralType: "",
    CollateralValue: "",
    CollateralDescription: "",
    MortgageType: "",
    GoldWeight: "",
    GoldRate: "",
    LTVPercentage: "",
    CourseName: "",
    CourseDurationYears: "",
    InstituteName: "",
    VehicleType: "",
    VehicleNumber: "",
    PropertyAddress: "",
    PropertyValue: "",
    PropertyType: "",
};

interface AccountState {
    id: number;
    formData: Partial<FormValues>;
    isProgress?: boolean;
    isEditingOpen?: boolean;
}

interface DropState { dataList: any[]; isProgress: boolean; filterText: string; }
const emptyDrop = (): DropState => ({ dataList: [], isProgress: false, filterText: "" });

/* ─────────────────────────── Component ─────────────────────── */


const AddEdit_MemberAccount = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const firstRef = useRef<HTMLInputElement | null>(null);

    const [accountState, setAccountState] = useState<AccountState>({
        id: 0,
        formData: { ...initialValues },
        isProgress: false,
        isEditingOpen: true,
    });

    // Dropdowns
    const [memberState,     setMemberState]     = useState<DropState>({ dataList: [], isProgress: true, filterText: "" });
    const [schemeState,     setSchemeState]     = useState<DropState>(emptyDrop());
    const [loanTypeState,   setLoanTypeState]   = useState<DropState>(emptyDrop());
    const [calcTypeState,   setCalcTypeState]   = useState<DropState>(emptyDrop());
    const [repayState,      setRepayState]      = useState<DropState>(emptyDrop());
    const [collateralState, setCollateralState] = useState<DropState>(emptyDrop());
    const [isCalculatingEMI, setIsCalculatingEMI] = useState(false);
    const [totalInterest, setTotalInterest] = useState<string>("");
    const [totalRepaymentAmount, setTotalRepaymentAmount] = useState<string>("");
    const [emiSchedule, setEmiSchedule] = useState<EMIScheduleItem[]>([]);

    const isEditMode = accountState.id > 0;
    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/MemberAccountData/Id`;

    const storedUser   = localStorage.getItem("user");
    const currentUser  = storedUser ? JSON.parse(storedUser) : null;
    const loggedUserId = String(currentUser?.uid ?? currentUser?.id ?? "");

    /* ── Load dropdowns ── */
    useEffect(() => {
        const memberUrl = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.CUSTOMER}/Id/0`;
        Fn_FillListData(dispatch, setMemberState,     "dataList", memberUrl).catch(console.error);
        Fn_FillListData(dispatch, setSchemeState,     "dataList", `${API_WEB_URLS.MASTER}/0/token/AccountTypeSchemeData/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setLoanTypeState,   "dataList", `${API_WEB_URLS.MASTER}/0/token/LoanType/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setCalcTypeState,   "dataList", `${API_WEB_URLS.MASTER}/0/token/InterestCalculationType/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setRepayState,      "dataList", `${API_WEB_URLS.MASTER}/0/token/RepaymentMode/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setCollateralState, "dataList", `${API_WEB_URLS.MASTER}/0/token/CollateralType/Id/0`).catch(console.error);
    }, [dispatch]);

    /* ── Load record for edit ── */
    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;
        if (recordId > 0) {
            setAccountState((prev) => ({ ...prev, id: recordId, isEditingOpen: false }));
            Fn_DisplayData(dispatch, setAccountState, recordId, API_URL_EDIT);
        } else {
            setAccountState((prev) => ({
                ...prev, id: 0, formData: { ...initialValues }, isEditingOpen: true,
            }));
        }
    }, [dispatch, location.state, API_URL_EDIT]);

    useEffect(() => { firstRef.current?.focus(); }, []);

    /* ── Parse JSON fields from API response ── */
    useEffect(() => {
        const fd = accountState.formData as any;
        if (!fd) return;

        // Parse EMI Schedule JSON
        if (fd.EMIScheduleJson) {
            try {
                const parsed = typeof fd.EMIScheduleJson === 'string' 
                    ? JSON.parse(fd.EMIScheduleJson) 
                    : fd.EMIScheduleJson;
                setEmiSchedule(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                console.error("Error parsing EMIScheduleJson:", e);
            }
        }

        // Parse Collateral JSON
        if (fd.CollateralJson) {
            try {
                const parsed = typeof fd.CollateralJson === 'string' 
                    ? JSON.parse(fd.CollateralJson) 
                    : fd.CollateralJson;
                const collateral = Array.isArray(parsed) ? parsed[0] : parsed;
                if (collateral) {
                    setAccountState(prev => ({
                        ...prev,
                        formData: {
                            ...prev.formData,
                            F_CollateralType: String(collateral.F_CollateralType ?? ""),
                            CollateralValue: String(collateral.CollateralValue ?? ""),
                            CollateralDescription: collateral.Description ?? "",
                        }
                    }));
                }
            } catch (e) {
                console.error("Error parsing CollateralJson:", e);
            }
        }

        // Parse Personal Loan JSON
        if (fd.PersonalJson) {
            try {
                const parsed = typeof fd.PersonalJson === 'string' 
                    ? JSON.parse(fd.PersonalJson) 
                    : fd.PersonalJson;
                const personal = Array.isArray(parsed) ? parsed[0] : parsed;
                if (personal) {
                    setAccountState(prev => ({
                        ...prev,
                        formData: {
                            ...prev.formData,
                            Purpose: personal.Purpose ?? "",
                            MonthlyIncome: String(personal.MonthlyIncome ?? ""),
                            EmployerName: personal.EmployerName ?? "",
                            IsSalaryAccount: personal.IsSalaryAccount ?? false,
                        }
                    }));
                }
            } catch (e) {
                console.error("Error parsing PersonalJson:", e);
            }
        }

        // Parse Gold Loan JSON
        if (fd.GoldJson) {
            try {
                const parsed = typeof fd.GoldJson === 'string' 
                    ? JSON.parse(fd.GoldJson) 
                    : fd.GoldJson;
                const gold = Array.isArray(parsed) ? parsed[0] : parsed;
                if (gold) {
                    setAccountState(prev => ({
                        ...prev,
                        formData: {
                            ...prev.formData,
                            GoldWeight: String(gold.GoldWeight ?? ""),
                            GoldRate: String(gold.GoldRate ?? ""),
                            LTVPercentage: String(gold.LTVPercentage ?? ""),
                        }
                    }));
                }
            } catch (e) {
                console.error("Error parsing GoldJson:", e);
            }
        }

        // Parse Vehicle Loan JSON
        if (fd.VehicleJson) {
            try {
                const parsed = typeof fd.VehicleJson === 'string' 
                    ? JSON.parse(fd.VehicleJson) 
                    : fd.VehicleJson;
                const vehicle = Array.isArray(parsed) ? parsed[0] : parsed;
                if (vehicle) {
                    setAccountState(prev => ({
                        ...prev,
                        formData: {
                            ...prev.formData,
                            VehicleType: vehicle.VehicleType ?? "",
                            VehicleNumber: vehicle.VehicleNumber ?? "",
                        }
                    }));
                }
            } catch (e) {
                console.error("Error parsing VehicleJson:", e);
            }
        }

        // Parse Housing Loan JSON
        if (fd.HousingJson) {
            try {
                const parsed = typeof fd.HousingJson === 'string' 
                    ? JSON.parse(fd.HousingJson) 
                    : fd.HousingJson;
                const housing = Array.isArray(parsed) ? parsed[0] : parsed;
                if (housing) {
                    setAccountState(prev => ({
                        ...prev,
                        formData: {
                            ...prev.formData,
                            PropertyAddress: housing.PropertyAddress ?? "",
                            PropertyValue: String(housing.PropertyValue ?? ""),
                            PropertyType: housing.PropertyType ?? "",
                        }
                    }));
                }
            } catch (e) {
                console.error("Error parsing HousingJson:", e);
            }
        }

        // Parse Mortgage Loan JSON
        if (fd.MortgageJson) {
            try {
                const parsed = typeof fd.MortgageJson === 'string' 
                    ? JSON.parse(fd.MortgageJson) 
                    : fd.MortgageJson;
                const mortgage = Array.isArray(parsed) ? parsed[0] : parsed;
                if (mortgage) {
                    setAccountState(prev => ({
                        ...prev,
                        formData: {
                            ...prev.formData,
                            MortgageType: mortgage.MortgageType ?? "",
                        }
                    }));
                }
            } catch (e) {
                console.error("Error parsing MortgageJson:", e);
            }
        }

        // Parse Education Loan JSON
        if (fd.EducationJson) {
            try {
                const parsed = typeof fd.EducationJson === 'string' 
                    ? JSON.parse(fd.EducationJson) 
                    : fd.EducationJson;
                const education = Array.isArray(parsed) ? parsed[0] : parsed;
                if (education) {
                    setAccountState(prev => ({
                        ...prev,
                        formData: {
                            ...prev.formData,
                            CourseName: education.CourseName ?? "",
                            CourseDurationYears: String(education.CourseDurationYears ?? ""),
                            InstituteName: education.InstituteName ?? "",
                        }
                    }));
                }
            } catch (e) {
                console.error("Error parsing EducationJson:", e);
            }
        }
    }, [accountState.formData?.EMIScheduleJson, accountState.formData?.CollateralJson, 
        accountState.formData?.PersonalJson, accountState.formData?.GoldJson,
        accountState.formData?.VehicleJson, accountState.formData?.HousingJson,
        accountState.formData?.MortgageJson, accountState.formData?.EducationJson]);

    /* ── Helper to format date from API ── */
    const formatDateForInput = (dateStr: string | null | undefined): string => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split('T')[0];
    };

    /* ── Validation ── */
    const validationSchema = useMemo(() =>
        Yup.object({
            F_Member:                  Yup.string().required("Member is required"),
            F_AccountTypeScheme:       Yup.string().required("Account Type Scheme is required"),
            F_LoanType:                Yup.string().required("Loan Type is required"),
            LoanAmount:                Yup.number().typeError("Must be a number").required("Loan Amount is required").min(1),
            InterestRate:              Yup.number().typeError("Must be a number").required("Interest Rate is required").min(0),
            F_InterestCalculationType: Yup.string().required("Interest Type is required"),
            F_RepaymentMode:           Yup.string().required("Repayment Mode is required"),
            PeriodCount:               Yup.number().typeError("Must be a number").required("Period Count is required").min(1),
            EMIAmount:                 Yup.number().typeError("Must be a number").required("EMI Amount is required").min(0),
            RepaymentStartDate:        Yup.string().required("Repayment Start Date is required"),
            MonthlyIncome:             Yup.number().typeError("Must be a number").nullable(),
            CollateralValue:           Yup.number().typeError("Must be a number").nullable(),
            GoldWeight:                Yup.number().typeError("Must be a number").nullable(),
            GoldRate:                  Yup.number().typeError("Must be a number").nullable(),
            LTVPercentage:             Yup.number().typeError("Must be a number").min(0).max(100).nullable(),
            CourseDurationYears:       Yup.number().typeError("Must be a number").nullable(),
            PropertyValue:             Yup.number().typeError("Must be a number").nullable(),
        }), []);

    const ts = (v: unknown) => (v !== undefined && v !== null ? String(v) : "");
    const tb = (v: unknown) => v === true || v === "true" || v === 1;

    const initialFormValues: FormValues = {
        ...initialValues,
        AccountNo:                ts(accountState.formData.AccountNo),
        F_Member:                 ts(accountState.formData.F_Member),
        F_AccountTypeScheme:      ts(accountState.formData.F_AccountTypeScheme),
        F_LoanType:               ts(accountState.formData.F_LoanType),
        LoanAmount:               ts(accountState.formData.LoanAmount),
        InterestRate:             ts(accountState.formData.InterestRate),
        F_InterestCalculationType:ts(accountState.formData.F_InterestCalculationType),
        F_RepaymentMode:          ts(accountState.formData.F_RepaymentMode),
        PeriodCount:              ts(accountState.formData.PeriodCount),
        EMIAmount:                ts(accountState.formData.EMIAmount),
        RepaymentStartDate:       formatDateForInput(accountState.formData.RepaymentStartDate),
        TotalInterest:            ts(accountState.formData.TotalInterest),
        TotalRepaymentAmount:     ts(accountState.formData.TotalRepaymentAmount),
        Purpose:                  ts(accountState.formData.Purpose),
        MonthlyIncome:            ts(accountState.formData.MonthlyIncome),
        EmployerName:             ts(accountState.formData.EmployerName),
        IsSalaryAccount:          tb(accountState.formData.IsSalaryAccount),
        F_CollateralType:         ts(accountState.formData.F_CollateralType),
        CollateralValue:          ts(accountState.formData.CollateralValue),
        CollateralDescription:    ts(accountState.formData.CollateralDescription),
        MortgageType:             ts(accountState.formData.MortgageType),
        GoldWeight:               ts(accountState.formData.GoldWeight),
        GoldRate:                 ts(accountState.formData.GoldRate),
        LTVPercentage:            ts(accountState.formData.LTVPercentage),
        CourseName:               ts(accountState.formData.CourseName),
        CourseDurationYears:      ts(accountState.formData.CourseDurationYears),
        InstituteName:            ts(accountState.formData.InstituteName),
        VehicleType:              ts(accountState.formData.VehicleType),
        VehicleNumber:            ts(accountState.formData.VehicleNumber),
        PropertyAddress:          ts(accountState.formData.PropertyAddress),
        PropertyValue:            ts(accountState.formData.PropertyValue),
        PropertyType:             ts(accountState.formData.PropertyType),
    };

    /* ── Submit ── */
    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const fd = new FormData();
            // Required
            fd.append("F_AccountTypeScheme",       values.F_AccountTypeScheme || "");
            fd.append("F_LoanType",                values.F_LoanType || "");
            fd.append("F_Member",                  values.F_Member || "");
            fd.append("LoanAmount",                values.LoanAmount || "0");
            fd.append("InterestRate",              values.InterestRate || "0");
            fd.append("F_InterestCalculationType", values.F_InterestCalculationType || "");
            fd.append("F_RepaymentMode",           values.F_RepaymentMode || "");
            fd.append("PeriodCount",               values.PeriodCount || "0");
            fd.append("EMIAmount",                 values.EMIAmount || "0");
            fd.append("RepaymentStartDate",        values.RepaymentStartDate || "");
            fd.append("TotalInterest",             values.TotalInterest || "0");
            fd.append("TotalRepaymentAmount",      values.TotalRepaymentAmount || "0");
            // Collateral / Mortgage
            fd.append("F_CollateralType",          values.F_CollateralType || "");
            fd.append("CollateralValue",           values.CollateralValue || "0");
            fd.append("CollateralDescription",     values.CollateralDescription || "");
            fd.append("MortgageType",              values.MortgageType || "");
            // Gold
            fd.append("GoldWeight",                values.GoldWeight || "0");
            fd.append("GoldRate",                  values.GoldRate || "0");
            fd.append("LTVPercentage",             values.LTVPercentage || "0");
            // Education
            fd.append("CourseName",                values.CourseName || "");
            fd.append("CourseDurationYears",       values.CourseDurationYears || "0");
            fd.append("InstituteName",             values.InstituteName || "");
            // Vehicle
            fd.append("VehicleType",               values.VehicleType || "");
            fd.append("VehicleNumber",             values.VehicleNumber || "");
            // Housing
            fd.append("PropertyAddress",           values.PropertyAddress || "");
            fd.append("PropertyValue",             values.PropertyValue || "0");
            fd.append("PropertyType",              values.PropertyType || "");
            // Personal
            fd.append("Purpose",                   values.Purpose || "");
            fd.append("MonthlyIncome",             values.MonthlyIncome || "0");
            fd.append("EmployerName",              values.EmployerName || "");
            fd.append("IsSalaryAccount",           values.IsSalaryAccount ? "true" : "false");
            fd.append("F_BranchOffice", localStorage.getItem("F_BranchOffice") || "");

            await Fn_AddEditData(
                dispatch,
                () => { },
                { arguList: { id: accountState.id, formData: fd } },
                `MemberAccountMaster/0/token`,
                true,
                "memberid",
                navigate,
                "/memberAccountList"
            );
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    /* ─────────────────────────── Render ─────────────────────── */
    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Loan Account Entry" parent="Masters" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<FormValues>
                            initialValues={initialFormValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }: FormikProps<FormValues>) => {
                                /* ── Auto Calculate EMI from API ── */
                                const autoCalculateEMI = async (loanAmount: string, interestRate: string, periodCount: string, schemeId: string) => {
                                    if (!loanAmount || !interestRate || !periodCount || !schemeId) {
                                        return;
                                    }
                                    setIsCalculatingEMI(true);
                                    setTotalInterest("");
                                    setTotalRepaymentAmount("");
                                    try {
                                        const fd = new FormData();
                                        fd.append("LoanAmount", loanAmount);
                                        fd.append("InterestRate", interestRate);
                                        fd.append("PeriodCount", periodCount);
                                        fd.append("F_AccountTypeScheme", schemeId);

                                        const response = await Fn_GetReport(
                                            dispatch,
                                            () => {},
                                            "emiData",
                                            `CalculateLoanEMI/0/token`,
                                            { arguList: { id: 0, formData: fd } },
                                            true
                                        );
                                        const data = response?.[0] ?? response;
                                        if (data?.EMIAmount !== undefined) {
                                            setFieldValue("EMIAmount", String(data.EMIAmount));
                                        }
                                        if (data?.TotalInterest !== undefined) {
                                            setFieldValue("TotalInterest", String(data.TotalInterest));
                                            setTotalInterest(String(data.TotalInterest));
                                        }
                                        if (data?.TotalRepaymentAmount !== undefined) {
                                            setFieldValue("TotalRepaymentAmount", String(data.TotalRepaymentAmount));
                                            setTotalRepaymentAmount(String(data.TotalRepaymentAmount));
                                        }
                                    } catch (error) {
                                        console.error("EMI Calculation failed:", error);
                                    } finally {
                                        setIsCalculatingEMI(false);
                                    }
                                };
                                const lt = values.F_LoanType;
                                return (
                                    <Form className="theme-form" onKeyDown={handleEnterToNextField}>

                                        {/* ── MAIN LOAN ACCOUNT DETAILS ── */}
                                        <Card>
                                            <CardBody>
                                                <h5 className="mb-3 fw-semibold">Loan Account</h5>
                                                <fieldset disabled={!accountState.isEditingOpen}>
                                                    <Row className="gy-2 mb-2">
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Account No</Label>
                                                                <Input
                                                                    type="text"
                                                                    name="AccountNo"
                                                                    placeholder="Auto-generated / Enter"
                                                                    value={values.AccountNo}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    innerRef={firstRef}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Member <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="F_Member"
                                                                    value={values.F_Member}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.F_Member && !!errors.F_Member}
                                                                >
                                                                    <option value="">{memberState.isProgress ? "Loading..." : "-- Select Member --"}</option>
                                                                    {memberState.dataList.map((m: any) => (
                                                                        <option key={m.Id} value={m.Id}>{m.FullName ?? m.Name ?? m.Id}</option>
                                                                    ))}
                                                                </Input>
                                                                <ErrorMessage name="F_Member" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Account Type Scheme <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="F_AccountTypeScheme"
                                                                    value={values.F_AccountTypeScheme}
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        autoCalculateEMI(values.LoanAmount, values.InterestRate, values.PeriodCount, e.target.value);
                                                                    }}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.F_AccountTypeScheme && !!errors.F_AccountTypeScheme}
                                                                >
                                                                    <option value="">-- Select Scheme --</option>
                                                                    {schemeState.dataList.map((s: any) => (
                                                                        <option key={s.Id} value={s.Id}>{s.Name}</option>
                                                                    ))}
                                                                </Input>
                                                                <ErrorMessage name="F_AccountTypeScheme" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row className="gy-2 mb-2">
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Loan Type <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="F_LoanType"
                                                                    value={values.F_LoanType}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.F_LoanType && !!errors.F_LoanType}
                                                                >
                                                                    <option value="">-- Select Loan Type --</option>
                                                                    {loanTypeState.dataList.map((l: any) => (
                                                                        <option key={l.Id} value={l.Id}>{l.Name}</option>
                                                                    ))}
                                                                </Input>
                                                                <ErrorMessage name="F_LoanType" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Loan Amount <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="number"
                                                                    name="LoanAmount"
                                                                    placeholder="e.g. 50000"
                                                                    value={values.LoanAmount}
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        autoCalculateEMI(e.target.value, values.InterestRate, values.PeriodCount, values.F_AccountTypeScheme);
                                                                    }}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.LoanAmount && !!errors.LoanAmount}
                                                                />
                                                                <ErrorMessage name="LoanAmount" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Interest Rate (%) <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="number"
                                                                    name="InterestRate"
                                                                    step="0.01"
                                                                    placeholder="e.g. 12.50"
                                                                    value={values.InterestRate}
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        autoCalculateEMI(values.LoanAmount, e.target.value, values.PeriodCount, values.F_AccountTypeScheme);
                                                                    }}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.InterestRate && !!errors.InterestRate}
                                                                />
                                                                <ErrorMessage name="InterestRate" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row className="gy-2 mb-2">
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Interest Type <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="F_InterestCalculationType"
                                                                    value={values.F_InterestCalculationType}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.F_InterestCalculationType && !!errors.F_InterestCalculationType}
                                                                >
                                                                    <option value="">-- Select Interest Type --</option>
                                                                    {calcTypeState.dataList.map((c: any) => (
                                                                        <option key={c.Id} value={c.Id}>{c.Name}</option>
                                                                    ))}
                                                                </Input>
                                                                <ErrorMessage name="F_InterestCalculationType" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Repayment Mode <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="F_RepaymentMode"
                                                                    value={values.F_RepaymentMode}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.F_RepaymentMode && !!errors.F_RepaymentMode}
                                                                >
                                                                    <option value="">-- Select Mode --</option>
                                                                    {repayState.dataList.map((r: any) => (
                                                                        <option key={r.Id} value={r.Id}>{r.Name}</option>
                                                                    ))}
                                                                </Input>
                                                                <ErrorMessage name="F_RepaymentMode" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Period Count <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="number"
                                                                    name="PeriodCount"
                                                                    placeholder="e.g. 24"
                                                                    value={values.PeriodCount}
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        autoCalculateEMI(values.LoanAmount, values.InterestRate, e.target.value, values.F_AccountTypeScheme);
                                                                    }}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.PeriodCount && !!errors.PeriodCount}
                                                                />
                                                                <ErrorMessage name="PeriodCount" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row className="gy-2 mb-2">
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>EMI Amount <span className="text-danger">*</span> {isCalculatingEMI && <Spinner size="sm" className="ms-2" />}</Label>
                                                                <Input
                                                                    type="number"
                                                                    name="EMIAmount"
                                                                    placeholder="Auto-calculated"
                                                                    value={values.EMIAmount}
                                                                    readOnly
                                                                    style={{ backgroundColor: "#e9ecef" }}
                                                                />
                                                                <ErrorMessage name="EMIAmount" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Repayment Start Date <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="date"
                                                                    name="RepaymentStartDate"
                                                                    value={values.RepaymentStartDate}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.RepaymentStartDate && !!errors.RepaymentStartDate}
                                                                />
                                                                <ErrorMessage name="RepaymentStartDate" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Total Interest (₹)</Label>
                                                                <Input
                                                                    type="text"
                                                                    name="TotalInterest"
                                                                    value={values.TotalInterest ? `₹ ${parseFloat(values.TotalInterest).toLocaleString("en-IN")}` : ""}
                                                                    readOnly
                                                                    placeholder="Calculated after EMI"
                                                                    style={{ backgroundColor: "#e9ecef" }}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row className="gy-2 mb-2">
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Total Repayment Amount (₹)</Label>
                                                                <Input
                                                                    type="text"
                                                                    name="TotalRepaymentAmount"
                                                                    value={values.TotalRepaymentAmount ? `₹ ${parseFloat(values.TotalRepaymentAmount).toLocaleString("en-IN")}` : ""}
                                                                    readOnly
                                                                    placeholder="Calculated after EMI"
                                                                    style={{ backgroundColor: "#e9ecef" }}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </fieldset>
                                            </CardBody>
                                        </Card>

                                        {/* ── COLLATERAL (always visible) ── */}
                                        <Card className="mt-3">
                                            <CardBody>
                                                <h6 className="mb-3 fw-semibold text-secondary">Collateral</h6>
                                                <fieldset disabled={!accountState.isEditingOpen}>
                                                    <Row className="gy-2">
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Collateral Type</Label>
                                                                <Input
                                                                    type="select"
                                                                    name="F_CollateralType"
                                                                    value={values.F_CollateralType}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                >
                                                                    <option value="">-- Select Type --</option>
                                                                    {collateralState.dataList.map((c: any) => (
                                                                        <option key={c.Id} value={c.Id}>{c.Name}</option>
                                                                    ))}
                                                                </Input>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Collateral Value (₹)</Label>
                                                                <Input
                                                                    type="number"
                                                                    name="CollateralValue"
                                                                    placeholder="e.g. 75000"
                                                                    value={values.CollateralValue}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.CollateralValue && !!errors.CollateralValue}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup className="mb-0">
                                                                <Label>Collateral Description</Label>
                                                                <Input
                                                                    type="text"
                                                                    name="CollateralDescription"
                                                                    placeholder="Description of collateral"
                                                                    value={values.CollateralDescription}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </fieldset>
                                            </CardBody>
                                        </Card>

                                        {/* ── PERSONAL LOAN (Id = 1) ── */}
                                        {lt === LOAN_TYPE.PERSONAL && (
                                            <Card className="mt-3">
                                                <CardBody>
                                                    <h6 className="mb-3 fw-semibold text-secondary">Personal Loan Details</h6>
                                                    <fieldset disabled={!accountState.isEditingOpen}>
                                                        <Row className="gy-2">
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Purpose</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="Purpose"
                                                                        placeholder="e.g. Medical, Education"
                                                                        value={values.Purpose}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Monthly Income (₹)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="MonthlyIncome"
                                                                        placeholder="e.g. 25000"
                                                                        value={values.MonthlyIncome}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        invalid={touched.MonthlyIncome && !!errors.MonthlyIncome}
                                                                    />
                                                                    <ErrorMessage name="MonthlyIncome" component="div" className="text-danger small mt-1" />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Employer Name</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="EmployerName"
                                                                        placeholder="e.g. ABC Pvt Ltd"
                                                                        value={values.EmployerName}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <div className="d-flex align-items-center gap-2 mt-2">
                                                                        <Input
                                                                            type="checkbox"
                                                                            id="IsSalaryAccount"
                                                                            name="IsSalaryAccount"
                                                                            checked={values.IsSalaryAccount}
                                                                            onChange={handleChange}
                                                                            style={{ width: "18px", height: "18px" }}
                                                                        />
                                                                        <Label for="IsSalaryAccount" className="mb-0">Is Salary Account?</Label>
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </fieldset>
                                                </CardBody>
                                            </Card>
                                        )}

                                        {/* ── GOLD LOAN (Id = 2) ── */}
                                        {lt === LOAN_TYPE.GOLD && (
                                            <Card className="mt-3">
                                                <CardBody>
                                                    <h6 className="mb-3 fw-semibold text-secondary">Gold Loan Details</h6>
                                                    <fieldset disabled={!accountState.isEditingOpen}>
                                                        <Row className="gy-2">
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Gold Weight (g)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="GoldWeight"
                                                                        placeholder="e.g. 10.5"
                                                                        value={values.GoldWeight}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        invalid={touched.GoldWeight && !!errors.GoldWeight}
                                                                    />
                                                                    <ErrorMessage name="GoldWeight" component="div" className="text-danger small mt-1" />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Gold Rate (₹/g)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="GoldRate"
                                                                        placeholder="e.g. 6000"
                                                                        value={values.GoldRate}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        invalid={touched.GoldRate && !!errors.GoldRate}
                                                                    />
                                                                    <ErrorMessage name="GoldRate" component="div" className="text-danger small mt-1" />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>LTV (%)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="LTVPercentage"
                                                                        placeholder="e.g. 75"
                                                                        value={values.LTVPercentage}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        invalid={touched.LTVPercentage && !!errors.LTVPercentage}
                                                                    />
                                                                    <ErrorMessage name="LTVPercentage" component="div" className="text-danger small mt-1" />
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </fieldset>
                                                </CardBody>
                                            </Card>
                                        )}

                                        {/* ── VEHICLE LOAN (Id = 3) ── */}
                                        {lt === LOAN_TYPE.VEHICLE && (
                                            <Card className="mt-3">
                                                <CardBody>
                                                    <h6 className="mb-3 fw-semibold text-secondary">Vehicle Loan Details</h6>
                                                    <fieldset disabled={!accountState.isEditingOpen}>
                                                        <Row className="gy-2">
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Vehicle Type</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="VehicleType"
                                                                        placeholder="e.g. Car / Bike"
                                                                        value={values.VehicleType}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Vehicle Number</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="VehicleNumber"
                                                                        placeholder="e.g. MH12AB1234"
                                                                        value={values.VehicleNumber}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </fieldset>
                                                </CardBody>
                                            </Card>
                                        )}

                                        {/* ── HOUSING LOAN (Id = 4) ── */}
                                        {lt === LOAN_TYPE.HOUSING && (
                                            <Card className="mt-3">
                                                <CardBody>
                                                    <h6 className="mb-3 fw-semibold text-secondary">Housing Loan Details</h6>
                                                    <fieldset disabled={!accountState.isEditingOpen}>
                                                        <Row className="gy-2">
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Property Address</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="PropertyAddress"
                                                                        placeholder="Full address"
                                                                        value={values.PropertyAddress}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Property Value (₹)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="PropertyValue"
                                                                        placeholder="e.g. 2500000"
                                                                        value={values.PropertyValue}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        invalid={touched.PropertyValue && !!errors.PropertyValue}
                                                                    />
                                                                    <ErrorMessage name="PropertyValue" component="div" className="text-danger small mt-1" />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Property Type</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="PropertyType"
                                                                        placeholder="e.g. Residential / Commercial"
                                                                        value={values.PropertyType}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </fieldset>
                                                </CardBody>
                                            </Card>
                                        )}

                                        {/* ── MORTGAGE LOAN (Id = 5) ── */}
                                        {lt === LOAN_TYPE.MORTGAGE && (
                                            <Card className="mt-3">
                                                <CardBody>
                                                    <h6 className="mb-3 fw-semibold text-secondary">Mortgage Loan Details</h6>
                                                    <fieldset disabled={!accountState.isEditingOpen}>
                                                        <Row className="gy-2">
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Mortgage Type</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="MortgageType"
                                                                        placeholder="e.g. Equitable / Legal"
                                                                        value={values.MortgageType}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </fieldset>
                                                </CardBody>
                                            </Card>
                                        )}

                                        {/* ── EDUCATION LOAN (Id = 6) ── */}
                                        {lt === LOAN_TYPE.EDUCATION && (
                                            <Card className="mt-3">
                                                <CardBody>
                                                    <h6 className="mb-3 fw-semibold text-secondary">Education Loan Details</h6>
                                                    <fieldset disabled={!accountState.isEditingOpen}>
                                                        <Row className="gy-2">
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Course Name</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="CourseName"
                                                                        placeholder="e.g. B.Tech"
                                                                        value={values.CourseName}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Course Duration (Years)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="CourseDurationYears"
                                                                        placeholder="e.g. 4"
                                                                        value={values.CourseDurationYears}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        invalid={touched.CourseDurationYears && !!errors.CourseDurationYears}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup className="mb-0">
                                                                    <Label>Institute Name</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="InstituteName"
                                                                        placeholder="e.g. IIT Bombay"
                                                                        value={values.InstituteName}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </fieldset>
                                                </CardBody>
                                            </Card>
                                        )}

                                        {/* ── EMI SCHEDULE TABLE (only in edit mode) ── */}
                                        {isEditMode && emiSchedule.length > 0 && (
                                            <Card className="mt-3">
                                                <CardBody>
                                                    <h6 className="mb-3 fw-semibold text-secondary">EMI Schedule</h6>
                                                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                        <Table bordered hover size="sm" className="mb-0">
                                                            <thead className="table-light" style={{ position: 'sticky', top: 0 }}>
                                                                <tr>
                                                                    <th className="text-center">#</th>
                                                                    <th>Due Date</th>
                                                                    <th className="text-end">Opening Principal</th>
                                                                    <th className="text-end">EMI Amount</th>
                                                                    <th className="text-end">Principal</th>
                                                                    <th className="text-end">Interest</th>
                                                                    <th className="text-end">Closing Principal</th>
                                                                    <th className="text-center">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {emiSchedule.map((item, idx) => (
                                                                    <tr key={idx} className={item.IsPaid ? "table-success" : ""}>
                                                                        <td className="text-center">{item.InstallmentNo}</td>
                                                                        <td>{new Date(item.DueDate).toLocaleDateString("en-IN")}</td>
                                                                        <td className="text-end">₹ {item.OpeningPrincipal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                                                        <td className="text-end">₹ {item.EMIAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                                                        <td className="text-end">₹ {item.PrincipalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                                                        <td className="text-end">₹ {item.InterestAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                                                        <td className="text-end">₹ {item.ClosingPrincipal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                                                        <td className="text-center">
                                                                            {item.IsPaid ? (
                                                                                <span className="badge bg-success">Paid</span>
                                                                            ) : (
                                                                                <span className="badge bg-warning text-dark">Pending</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        )}

                                        {/* ── FOOTER BUTTONS ── */}
                                        <Card className="mt-3">
                                            <CardFooter className="d-flex align-items-center gap-2">
                                                <Btn color="primary" type="submit" disabled={isSubmitting || !accountState.isEditingOpen}>
                                                    <i className="fa fa-save me-1" />
                                                    {isEditMode ? "Update Account" : "Save Account"}
                                                </Btn>
                                                <Btn
                                                    color="light"
                                                    type="button"
                                                    className="text-dark"
                                                    onClick={() => setAccountState(prev => ({ ...prev, isEditingOpen: !prev.isEditingOpen }))}
                                                    disabled={!isEditMode}
                                                >
                                                    <i className="fa fa-pencil me-1" />
                                                    {accountState.isEditingOpen ? "Lock" : "Edit"}
                                                </Btn>
                                                <Btn
                                                    color="secondary"
                                                    type="button"
                                                    onClick={() => navigate("/memberAccountList")}
                                                >
                                                    <i className="fa fa-arrow-left me-1" />
                                                    Back to List
                                                </Btn>
                                            </CardFooter>
                                        </Card>

                                    </Form>
                                );
                            }}
                        </Formik>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AddEdit_MemberAccount;
