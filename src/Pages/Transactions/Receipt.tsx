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
    InputGroupText,
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
import { Fn_AddEditData, Fn_FillListData, Fn_GetReport } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { API_HELPER } from "../../helpers/ApiHelper";
import { toast } from "react-toastify";

/* ─── Types ─────────────────────────────────────────────── */

interface FormValues {
    // Voucher Information
    AccountNo: string;
    VoucherDate: string;
    ReceiveMode: string;
    F_MemberAccountMaster: string;
    F_ReceiptLedger: string;

    // Cheque fields
    ChequeNo: string;
    ChequeDate: string;
    BankName: string;

    // Online Transfer fields
    UTRNo: string;
    TransactionDate: string;

    // Legacy fields (keep for backward compatibility)
    ChequeAmount: string;
    BankCode: string;
    F_Bank: string;
    F_MakerBank: string;
    F_MakerBranch: string;
    F_BankAccountNo: string;
    TransId: string;
    TransDate: string;
    IBCA_MASA: string;
    Bal: string;
    OTP: string;

    // Member Information (read-only)
    MemberName: string;
    MemberId: string;
    MembershipDate: string;
    FatherName: string;
    DateOfBirth: string;
    ContactNo: string;
    Address: string;

    // Account Information (read-only)
    SchemeName: string;
    OpeningDate: string;
    InterestRate: string;
    MaturityDate: string;
    TotalAmount: string;
    MonthlyAmount: string;

    // Last Installment Information
    InstallmentNo: string;
    LastDueDate: string;
    DaysOverdue: string;
    Penalty: string;
    EMIAmount: string;
    PrincipalAmount: string;
    InterestAmount: string;

    // Receipt Information
    ReceiptAmount: string;
    AmountInWords: string;
    ReceiptNo: string;
    ReceiptDate: string;
    Remarks: string;
}

const initialValues: FormValues = {
    AccountNo: "",
    VoucherDate: new Date().toISOString().split("T")[0],
    ReceiveMode: "",
    F_MemberAccountMaster: "",
    F_ReceiptLedger: "",

    ChequeNo: "",
    ChequeDate: "",
    BankName: "",

    UTRNo: "",
    TransactionDate: "",

    // Legacy fields
    ChequeAmount: "",
    BankCode: "",
    F_Bank: "",
    F_MakerBank: "",
    F_MakerBranch: "",
    F_BankAccountNo: "",
    TransId: "",
    TransDate: "",
    IBCA_MASA: "",
    Bal: "",
    OTP: "",

    MemberName: "",
    MemberId: "",
    MembershipDate: "",
    FatherName: "",
    DateOfBirth: "",
    ContactNo: "",
    Address: "",

    SchemeName: "",
    OpeningDate: "",
    InterestRate: "",
    MaturityDate: "",
    TotalAmount: "",
    MonthlyAmount: "",

    InstallmentNo: "",
    LastDueDate: "",
    DaysOverdue: "",
    Penalty: "",
    EMIAmount: "",
    PrincipalAmount: "",
    InterestAmount: "",

    ReceiptAmount: "",
    AmountInWords: "",
    ReceiptNo: "",
    ReceiptDate: new Date().toISOString().split("T")[0],
    Remarks: "",
};

interface DropState {
    dataList: any[];
    isProgress: boolean;
}

/* ─── Component ─────────────────────────────────────────── */

