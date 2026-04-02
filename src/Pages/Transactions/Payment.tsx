import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
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
    InputGroup,
    Modal,
    ModalHeader,
    ModalBody,
    Table,
    Spinner,
} from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Btn } from "../../AbstractElements";
import { handleEnterToNextField } from "../../utils/formUtils";
import { Fn_FillListData, Fn_GetReport } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { API_HELPER } from "../../helpers/ApiHelper";
import { toast } from "react-toastify";

/* ─── Types ─────────────────────────────────────────────── */

interface FormValues {
    // Voucher Information
    AccountNo: string;
    AccountId: string; // F_MemberAccountMaster
    VoucherDate: string;
    PaymentMode: string;

    // Cheque fields
    ChequeNo: string;
    ChequeDate: string;
    F_Bank: string;
    BankName: string;

    // Online fields
    UTRNo: string;
    TransactionDate: string;

    // Account Information (read-only)
    SchemeName: string;
    OpeningDate: string;
    InterestRate: string;
    MaturityDate: string;
    TotalAmount: string;
    MonthlyAmount: string;

    // Member Information (read-only)
    MemberName: string;
    MemberId: string;
    ContactNo: string;
    Address: string;

    // Payment Information
    Amount: string;
    AmountInWords: string;
    Narration: string;

    // Hidden fields for validation
    DisbursementAmount: number;
    DisbursedAmount: number;
}

const initialValues: FormValues = {
    AccountNo: "",
    AccountId: "",
    VoucherDate: new Date().toISOString().split("T")[0],
    PaymentMode: "",

    ChequeNo: "",
    ChequeDate: "",
    F_Bank: "",
    BankName: "",

    UTRNo: "",
    TransactionDate: new Date().toISOString().split("T")[0],

    SchemeName: "",
    OpeningDate: "",
    InterestRate: "",
    MaturityDate: "",
    TotalAmount: "",
    MonthlyAmount: "",

    MemberName: "",
    MemberId: "",
    ContactNo: "",
    Address: "",

    Amount: "",
    AmountInWords: "",
    Narration: "",

    DisbursementAmount: 0,
    DisbursedAmount: 0,
};

interface DropState {
    dataList: any[];
    isProgress: boolean;
}

/* ─── Component ─────────────────────────────────────────── */

const Payment = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const accountNoRef = useRef<HTMLInputElement | null>(null);

    const [bankLedgerState, setBankLedgerState] = useState<DropState>({ dataList: [], isProgress: false });
    const [cashLedgerState, setCashLedgerState] = useState<DropState>({ dataList: [], isProgress: false });
    const [accountTypeState, setAccountTypeState] = useState<DropState>({ dataList: [], isProgress: true });
    const [accountTypeSchemeState, setAccountTypeSchemeState] = useState<DropState>({ dataList: [], isProgress: false });
    const [accountListState, setAccountListState] = useState<DropState>({ dataList: [], isProgress: false });
    const [paymentMethodState, setPaymentMethodState] = useState<DropState>({ dataList: [], isProgress: true });
    const [accountSearchModal, setAccountSearchModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedAccountType, setSelectedAccountType] = useState("");
    const [selectedAccountTypeScheme, setSelectedAccountTypeScheme] = useState("");
    const [selectedAccount, setSelectedAccount] = useState("");
    const [formikSetFieldValue, setFormikSetFieldValue] = useState<((field: string, value: any) => void) | null>(null);
    const [memberInfoExpanded, setMemberInfoExpanded] = useState(false);
    const [currentPaymentMode, setCurrentPaymentMode] = useState("");

    // Edit mode states
    const [editId, setEditId] = useState<number>(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const [editFormValues, setEditFormValues] = useState<FormValues>(initialValues);

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const loggedUserId =  "0"

    /* ── Get Id from location state for edit mode ── */
    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;
        if (recordId > 0) {
            setEditId(recordId);
            setIsEditMode(true);
            fetchPaymentData(recordId);
        }
    }, [location.state]);

    /* ── Fetch payment data for edit ── */
    const fetchPaymentData = async (id: number) => {
        setIsLoadingEdit(true);
        try {
            const fd = new FormData();
            fd.append("Id", String(id));
            fd.append("F_BranchOffice", localStorage.getItem("F_BranchOffice") || "0");
            fd.append("F_AccountTypeScheme", "0");
            fd.append("F_LoanType", "0");

            const response = await Fn_GetReport(
                dispatch,
                () => {},
                "paymentData",
                `GetPaymentData/${loggedUserId}/token`,
                { arguList: { id: id, formData: fd } },
                true
            );

            // Response is in data.response array format
            const data = Array.isArray(response) ? response[0] : response;
            if (data) {
                // Set payment mode first so bank ledgers can be fetched
                const paymentMode = String(data.F_PaymentMethodMaster || data.PaymentMode || "");
                setCurrentPaymentMode(paymentMode);

                // Format date from API (2026-04-02T00:00:00)
                const formatDateForInput = (dateStr: string | null | undefined) => {
                    if (!dateStr) return "";
                    try {
                        return new Date(dateStr).toISOString().split("T")[0];
                    } catch {
                        return "";
                    }
                };

                const newFormValues: FormValues = {
                    ...initialValues,
                    AccountNo: data.AccountNo || "",
                    AccountId: String(data.F_MemberAccountMaster || ""),
                    VoucherDate: formatDateForInput(data.DisbursementDate || data.VoucherDate) || new Date().toISOString().split("T")[0],
                    PaymentMode: paymentMode,
                    Amount: String(data.Amount || ""),
                    Narration: data.Remarks || data.Narration || "",
                    BankName: data.BankName || "",
                    F_Bank: String(data.F_DisbursementLedger || ""),
                    ChequeNo: data.ChequeNo || "",
                    ChequeDate: formatDateForInput(data.ChequeDate),
                    UTRNo: data.UTRNo || data.VoucherUTRNo || "",
                    TransactionDate: formatDateForInput(data.TransactionDate || data.VoucherTransactionDate) || new Date().toISOString().split("T")[0],
                    DisbursedAmount: parseFloat(data.DisbursedAmount) || 0,
                };

                // Convert amount to words
                if (data.Amount) {
                    newFormValues.AmountInWords = convertToWords(Math.floor(Number(data.Amount)));
                }

                // Fetch member account data for additional fields
                if (data.F_MemberAccountMaster) {
                    try {
                        const memberAccountUrl = `${API_WEB_URLS.BASE}Masters/0/token/MemberAccountData/Id/${data.F_MemberAccountMaster}`;
                        const memberResponse = await API_HELPER.apiGET(memberAccountUrl);
                        
                        // Response format: data.dataList[0]
                        const memberData = memberResponse?.data?.dataList?.[0] || memberResponse?.data?.response?.[0] || memberResponse?.data?.[0] || memberResponse?.data;
                        
                        if (memberData) {
                            // Pre-fill member and account information
                            newFormValues.MemberId = String(memberData.F_Member || memberData.MemberId || "");
                            newFormValues.InterestRate = String(memberData.InterestRate || memberData.ROI || "");
                            newFormValues.TotalAmount = String(memberData.LoanAmount || memberData.TotalAmount || "");
                            newFormValues.MonthlyAmount = String(memberData.EMIAmount || memberData.MonthlyAmount || "");
                            newFormValues.DisbursementAmount = parseFloat(memberData.DisbursementAmount) || 0;
                            
                            // Use DisbursedAmount from payment response if available, otherwise from member account
                            if (!newFormValues.DisbursedAmount) {
                                newFormValues.DisbursedAmount = parseFloat(memberData.DisbursedAmount) || 0;
                            }

                            // Format dates
                            const openingDate = memberData.RepaymentStartDate || memberData.OpeningDate || "";
                            newFormValues.OpeningDate = openingDate ? formatDateForInput(openingDate) : "";

                            // Calculate maturity date from EMIScheduleJson
                            if (memberData.EMIScheduleJson) {
                                try {
                                    const emiSchedule = typeof memberData.EMIScheduleJson === 'string' 
                                        ? JSON.parse(memberData.EMIScheduleJson) 
                                        : memberData.EMIScheduleJson;
                                    if (Array.isArray(emiSchedule) && emiSchedule.length > 0) {
                                        const lastEMI = emiSchedule[emiSchedule.length - 1];
                                        if (lastEMI.DueDate) {
                                            newFormValues.MaturityDate = formatDateForInput(lastEMI.DueDate);
                                        }
                                    }
                                } catch (e) {
                                    console.error("Error parsing EMIScheduleJson:", e);
                                }
                            }
                            if (!newFormValues.MaturityDate) {
                                const maturityDate = memberData.EndDate || memberData.MaturityDate || "";
                                newFormValues.MaturityDate = maturityDate ? formatDateForInput(maturityDate) : "";
                            }

                            // Fetch customer details using F_Member
                            if (memberData.F_Member) {
                                try {
                                    const customerUrl = `${API_WEB_URLS.BASE}Masters/0/token/CustomerMaster/Id/${memberData.F_Member}`;
                                    const customerResponse = await API_HELPER.apiGET(customerUrl);
                                    const customerData = customerResponse?.data?.dataList?.[0] || customerResponse?.data?.response?.[0] || customerResponse?.data?.[0] || customerResponse?.data;
                                    
                                    if (customerData) {
                                        newFormValues.MemberName = customerData.Name || customerData.CustomerName || customerData.MemberName || "";
                                        newFormValues.ContactNo = customerData.Mobile || customerData.ContactNo || customerData.Phone || "";
                                        newFormValues.Address = customerData.Address || customerData.CustomerAddress || "";
                                    }
                                } catch (customerError) {
                                    console.error("Failed to fetch customer data:", customerError);
                                }
                            }

                            // Fetch scheme name using F_AccountTypeScheme
                            if (memberData.F_AccountTypeScheme) {
                                try {
                                    const schemeUrl = `${API_WEB_URLS.BASE}Masters/0/token/AccountTypeSchemeData/Id/${memberData.F_AccountTypeScheme}`;
                                    const schemeResponse = await API_HELPER.apiGET(schemeUrl);
                                    const schemeData = schemeResponse?.data?.dataList?.[0] || schemeResponse?.data?.response?.[0] || schemeResponse?.data?.[0] || schemeResponse?.data;
                                    
                                    if (schemeData) {
                                        newFormValues.SchemeName = schemeData.Name || schemeData.SchemeName || "";
                                    }
                                } catch (schemeError) {
                                    console.error("Failed to fetch scheme data:", schemeError);
                                }
                            }
                        }
                    } catch (memberError) {
                        console.error("Failed to fetch member account data:", memberError);
                    }
                }

                setEditFormValues(newFormValues);
            }
        } catch (error) {
            console.error("Failed to fetch payment data:", error);
            toast.error("Failed to load payment data");
        } finally {
            setIsLoadingEdit(false);
        }
    };

    /* ── Load dropdown data ── */
    useEffect(() => {
        Fn_FillListData(dispatch, setAccountTypeState, "dataList", `${API_WEB_URLS.MASTER}/0/token/accountType/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setPaymentMethodState, "dataList", `${API_WEB_URLS.MASTER}/0/token/PaymentMethodMaster/Id/0`).catch(console.error);
    }, [dispatch]);

    /* ── Fetch Ledger based on Payment Mode ── */
    useEffect(() => {
        if (currentPaymentMode === "1") {
            // Cash - fetch cash ledger from group 16
            setCashLedgerState({ dataList: [], isProgress: true });
            Fn_FillListData(
                dispatch,
                setCashLedgerState,
                "dataList",
                `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/tbl.F_LedgerGroupMaster/16`
            ).then((data) => {
                console.log("Cash Ledger fetched:", data);
            }).catch(console.error);
        } else if (currentPaymentMode === "2" || currentPaymentMode === "5") {
            // Cheque or Online - fetch bank ledger from group 12
            setBankLedgerState({ dataList: [], isProgress: true });
            Fn_FillListData(
                dispatch,
                setBankLedgerState,
                "dataList",
                `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/tbl.F_LedgerGroupMaster/12`
            ).catch(console.error);
        }
    }, [dispatch, currentPaymentMode]);

    // Debug: Log cash ledger state when it changes
    useEffect(() => {
        if (cashLedgerState.dataList.length > 0) {
            console.log("Cash Ledger State Updated:", cashLedgerState.dataList);
        }
    }, [cashLedgerState.dataList]);

    /* ── Fetch AccountTypeScheme when AccountType changes ── */
    useEffect(() => {
        if (selectedAccountType) {
            setAccountTypeSchemeState({ dataList: [], isProgress: true });
            setSelectedAccountTypeScheme("");
            setAccountListState({ dataList: [], isProgress: false });
            setSelectedAccount("");
            Fn_FillListData(
                dispatch, 
                setAccountTypeSchemeState, 
                "dataList", 
                `${API_WEB_URLS.MASTER}/0/token/AccountTypeSchemeByType/TBL.F_AccountType/${selectedAccountType}`
            ).catch(console.error);
        } else {
            setAccountTypeSchemeState({ dataList: [], isProgress: false });
            setSelectedAccountTypeScheme("");
            setAccountListState({ dataList: [], isProgress: false });
            setSelectedAccount("");
        }
    }, [dispatch, selectedAccountType]);

    /* ── Fetch Accounts when AccountTypeScheme changes ── */
    useEffect(() => {
        if (selectedAccountTypeScheme) {
            setAccountListState({ dataList: [], isProgress: true });
            setSelectedAccount("");
            Fn_FillListData(
                dispatch, 
                setAccountListState, 
                "dataList", 
                `${API_WEB_URLS.MASTER}/0/token/MemberAccountDataByScheme/Id/${selectedAccountTypeScheme}`
            ).catch(console.error);
        } else {
            setAccountListState({ dataList: [], isProgress: false });
            setSelectedAccount("");
        }
    }, [dispatch, selectedAccountTypeScheme]);

    useEffect(() => {
        accountNoRef.current?.focus();
    }, []);

    /* ── Convert number to words ── */
    const convertToWords = (num: number): string => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        if (num === 0) return 'Zero';
        if (num < 0) return 'Minus ' + convertToWords(Math.abs(num));

        let words = '';

        if (Math.floor(num / 10000000) > 0) {
            words += convertToWords(Math.floor(num / 10000000)) + ' Crore ';
            num %= 10000000;
        }
        if (Math.floor(num / 100000) > 0) {
            words += convertToWords(Math.floor(num / 100000)) + ' Lakh ';
            num %= 100000;
        }
        if (Math.floor(num / 1000) > 0) {
            words += convertToWords(Math.floor(num / 1000)) + ' Thousand ';
            num %= 1000;
        }
        if (Math.floor(num / 100) > 0) {
            words += convertToWords(Math.floor(num / 100)) + ' Hundred ';
            num %= 100;
        }
        if (num > 0) {
            if (num < 20) {
                words += ones[num];
            } else {
                words += tens[Math.floor(num / 10)];
                if (num % 10 > 0) {
                    words += ' ' + ones[num % 10];
                }
            }
        }

        return words.trim() + ' Only';
    };

    /* ── Handle account search ── */
    const handleAccountSearch = (setFieldValue: (field: string, value: any) => void) => {
        setFormikSetFieldValue(() => setFieldValue);
        setAccountSearchModal(true);
    };

    const handleSelectAccount = (account: any) => {
        if (formikSetFieldValue) {
            formikSetFieldValue("AccountNo", account.AccountNo || "");
            formikSetFieldValue("AccountId", account.Id || ""); // F_MemberAccountMaster
            formikSetFieldValue("MemberName", account.CustomerName || account.MemberName || account.Name || "");
            formikSetFieldValue("MemberId", account.F_Member || account.MemberId || "");
            formikSetFieldValue("ContactNo", account.CustomerMobile || account.ContactNo || account.Mobile || "");
            formikSetFieldValue("Address", account.CustomerAddress || account.Address || "");
            
            // Get scheme name from selected scheme dropdown
            const schemeName = selectedAccountTypeScheme 
                ? accountTypeSchemeState.dataList.find((s: any) => String(s.Id) === selectedAccountTypeScheme)?.Name || account.SchemeName || ""
                : account.SchemeName || "";
            formikSetFieldValue("SchemeName", schemeName);
            
            // Format dates if they exist
            const openingDate = account.RepaymentStartDate || account.OpeningDate || "";
            const formattedOpeningDate = openingDate ? new Date(openingDate).toISOString().split('T')[0] : "";
            formikSetFieldValue("OpeningDate", formattedOpeningDate);
            
            formikSetFieldValue("InterestRate", account.InterestRate || account.ROI || "");
            
            // Calculate maturity date from last EMI in EMIScheduleJson
            let formattedMaturityDate = "";
            if (account.EMIScheduleJson) {
                try {
                    const emiSchedule = typeof account.EMIScheduleJson === 'string' 
                        ? JSON.parse(account.EMIScheduleJson) 
                        : account.EMIScheduleJson;
                    if (Array.isArray(emiSchedule) && emiSchedule.length > 0) {
                        const lastEMI = emiSchedule[emiSchedule.length - 1];
                        if (lastEMI.DueDate) {
                            formattedMaturityDate = new Date(lastEMI.DueDate).toISOString().split('T')[0];
                        }
                    }
                } catch (error) {
                    console.error("Error parsing EMIScheduleJson:", error);
                }
            }
            if (!formattedMaturityDate) {
                const maturityDate = account.EndDate || account.MaturityDate || "";
                formattedMaturityDate = maturityDate ? new Date(maturityDate).toISOString().split('T')[0] : "";
            }
            formikSetFieldValue("MaturityDate", formattedMaturityDate);
            
            formikSetFieldValue("TotalAmount", account.LoanAmount || account.TotalAmount || "");
            formikSetFieldValue("MonthlyAmount", account.EMIAmount || account.MonthlyAmount || "");
            
            // Store DisbursementAmount and DisbursedAmount for validation
            formikSetFieldValue("DisbursementAmount", parseFloat(account.DisbursementAmount) || 0);
            formikSetFieldValue("DisbursedAmount", parseFloat(account.DisbursedAmount) || 0);
        }
        setAccountSearchModal(false);
        setSearchText("");
        setSelectedAccountType("");
        setSelectedAccountTypeScheme("");
    };

    /* ── Validation schema based on payment mode ── */
    const getValidationSchema = (paymentMode: string) => {
        const baseSchema = {
            AccountNo: Yup.string().required("Account No is required"),
            VoucherDate: Yup.string().required("Voucher Date is required"),
            PaymentMode: Yup.string().required("Payment Mode is required"),
            Amount: Yup.number()
                .typeError("Must be a number")
                .required("Amount is required")
                .min(1, "Amount must be greater than 0")
                .test(
                    'max-disbursement',
                    'Total disbursement cannot exceed Disbursement Amount',
                    function(value) {
                        const { DisbursementAmount, DisbursedAmount } = this.parent;
                        if (!value || !DisbursementAmount) return true;
                        const totalDisbursement = (DisbursedAmount || 0) + value;
                        return totalDisbursement <= DisbursementAmount;
                    }
                ),
        };

        // Cheque mode (ID = 2)
        if (paymentMode === "2") {
            return Yup.object({
                ...baseSchema,
                ChequeNo: Yup.string().required("Cheque No is required"),
                ChequeDate: Yup.string().required("Cheque Date is required"),
                F_Bank: Yup.string().required("Bank is required"),
            });
        }

        // Online mode (ID = 5)
        if (paymentMode === "5") {
            return Yup.object({
                ...baseSchema,
                UTRNo: Yup.string().required("UTR No is required"),
                TransactionDate: Yup.string().required("Transaction Date is required"),
                F_Bank: Yup.string().required("Bank is required"),
            });
        }
        
        return Yup.object(baseSchema);
    };

    /* ── Submit ── */
    const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
        try {
            const fd = new FormData();

            // Add Id for edit mode
            fd.append("Id", String(editId));

            // Required fields
            fd.append("F_MemberAccountMaster", values.AccountId);
            fd.append("DisbursementDate", values.VoucherDate);
            fd.append("Amount", values.Amount);
            fd.append("Remarks", values.Narration);
            fd.append("F_BranchOffice", localStorage.getItem("F_BranchOffice") || "");
            fd.append("F_PaymentMethodMaster", values.PaymentMode);

            // Payment mode specific fields
            if (values.PaymentMode === "1") {
                // Cash - get cash ledger ID (API returns ID in uppercase)
                const cashLedger = cashLedgerState.dataList[0];
                const cashLedgerId = cashLedger?.ID || cashLedger?.Id || "";
                fd.append("F_DisbursementLedger", String(cashLedgerId));
                console.log("Cash Ledger:", cashLedger, "ID:", cashLedgerId);
            } else if (values.PaymentMode === "2") {
                // Cheque - F_DisbursementLedger = Bank Ledger ID, BankName = Bank Name
                fd.append("F_DisbursementLedger", values.F_Bank);
                fd.append("BankName", values.BankName);
                fd.append("ChequeNo", values.ChequeNo);
                fd.append("ChequeDate", values.ChequeDate);
                console.log("Cheque - F_DisbursementLedger:", values.F_Bank, "BankName:", values.BankName);
            } else if (values.PaymentMode === "5") {
                // Online - F_DisbursementLedger = Bank Ledger ID, BankName = Bank Name
                fd.append("F_DisbursementLedger", values.F_Bank);
                fd.append("BankName", values.BankName);
                fd.append("UTRNo", values.UTRNo);
                fd.append("TransactionDate", values.TransactionDate);
                console.log("Online - F_DisbursementLedger:", values.F_Bank, "BankName:", values.BankName);
            }

            const apiUrl = `${API_WEB_URLS.BASE}Payment/${loggedUserId}/token`;
            console.log("Submitting to:", apiUrl);
            
            const response = await API_HELPER.apiPOST_Multipart(apiUrl, fd);
            console.log("Response:", response);

            if (response && (response.status === 200 || response.success)) {
                toast.success(isEditMode ? "Payment updated successfully!" : "Payment saved successfully!");
                if (isEditMode) {
                    navigate("/paymentList");
                } else {
                    resetForm();
                    setCurrentPaymentMode("");
                }
            } else {
                toast.error(response?.message || "Failed to save payment");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Error saving payment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Filter accounts for modal ── */
    const displayAccounts = useMemo(() => {
        // Use accounts from API when scheme is selected
        if (selectedAccountTypeScheme && accountListState.dataList.length > 0) {
            const search = searchText.toLowerCase();
            const schemeName = accountTypeSchemeState.dataList.find((s: any) => String(s.Id) === selectedAccountTypeScheme)?.Name || "";
            
            return accountListState.dataList.filter((acc: any) => {
                if (!searchText) return true;
                return (
                    (acc.AccountNo?.toLowerCase().includes(search)) ||
                    (acc.CustomerName?.toLowerCase().includes(search)) ||
                    (acc.MemberName?.toLowerCase().includes(search)) ||
                    (acc.Name?.toLowerCase().includes(search))
                );
            }).map((acc: any) => ({
                ...acc,
                SchemeName: schemeName,
                MemberName: acc.CustomerName || acc.MemberName || acc.Name
            }));
        }
        return [];
    }, [selectedAccountTypeScheme, accountListState.dataList, searchText, accountTypeSchemeState.dataList]);

    /* ─── Render ─────────────────────────────────────────── */
    return (
        <div className="page-body">
            <Breadcrumbs mainTitle={isEditMode ? "Edit Payment" : "Voucher Payment"} parent="Transactions" />
            <Container fluid>
                {isLoadingEdit ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                        <p className="mt-2">Loading payment data...</p>
                    </div>
                ) : (
                <Row>
                    <Col xs="12">
                        <Formik<FormValues>
                            initialValues={isEditMode ? editFormValues : initialValues}
                            validationSchema={Yup.lazy((values) => getValidationSchema(values.PaymentMode))}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleChange, handleBlur, setFieldValue, errors, touched, isSubmitting }: FormikProps<FormValues>) => (
                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                    {/* ─── Voucher Information Card ─── */}
                                    <Card className="mb-3">
                                        <CardHeaderCommon title="Voucher Information" tagClass="card-title mb-0" />
                                        <CardBody>
                                            <Row className="gy-3">
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Account No <span className="text-danger">*</span></Label>
                                                        <InputGroup>
                                                            <Input
                                                                type="text"
                                                                name="AccountNo"
                                                                value={values.AccountNo}
                                                                readOnly
                                                                innerRef={accountNoRef}
                                                                invalid={touched.AccountNo && !!errors.AccountNo}
                                                                style={{ backgroundColor: "#f5f5f5" }}
                                                            />
                                                            <Btn color="primary" type="button" onClick={() => handleAccountSearch(setFieldValue)}>
                                                                <i className="fa fa-search" />
                                                            </Btn>
                                                        </InputGroup>
                                                        <ErrorMessage name="AccountNo" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>Voucher Date <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="date"
                                                            name="VoucherDate"
                                                            value={values.VoucherDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.VoucherDate && !!errors.VoucherDate}
                                                        />
                                                        <ErrorMessage name="VoucherDate" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>Payment Mode <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="PaymentMode"
                                                            value={values.PaymentMode}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setCurrentPaymentMode(e.target.value);
                                                                // Reset mode-specific fields
                                                                setFieldValue("ChequeNo", "");
                                                                setFieldValue("ChequeDate", "");
                                                                setFieldValue("F_Bank", "");
                                                                setFieldValue("BankName", "");
                                                                setFieldValue("UTRNo", "");
                                                                setFieldValue("TransactionDate", new Date().toISOString().split("T")[0]);
                                                            }}
                                                            onBlur={handleBlur}
                                                            style={{ backgroundColor: "#ffe4c4" }}
                                                        >
                                                            <option value="">Select Payment Mode...</option>
                                                            {paymentMethodState.dataList.map((method: any) => (
                                                                <option key={method.Id} value={method.Id}>{method.Name}</option>
                                                            ))}
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* ─── Cheque Fields (Payment Mode ID = 2) ─── */}
                                            {values.PaymentMode === "2" && (
                                                <Row className="gy-3 mt-2">
                                                    <Col md="3">
                                                        <FormGroup className="mb-0">
                                                            <Label>Select Bank <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="F_Bank"
                                                                value={values.F_Bank}
                                                                onChange={(e) => {
                                                                    handleChange(e);
                                                                    const selectedBank = bankLedgerState.dataList.find((b: any) => String(b.ID || b.Id) === e.target.value);
                                                                    setFieldValue("BankName", selectedBank?.Name || "");
                                                                }}
                                                                onBlur={handleBlur}
                                                                invalid={touched.F_Bank && !!errors.F_Bank}
                                                                disabled={bankLedgerState.isProgress}
                                                            >
                                                                <option value="">Select Bank...</option>
                                                                {bankLedgerState.dataList.map((bank: any) => {
                                                                    const bankId = bank.ID || bank.Id;
                                                                    return <option key={bankId} value={bankId}>{bank.Name}</option>;
                                                                })}
                                                            </Input>
                                                            <ErrorMessage name="F_Bank" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2">
                                                        <FormGroup className="mb-0">
                                                            <Label>Cheque No. <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="text"
                                                                name="ChequeNo"
                                                                value={values.ChequeNo}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.ChequeNo && !!errors.ChequeNo}
                                                            />
                                                            <ErrorMessage name="ChequeNo" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2">
                                                        <FormGroup className="mb-0">
                                                            <Label>Cheque Date <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="date"
                                                                name="ChequeDate"
                                                                value={values.ChequeDate}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.ChequeDate && !!errors.ChequeDate}
                                                            />
                                                            <ErrorMessage name="ChequeDate" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}

                                            {/* ─── Online Fields (Payment Mode ID = 5) ─── */}
                                            {values.PaymentMode === "5" && (
                                                <Row className="gy-3 mt-2">
                                                    <Col md="3">
                                                        <FormGroup className="mb-0">
                                                            <Label>Select Bank <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="F_Bank"
                                                                value={values.F_Bank}
                                                                onChange={(e) => {
                                                                    handleChange(e);
                                                                    const selectedBank = bankLedgerState.dataList.find((b: any) => String(b.ID || b.Id) === e.target.value);
                                                                    setFieldValue("BankName", selectedBank?.Name || "");
                                                                }}
                                                                onBlur={handleBlur}
                                                                invalid={touched.F_Bank && !!errors.F_Bank}
                                                                disabled={bankLedgerState.isProgress}
                                                            >
                                                                <option value="">Select Bank...</option>
                                                                {bankLedgerState.dataList.map((bank: any) => {
                                                                    const bankId = bank.ID || bank.Id;
                                                                    return <option key={bankId} value={bankId}>{bank.Name}</option>;
                                                                })}
                                                            </Input>
                                                            <ErrorMessage name="F_Bank" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2">
                                                        <FormGroup className="mb-0">
                                                            <Label>UTR No. <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="text"
                                                                name="UTRNo"
                                                                value={values.UTRNo}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.UTRNo && !!errors.UTRNo}
                                                            />
                                                            <ErrorMessage name="UTRNo" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2">
                                                        <FormGroup className="mb-0">
                                                            <Label>Transaction Date <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="date"
                                                                name="TransactionDate"
                                                                value={values.TransactionDate}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.TransactionDate && !!errors.TransactionDate}
                                                            />
                                                            <ErrorMessage name="TransactionDate" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}
                                        </CardBody>
                                    </Card>

                                    {/* ─── Account Information Card ─── */}
                                    <Card className="mb-3">
                                        <CardHeaderCommon title="Account Information" tagClass="card-title mb-0" />
                                        <CardBody>
                                            <Row className="gy-3">
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Scheme Name</Label>
                                                        <Input type="text" name="SchemeName" value={values.SchemeName} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Opening Date</Label>
                                                        <Input type="text" name="OpeningDate" value={values.OpeningDate} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Interest (%)</Label>
                                                        <Input type="text" name="InterestRate" value={values.InterestRate} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row className="gy-3 mt-2">
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Maturity Date</Label>
                                                        <Input type="text" name="MaturityDate" value={values.MaturityDate} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Total Amount</Label>
                                                        <Input type="text" name="TotalAmount" value={values.TotalAmount} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Monthly Amount</Label>
                                                        <Input type="text" name="MonthlyAmount" value={values.MonthlyAmount} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                    </Card>

                                    {/* ─── Member Information Card (Collapsible) ─── */}
                                    <Card className="mb-3">
                                        <div 
                                            className="card-header d-flex align-items-center cursor-pointer" 
                                            onClick={() => setMemberInfoExpanded(!memberInfoExpanded)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <i className={`fa fa-${memberInfoExpanded ? 'minus' : 'plus'}-square me-2`} style={{ color: "#4a90d9" }} />
                                            <span className="card-title mb-0">Member Information</span>
                                        </div>
                                        {memberInfoExpanded && (
                                            <CardBody>
                                                <Row className="gy-3">
                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>Member Name</Label>
                                                            <Input type="text" name="MemberName" value={values.MemberName} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>Member ID</Label>
                                                            <Input type="text" name="MemberId" value={values.MemberId} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>Contact No.</Label>
                                                            <Input type="text" name="ContactNo" value={values.ContactNo} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row className="gy-3 mt-2">
                                                    <Col md="6">
                                                        <FormGroup className="mb-0">
                                                            <Label>Address</Label>
                                                            <Input type="text" name="Address" value={values.Address} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        )}
                                    </Card>

                                    {/* ─── Payment Information Card ─── */}
                                    <Card className="mb-3">
                                        <CardHeaderCommon title="Payment Information" tagClass="card-title mb-0" />
                                        <CardBody>
                                            <Row className="gy-3">
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>Amount <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="number"
                                                            name="Amount"
                                                            value={values.Amount}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                const amount = parseFloat(e.target.value) || 0;
                                                                setFieldValue("AmountInWords", amount > 0 ? convertToWords(amount) : "");
                                                            }}
                                                            onBlur={handleBlur}
                                                            invalid={touched.Amount && !!errors.Amount}
                                                        />
                                                        <ErrorMessage name="Amount" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row className="gy-3 mt-2">
                                                <Col md="6">
                                                    <FormGroup className="mb-0">
                                                        <Label>Amount In Words</Label>
                                                        <Input
                                                            type="text"
                                                            name="AmountInWords"
                                                            value={values.AmountInWords}
                                                            readOnly
                                                            style={{ backgroundColor: "#f5f5f5" }}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row className="gy-3 mt-2">
                                                <Col md="6">
                                                    <FormGroup className="mb-0">
                                                        <Label>Narration</Label>
                                                        <Input
                                                            type="text"
                                                            name="Narration"
                                                            value={values.Narration}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="success" type="submit" disabled={isSubmitting} className="text-white">
                                                <i className="fa fa-save me-1" />
                                                {isSubmitting ? "Saving..." : (isEditMode ? "Update" : "Save")}
                                            </Btn>
                                            <Btn color="secondary" type="reset" onClick={() => {
                                                if (isEditMode) {
                                                    navigate("/paymentList");
                                                } else {
                                                    setCurrentPaymentMode("");
                                                }
                                            }}>
                                                <i className="fa fa-times me-1" /> {isEditMode ? "Back" : "Cancel"}
                                            </Btn>
                                            <Btn color="warning" type="button">
                                                <i className="fa fa-print me-1" /> Print
                                            </Btn>
                                        </CardFooter>
                                    </Card>
                                </Form>
                            )}
                        </Formik>
                    </Col>
                </Row>
                )}
            </Container>

            {/* ─── Account Search Modal ─── */}
            <Modal isOpen={accountSearchModal} toggle={() => setAccountSearchModal(false)} size="lg">
                <ModalHeader toggle={() => setAccountSearchModal(false)}>Search Account</ModalHeader>
                <ModalBody>
                    <Row className="mb-3">
                        <Col md="4">
                            <FormGroup className="mb-0">
                                <Label>Account Type</Label>
                                <Input
                                    type="select"
                                    value={selectedAccountType}
                                    onChange={(e) => setSelectedAccountType(e.target.value)}
                                >
                                    <option value="">All Account Types</option>
                                    {accountTypeState.dataList.map((type: any) => (
                                        <option key={type.Id} value={type.Id}>{type.Name}</option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup className="mb-0">
                                <Label>Account Type Scheme</Label>
                                <Input
                                    type="select"
                                    value={selectedAccountTypeScheme}
                                    onChange={(e) => setSelectedAccountTypeScheme(e.target.value)}
                                    disabled={!selectedAccountType || accountTypeSchemeState.isProgress}
                                >
                                    <option value="">All Schemes</option>
                                    {accountTypeSchemeState.dataList.map((scheme: any) => (
                                        <option key={scheme.Id} value={scheme.Id}>{scheme.Name}</option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup className="mb-0">
                                <Label>Search</Label>
                                <Input
                                    type="text"
                                    placeholder="Search by Account No or Member Name..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    {accountListState.isProgress ? (
                        <div className="text-center p-3">
                            <Spinner color="primary" />
                        </div>
                    ) : (
                        <Table bordered hover responsive size="sm">
                            <thead>
                                <tr>
                                    <th>Account No</th>
                                    <th>Member Name</th>
                                    <th>Scheme</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">No accounts found</td>
                                    </tr>
                                ) : (
                                    displayAccounts.slice(0, 50).map((acc: any) => (
                                        <tr key={acc.Id}>
                                            <td>{acc.AccountNo}</td>
                                            <td>{acc.MemberName || acc.Name}</td>
                                            <td>{acc.SchemeName}</td>
                                            <td>
                                                <Btn color="primary" size="sm" onClick={() => handleSelectAccount(acc)}>
                                                    Select
                                                </Btn>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}
                </ModalBody>
            </Modal>
        </div>
    );
};

export default Payment;