const Receipt = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const accountNoRef = useRef<HTMLInputElement | null>(null);

    const [bankState, setBankState] = useState<DropState>({ dataList: [], isProgress: true });
    const [branchState, setBranchState] = useState<DropState>({ dataList: [], isProgress: false });
    const [accountState, setAccountState] = useState<DropState>({ dataList: [], isProgress: false });
    const [memberAccountState, setMemberAccountState] = useState<DropState>({ dataList: [], isProgress: true });
    const [accountSearchModal, setAccountSearchModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [formikSetFieldValue, setFormikSetFieldValue] = useState<((field: string, value: any) => void) | null>(null);

    // Account Type/Scheme states (like Payment.tsx)
    const [accountTypeState, setAccountTypeState] = useState<DropState>({ dataList: [], isProgress: true });
    const [accountTypeSchemeState, setAccountTypeSchemeState] = useState<DropState>({ dataList: [], isProgress: false });
    const [accountListState, setAccountListState] = useState<DropState>({ dataList: [], isProgress: false });
    const [selectedAccountType, setSelectedAccountType] = useState("");
    const [selectedAccountTypeScheme, setSelectedAccountTypeScheme] = useState("");
    const [paymentMethodState, setPaymentMethodState] = useState<DropState>({ dataList: [], isProgress: true });
    const [cashLedgerState, setCashLedgerState] = useState<DropState>({ dataList: [], isProgress: false });
    const [bankLedgerState, setBankLedgerState] = useState<DropState>({ dataList: [], isProgress: false });
    const [currentReceiveMode, setCurrentReceiveMode] = useState("");

    // Edit mode states
    const [editId, setEditId] = useState<number>(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const [editFormValues, setEditFormValues] = useState<FormValues>(initialValues);
    const [memberInfoExpanded, setMemberInfoExpanded] = useState(false);

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const loggedUserId = "0";

    /* ── Load branches when bank changes ── */
    const loadBranches = (bankId: string) => {
        if (bankId) {
            setBranchState({ dataList: [], isProgress: true });
            Fn_FillListData(dispatch, setBranchState, "dataList", `${API_WEB_URLS.MASTER}/0/token/BankBranch/Id/${bankId}`).catch(console.error);
        } else {
            setBranchState({ dataList: [], isProgress: false });
        }
    };

    /* ── Load bank accounts when branch changes ── */
    const loadBankAccounts = (branchId: string) => {
        if (branchId) {
            setAccountState({ dataList: [], isProgress: true });
            Fn_FillListData(dispatch, setAccountState, "dataList", `${API_WEB_URLS.MASTER}/0/token/BankAccount/Id/${branchId}`).catch(console.error);
        } else {
            setAccountState({ dataList: [], isProgress: false });
        }
    };

    /* ── Convert number to words ── */
    const convertToWords = (num: number): string => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const toWords = (n: number): string => {
            if (n === 0) return '';
            if (n < 0) return 'Minus ' + toWords(Math.abs(n));

            let words = '';

            if (Math.floor(n / 10000000) > 0) {
                words += toWords(Math.floor(n / 10000000)) + ' Crore ';
                n %= 10000000;
            }
            if (Math.floor(n / 100000) > 0) {
                words += toWords(Math.floor(n / 100000)) + ' Lakh ';
                n %= 100000;
            }
            if (Math.floor(n / 1000) > 0) {
                words += toWords(Math.floor(n / 1000)) + ' Thousand ';
                n %= 1000;
            }
            if (Math.floor(n / 100) > 0) {
                words += toWords(Math.floor(n / 100)) + ' Hundred ';
                n %= 100;
            }
            if (n > 0) {
                if (n < 20) {
                    words += ones[n];
                } else {
                    words += tens[Math.floor(n / 10)];
                    if (n % 10 > 0) {
                        words += ' ' + ones[n % 10];
                    }
                }
            }

            return words.trim();
        };

        if (num === 0) return 'Zero Only';
        return toWords(num) + ' Only';
    };

    /* ── Fetch receipt data for edit ── */
    const fetchReceiptData = async (id: number) => {
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
                "receiptData",
                `GetReceiptData/${loggedUserId}/token`,
                { arguList: { id: id, formData: fd } },
                true
            );

            // Response is in data.response array format
            const data = Array.isArray(response) ? response[0] : response;
            if (data) {
                // Set receive mode first so bank ledgers can be fetched
                const receiveMode = String(data.F_PaymentMethodMaster || data.ReceiveMode || "");
                setCurrentReceiveMode(receiveMode);

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
                    // API fields
                    F_MemberAccountMaster: String(data.F_MemberAccountMaster || ""),
                    F_ReceiptLedger: String(data.F_ReceiptLedger || ""),
                    AccountNo: data.AccountNo || "",
                    VoucherDate: formatDateForInput(data.VoucherDate || data.ReceiptDate) || new Date().toISOString().split("T")[0],
                    ReceiveMode: receiveMode,
                    ReceiptAmount: String(data.TotalAmount || data.ReceiptAmount || data.Amount || ""),
                    PrincipalAmount: String(data.PrincipalAmount || "0"),
                    InterestAmount: String(data.InterestAmount || "0"),
                    Penalty: String(data.Penalty || "0"),
                    Remarks: data.Remarks || "",
                    ReceiptNo: data.ReceiptNo || data.VoucherNo || "",
                    ReceiptDate: formatDateForInput(data.ReceiptDate) || new Date().toISOString().split("T")[0],

                    // Cheque fields
                    ChequeNo: data.ChequeNo || "",
                    ChequeDate: formatDateForInput(data.ChequeDate),
                    BankName: data.BankName || "",

                    // Online Transfer fields
                    UTRNo: data.UTRNo || "",
                    TransactionDate: formatDateForInput(data.TransactionDate),

                    // Legacy fields (keep for backward compatibility)
                    ChequeAmount: String(data.ChequeAmount || ""),
                    BankCode: data.BankCode || "",
                    F_Bank: String(data.F_Bank || ""),
                    F_MakerBank: String(data.F_MakerBank || ""),
                    F_MakerBranch: String(data.F_MakerBranch || ""),
                    F_BankAccountNo: String(data.F_BankAccountNo || ""),
                    TransId: data.TransId || "",
                    TransDate: formatDateForInput(data.TransDate),
                    IBCA_MASA: data.IBCA_MASA || "",
                    Bal: String(data.Bal || ""),
                    OTP: data.OTP || "",
                };

                // Convert amount to words
                if (data.ReceiptAmount || data.Amount) {
                    newFormValues.AmountInWords = convertToWords(Math.floor(Number(data.ReceiptAmount || data.Amount)));
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
                                        newFormValues.FatherName = customerData.FatherName || "";
                                        newFormValues.DateOfBirth = formatDateForInput(customerData.DateOfBirth || customerData.DOB);
                                        newFormValues.ContactNo = customerData.Mobile || customerData.ContactNo || customerData.Phone || "";
                                        newFormValues.Address = customerData.Address || customerData.CustomerAddress || "";
                                        newFormValues.MembershipDate = formatDateForInput(customerData.MembershipDate || customerData.CreatedDate);
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

                    // Fetch Last Installment data
                    try {
                        const lastInstallmentUrl = `${API_WEB_URLS.BASE}Masters/0/token/LastInstallment/Id/${data.F_MemberAccountMaster}`;
                        const lastInstallmentResponse = await API_HELPER.apiGET(lastInstallmentUrl);
                        const lastInstallmentData = lastInstallmentResponse?.data?.dataList?.[0];
                        
                        if (lastInstallmentData) {
                            newFormValues.InstallmentNo = String(lastInstallmentData.InstallmentNo || "");
                            newFormValues.LastDueDate = formatDateForInput(lastInstallmentData.DueDate);
                            newFormValues.DaysOverdue = String(lastInstallmentData.DaysOverdue || 0);
                            newFormValues.Penalty = String(lastInstallmentData.Penalty || 0);
                            newFormValues.EMIAmount = String(lastInstallmentData.EMIAmount || 0);
                            newFormValues.PrincipalAmount = String(lastInstallmentData.PrincipalAmount || 0);
                            newFormValues.InterestAmount = String(lastInstallmentData.InterestAmount || 0);
                        }
                    } catch (lastInstallmentError) {
                        console.error("Failed to fetch last installment data:", lastInstallmentError);
                    }
                }

                // Load branches if F_MakerBank is set
                if (newFormValues.F_MakerBank) {
                    loadBranches(newFormValues.F_MakerBank);
                }

                // Load bank accounts if F_MakerBranch is set
                if (newFormValues.F_MakerBranch) {
                    loadBankAccounts(newFormValues.F_MakerBranch);
                }

                setEditFormValues(newFormValues);
            }
        } catch (error) {
            console.error("Failed to fetch receipt data:", error);
            toast.error("Failed to load receipt data");
        } finally {
            setIsLoadingEdit(false);
        }
    };

    /* ── Get Id from location state for edit mode ── */
    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;
        if (recordId > 0) {
            setEditId(recordId);
            setIsEditMode(true);
            fetchReceiptData(recordId);
        }
    }, [location.state]);

    /* ── Load dropdown data ── */
    useEffect(() => {
        Fn_FillListData(dispatch, setBankState, "dataList", `${API_WEB_URLS.MASTER}/0/token/BankMaster/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setMemberAccountState, "dataList", `${API_WEB_URLS.MASTER}/0/token/MemberAccountData/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setAccountTypeState, "dataList", `${API_WEB_URLS.MASTER}/0/token/accountType/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setPaymentMethodState, "dataList", `${API_WEB_URLS.MASTER}/0/token/PaymentMethodMaster/Id/0`).catch(console.error);
    }, [dispatch]);

    /* ── Fetch Ledger based on Receive Mode ── */
    useEffect(() => {
        if (currentReceiveMode === "1") {
            // Cash - fetch cash ledger from group 16
            setCashLedgerState({ dataList: [], isProgress: true });
            Fn_FillListData(
                dispatch,
                setCashLedgerState,
                "dataList",
                `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/tbl.F_LedgerGroupMaster/16`
            ).catch(console.error);
        } else if (currentReceiveMode === "2" || currentReceiveMode === "5") {
            // Cheque or Online - fetch bank ledger from group 12
            setBankLedgerState({ dataList: [], isProgress: true });
            Fn_FillListData(
                dispatch,
                setBankLedgerState,
                "dataList",
                `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/tbl.F_LedgerGroupMaster/12`
            ).catch(console.error);
        }
    }, [dispatch, currentReceiveMode]);

    /* ── Fetch AccountTypeScheme when AccountType changes ── */
    useEffect(() => {
        if (selectedAccountType) {
            setAccountTypeSchemeState({ dataList: [], isProgress: true });
            setSelectedAccountTypeScheme("");
            setAccountListState({ dataList: [], isProgress: false });
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
        }
    }, [dispatch, selectedAccountType]);

    /* ── Fetch Accounts when AccountTypeScheme changes ── */
    useEffect(() => {
        if (selectedAccountTypeScheme) {
            setAccountListState({ dataList: [], isProgress: true });
            Fn_FillListData(
                dispatch, 
                setAccountListState, 
                "dataList", 
                `${API_WEB_URLS.MASTER}/0/token/MemberAccountDataByScheme/Id/${selectedAccountTypeScheme}`
            ).catch(console.error);
        } else {
            setAccountListState({ dataList: [], isProgress: false });
        }
    }, [dispatch, selectedAccountTypeScheme]);

    useEffect(() => {
        accountNoRef.current?.focus();
    }, []);

    /* ── Handle account search ── */
    const handleAccountSearch = (setFieldValue: (field: string, value: any) => void) => {
        setFormikSetFieldValue(() => setFieldValue);
        setAccountSearchModal(true);
    };

    const handleSelectAccount = async (account: any) => {
        if (formikSetFieldValue) {
            // Set F_MemberAccountMaster (account Id) for API submission
            const memberAccountId = account.Id || account.MemberAccountId;
            formikSetFieldValue("F_MemberAccountMaster", String(memberAccountId || ""));
            
            formikSetFieldValue("AccountNo", account.AccountNo || "");
            formikSetFieldValue("MemberName", account.CustomerName || account.MemberName || account.Name || "");
            formikSetFieldValue("MemberId", account.F_Member || account.MemberId || account.Id || "");
            formikSetFieldValue("ContactNo", account.CustomerMobile || account.ContactNo || account.Mobile || "");
            formikSetFieldValue("Address", account.CustomerAddress || account.Address || "");
            formikSetFieldValue("FatherName", account.FatherName || "");
            
            // Format dates
            const formatDate = (dateStr: string | null | undefined) => {
                if (!dateStr) return "";
                try {
                    return new Date(dateStr).toISOString().split('T')[0];
                } catch {
                    return "";
                }
            };
            
            formikSetFieldValue("MembershipDate", formatDate(account.MembershipDate || account.CreatedDate));
            formikSetFieldValue("DateOfBirth", formatDate(account.DateOfBirth || account.DOB));
            
            // Get scheme name from selected scheme dropdown
            const schemeName = selectedAccountTypeScheme 
                ? accountTypeSchemeState.dataList.find((s: any) => String(s.Id) === selectedAccountTypeScheme)?.Name || account.SchemeName || ""
                : account.SchemeName || "";
            formikSetFieldValue("SchemeName", schemeName);
            
            formikSetFieldValue("OpeningDate", formatDate(account.RepaymentStartDate || account.OpeningDate));
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
                            formattedMaturityDate = formatDate(lastEMI.DueDate);
                        }
                    }
                } catch (error) {
                    console.error("Error parsing EMIScheduleJson:", error);
                }
            }
            if (!formattedMaturityDate) {
                formattedMaturityDate = formatDate(account.EndDate || account.MaturityDate);
            }
            formikSetFieldValue("MaturityDate", formattedMaturityDate);
            
            formikSetFieldValue("TotalAmount", account.LoanAmount || account.TotalAmount || "");
            formikSetFieldValue("MonthlyAmount", account.EMIAmount || account.MonthlyAmount || "");

            // Fetch Last Installment data
            if (memberAccountId) {
                try {
                    const lastInstallmentUrl = `${API_WEB_URLS.BASE}Masters/0/token/LastInstallment/Id/${memberAccountId}`;
                    const lastInstallmentResponse = await API_HELPER.apiGET(lastInstallmentUrl);
                    const lastInstallmentData = lastInstallmentResponse?.data?.dataList?.[0];
                    
                    if (lastInstallmentData) {
                        formikSetFieldValue("InstallmentNo", String(lastInstallmentData.InstallmentNo || ""));
                        formikSetFieldValue("LastDueDate", formatDate(lastInstallmentData.DueDate));
                        formikSetFieldValue("DaysOverdue", String(lastInstallmentData.DaysOverdue || 0));
                        formikSetFieldValue("Penalty", String(lastInstallmentData.Penalty || 0));
                        formikSetFieldValue("EMIAmount", String(lastInstallmentData.EMIAmount || 0));
                        formikSetFieldValue("PrincipalAmount", String(lastInstallmentData.PrincipalAmount || 0));
                        formikSetFieldValue("InterestAmount", String(lastInstallmentData.InterestAmount || 0));
                        
                        // Set ReceiptAmount as TotalAmountDue (EMIAmount + Penalty)
                        const totalAmount = lastInstallmentData.TotalAmountDue || ((lastInstallmentData.EMIAmount || 0) + (lastInstallmentData.Penalty || 0));
                        formikSetFieldValue("ReceiptAmount", String(totalAmount));
                        formikSetFieldValue("AmountInWords", totalAmount > 0 ? convertToWords(Math.floor(totalAmount)) : "");
                    }
                } catch (error) {
                    console.error("Failed to fetch last installment data:", error);
                }
            }
        }
        setAccountSearchModal(false);
        setSearchText("");
        setSelectedAccountType("");
        setSelectedAccountTypeScheme("");
    };

    /* ── Validation schema based on receive mode ── */
    const getReceiveModeName = (modeId: string): string => {
        const method = paymentMethodState.dataList.find((m: any) => String(m.Id) === modeId);
        return method?.Name || "";
    };

    const getValidationSchema = (receiveMode: string) => {
        const modeName = getReceiveModeName(receiveMode);
        const baseSchema = {
            F_MemberAccountMaster: Yup.string().required("Please select an account"),
            AccountNo: Yup.string().required("Account No is required"),
            VoucherDate: Yup.string().required("Voucher Date is required"),
            ReceiveMode: Yup.string().required("Receive Mode is required"),
            ReceiptAmount: Yup.number().typeError("Must be a number").required("Amount is required").min(1, "Amount must be greater than 0"),
        };

        // Cheque (ID = 2)
        if (receiveMode === "2" || modeName.toLowerCase().includes("cheque")) {
            return Yup.object({
                ...baseSchema,
                ChequeNo: Yup.string().required("Cheque No is required"),
                ChequeDate: Yup.string().required("Cheque Date is required"),
                F_ReceiptLedger: Yup.string().required("Bank is required"),
            });
        }
        
        // Online (ID = 5)
        if (receiveMode === "5" || modeName.toLowerCase().includes("online") || modeName.toLowerCase().includes("neft") || modeName.toLowerCase().includes("rtgs")) {
            return Yup.object({
                ...baseSchema,
                UTRNo: Yup.string().required("UTR No is required"),
                TransactionDate: Yup.string().required("Transaction Date is required"),
                F_ReceiptLedger: Yup.string().required("Bank is required"),
            });
        }
        
        return Yup.object(baseSchema);
    };

    /* ── Submit ── */
    const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
        try {
            const fd = new FormData();
            const modeName = getReceiveModeName(values.ReceiveMode);

            // Required fields as per API schema
            fd.append("F_MemberAccountMaster", values.F_MemberAccountMaster);
            fd.append("ReceiptDate", values.ReceiptDate || values.VoucherDate);
            fd.append("TotalAmount", values.ReceiptAmount);
            fd.append("PrincipalAmount", values.PrincipalAmount || "0");
            fd.append("InterestAmount", values.InterestAmount || "0");
            fd.append("Penalty", values.Penalty || "0");
            fd.append("Remarks", values.Remarks || "");
            fd.append("F_BranchOffice", localStorage.getItem("F_BranchOffice") || "0");
            fd.append("F_PaymentMethodMaster", values.ReceiveMode);

            // Payment mode specific fields (like Payment.tsx)
            if (values.ReceiveMode === "1") {
                // Cash - get cash ledger ID (API returns ID in uppercase)
                const cashLedger = cashLedgerState.dataList[0];
                const cashLedgerId = cashLedger?.ID || cashLedger?.Id || "";
                fd.append("F_ReceiptLedger", String(cashLedgerId));
            } else if (values.ReceiveMode === "2" || modeName.toLowerCase().includes("cheque")) {
                // Cheque - F_ReceiptLedger = Bank Ledger ID, BankName from selected bank
                fd.append("F_ReceiptLedger", values.F_ReceiptLedger);
                // Get BankName from selected ledger
                const selectedBank = bankLedgerState.dataList.find((b: any) => String(b.ID || b.Id) === values.F_ReceiptLedger);
                fd.append("BankName", selectedBank?.Name || values.BankName || "");
                fd.append("ChequeNo", values.ChequeNo || "");
                fd.append("ChequeDate", values.ChequeDate || "");
            } else if (values.ReceiveMode === "5" || modeName.toLowerCase().includes("online") || modeName.toLowerCase().includes("neft") || modeName.toLowerCase().includes("rtgs")) {
                // Online - F_ReceiptLedger = Bank Ledger ID, BankName from selected bank
                fd.append("F_ReceiptLedger", values.F_ReceiptLedger);
                // Get BankName from selected ledger
                const selectedBank = bankLedgerState.dataList.find((b: any) => String(b.ID || b.Id) === values.F_ReceiptLedger);
                fd.append("BankName", selectedBank?.Name || "");
                fd.append("UTRNo", values.UTRNo || "");
                fd.append("TransactionDate", values.TransactionDate || "");
            } else {
                // Default - use 0 for F_ReceiptLedger
                fd.append("F_ReceiptLedger", "0");
            }

            await Fn_AddEditData(
                dispatch,
                () => { },
                { arguList: { id: isEditMode ? editId : 0, formData: fd } },
                `Receipt/${loggedUserId}/token`,
                true,
                "receiptid",
                undefined,
                undefined
            );

            if (isEditMode) {
                toast.success("Receipt updated successfully");
                navigate("/receiptList");
            } else {
                toast.success("Receipt saved successfully");
                resetForm();
                setCurrentReceiveMode("");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Failed to save receipt");
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
            <Breadcrumbs mainTitle={isEditMode ? "Edit Voucher Receipt" : "Voucher Receipt"} parent="Transactions" />
            <Container fluid>
                {isLoadingEdit ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                        <p className="mt-2">Loading receipt data...</p>
                    </div>
                ) : (
                <Row>
                    <Col xs="12">
                        <Formik<FormValues>
                            initialValues={isEditMode ? editFormValues : initialValues}
                            validationSchema={Yup.lazy((values) => getValidationSchema(values.ReceiveMode))}
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
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
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
                                                <Col md="3">
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
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Receive Mode <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="ReceiveMode"
                                                            value={values.ReceiveMode}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setCurrentReceiveMode(e.target.value);
                                                                // Reset mode-specific fields
                                                                setFieldValue("ChequeNo", "");
                                                                setFieldValue("ChequeDate", "");
                                                                setFieldValue("BankName", "");
                                                                setFieldValue("UTRNo", "");
                                                                setFieldValue("TransactionDate", "");
                                                                setFieldValue("F_ReceiptLedger", "");
                                                            }}
                                                            onBlur={handleBlur}
                                                            style={{ backgroundColor: "#ffe4c4" }}
                                                        >
                                                            <option value="">Select Receive Mode...</option>
                                                            {paymentMethodState.dataList.map((method: any) => (
                                                                <option key={method.Id} value={method.Id}>{method.Name}</option>
                                                            ))}
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* ─── Cheque Fields ─── */}
                                            {(values.ReceiveMode === "2" || getReceiveModeName(values.ReceiveMode).toLowerCase().includes("cheque")) && values.ReceiveMode && (
                                                <Row className="gy-3 mt-2">
                                                    <Col md="3">
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
                                                    <Col md="3">
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
                                                    <Col md="6">
                                                        <FormGroup className="mb-0">
                                                            <Label>Bank <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="F_ReceiptLedger"
                                                                value={values.F_ReceiptLedger}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.F_ReceiptLedger && !!errors.F_ReceiptLedger}
                                                            >
                                                                <option value="">Select Bank...</option>
                                                                {bankLedgerState.dataList.map((ledger: any) => (
                                                                    <option key={ledger.ID || ledger.Id} value={ledger.ID || ledger.Id}>{ledger.Name}</option>
                                                                ))}
                                                            </Input>
                                                            <ErrorMessage name="F_ReceiptLedger" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}

                                            {/* ─── Online Transfer Fields ─── */}
                                            {(values.ReceiveMode === "5" || 
                                              getReceiveModeName(values.ReceiveMode).toLowerCase().includes("neft") ||
                                              getReceiveModeName(values.ReceiveMode).toLowerCase().includes("rtgs") ||
                                              getReceiveModeName(values.ReceiveMode).toLowerCase().includes("online")) && values.ReceiveMode && (
                                                <Row className="gy-3 mt-2">
                                                    <Col md="4">
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
                                                    <Col md="4">
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
                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>Bank <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="F_ReceiptLedger"
                                                                value={values.F_ReceiptLedger}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.F_ReceiptLedger && !!errors.F_ReceiptLedger}
                                                            >
                                                                <option value="">Select Bank...</option>
                                                                {bankLedgerState.dataList.map((ledger: any) => (
                                                                    <option key={ledger.ID || ledger.Id} value={ledger.ID || ledger.Id}>{ledger.Name}</option>
                                                                ))}
                                                            </Input>
                                                            <ErrorMessage name="F_ReceiptLedger" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}
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
                                            <Row className="gy-3 mt-2">
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>Installment No</Label>
                                                        <Input type="text" name="InstallmentNo" value={values.InstallmentNo} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>Due Date</Label>
                                                        <Input type="text" name="LastDueDate" value={values.LastDueDate} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>EMI Amount</Label>
                                                        <Input type="text" name="EMIAmount" value={values.EMIAmount} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                {values.DaysOverdue && Number(values.DaysOverdue) > 0 && (
                                                    <Col md="2">
                                                        <FormGroup className="mb-0">
                                                            <Label className="text-danger">Days Overdue</Label>
                                                            <Input type="text" name="DaysOverdue" value={values.DaysOverdue} readOnly style={{ backgroundColor: "#ffe4e4" }} />
                                                        </FormGroup>
                                                    </Col>
                                                )}
                                                {values.Penalty && Number(values.Penalty) > 0 && (
                                                    <Col md="2">
                                                        <FormGroup className="mb-0">
                                                            <Label className="text-danger">Penalty</Label>
                                                            <Input type="text" name="Penalty" value={values.Penalty} readOnly style={{ backgroundColor: "#ffe4e4" }} />
                                                        </FormGroup>
                                                    </Col>
                                                )}
                                            </Row>
                                        </CardBody>
                                    </Card>

                                    {/* ─── Receipt Information Card ─── */}
                                    <Card className="mb-3">
                                        <CardHeaderCommon title="Receipt Information" tagClass="card-title mb-0" />
                                        <CardBody>
                                            <Row className="gy-3">
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>Amount <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="number"
                                                            name="ReceiptAmount"
                                                            value={values.ReceiptAmount}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                const amount = parseFloat(e.target.value) || 0;
                                                                setFieldValue("AmountInWords", amount > 0 ? convertToWords(amount) : "");
                                                            }}
                                                            onBlur={handleBlur}
                                                            invalid={touched.ReceiptAmount && !!errors.ReceiptAmount}
                                                        />
                                                        <ErrorMessage name="ReceiptAmount" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="5">
                                                    <FormGroup className="mb-0">
                                                        <Label>Amount In Words</Label>
                                                        <Input
                                                            type="text"
                                                            name="AmountInWords"
                                                            value={values.AmountInWords}
                                                            readOnly
                                                            style={{ backgroundColor: "#f5f5f5" }}
                                                            placeholder="Amount in words"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row className="gy-3 mt-2">
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>Receipt No</Label>
                                                        <InputGroup>
                                                            <Btn color="light" type="button">Rcpt No.</Btn>
                                                            <Input
                                                                type="text"
                                                                name="ReceiptNo"
                                                                value={values.ReceiptNo}
                                                                readOnly
                                                                style={{ backgroundColor: "#f5f5f5" }}
                                                            />
                                                        </InputGroup>
                                                    </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>Receipt Date</Label>
                                                        <Input
                                                            type="date"
                                                            name="ReceiptDate"
                                                            value={values.ReceiptDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="5">
                                                    <FormGroup className="mb-0">
                                                        <Label>Remarks</Label>
                                                        <Input
                                                            type="text"
                                                            name="Remarks"
                                                            value={values.Remarks}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            placeholder="Remarks"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="success" type="submit" disabled={isSubmitting} className="text-white">
                                                <i className="fa fa-save me-1" />
                                                {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update" : "Save")}
                                            </Btn>
                                            <Btn 
                                                color="secondary" 
                                                type={isEditMode ? "button" : "reset"} 
                                                onClick={isEditMode ? () => navigate("/receiptList") : undefined}
                                            >
                                                <i className="fa fa-times me-1" /> Cancel
                                            </Btn>
                                            {!isEditMode && (
                                                <>
                                                    <Btn color="info" type="button" className="text-white">
                                                        <i className="fa fa-eye me-1" /> View Status
                                                    </Btn>
                                                    <Btn color="warning" type="button">
                                                        <i className="fa fa-print me-1" /> Print
                                                    </Btn>
                                                </>
                                            )}
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
                                    <option value="">Select Scheme First</option>
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
                                        <td colSpan={4} className="text-center">
                                            {selectedAccountTypeScheme ? "No accounts found" : "Please select Account Type and Scheme"}
                                        </td>
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

export default Receipt;
