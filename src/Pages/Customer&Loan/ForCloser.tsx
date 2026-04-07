import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
    Card,
    CardBody,
    Col,
    Container,
    FormGroup,
    Input,
    Label,
    Row,
    Table,
    Spinner,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Btn } from "../../AbstractElements";
import { Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { API_HELPER } from "../../helpers/ApiHelper";
import { toast } from "react-toastify";

interface DropState {
    dataList: any[];
    isProgress: boolean;
}

interface FormValues {
    // Account Information
    F_MemberAccountMaster: string;
    AccountNo: string;
    
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

    // Financial Information from API
    DisbursedAmount: string;
    ReceivedAmount: string;
    TotalInterest: string;
    InterestReceived: string;
    PenaltyReceived: string;

    // Last Installment Information
    InstallmentNo: string;
    LastDueDate: string;
    DaysOverdue: string;
    Penalty: string;
    EMIAmount: string;
    PrincipalAmount: string;
    InterestAmount: string;
    OutstandingAmount: string;

    // Calculated Fields
    RemainingPrincipal: string;
    RemainingInterest: string;

    // Discount Fields
    F_DiscountCalculationType: string;
    DiscountOnInterest: string;

    // Final Amount
    FinalAmountPayable: string;

    // Foreclosure Information
    ClosureDate: string;
    Remarks: string;

    // Payment Mode (like Receipt.tsx)
    PaymentMode: string;
    F_PaymentMethodMaster: string;
    F_ReceiptLedger: string;

    // Cheque fields
    ChequeNo: string;
    ChequeDate: string;
    BankName: string;

    // Online Transfer fields
    UTRNo: string;
    TransactionDate: string;
}

const initialValues: FormValues = {
    F_MemberAccountMaster: "",
    AccountNo: "",
    
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

    DisbursedAmount: "",
    ReceivedAmount: "",
    TotalInterest: "",
    InterestReceived: "",
    PenaltyReceived: "",

    InstallmentNo: "",
    LastDueDate: "",
    DaysOverdue: "",
    Penalty: "",
    EMIAmount: "",
    PrincipalAmount: "",
    InterestAmount: "",
    OutstandingAmount: "",

    RemainingPrincipal: "",
    RemainingInterest: "",

    F_DiscountCalculationType: "",
    DiscountOnInterest: "",

    FinalAmountPayable: "",

    ClosureDate: new Date().toISOString().split('T')[0],
    Remarks: "",

    PaymentMode: "",
    F_PaymentMethodMaster: "",
    F_ReceiptLedger: "",

    ChequeNo: "",
    ChequeDate: "",
    BankName: "",

    UTRNo: "",
    TransactionDate: "",
};

/* ─── Component ─────────────────────────────────────────── */

const ForCloser = () => {
    const dispatch = useDispatch();
    const accountNoRef = useRef<HTMLInputElement | null>(null);

    // Form state
    const [formValues, setFormValues] = useState<FormValues>(initialValues);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Account search modal states
    const [accountSearchModal, setAccountSearchModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [accountTypeState, setAccountTypeState] = useState<DropState>({ dataList: [], isProgress: true });
    const [accountTypeSchemeState, setAccountTypeSchemeState] = useState<DropState>({ dataList: [], isProgress: false });
    const [accountListState, setAccountListState] = useState<DropState>({ dataList: [], isProgress: false });
    const [selectedAccountType, setSelectedAccountType] = useState("");
    const [selectedAccountTypeScheme, setSelectedAccountTypeScheme] = useState("");

    // Payment method states (like Receipt.tsx)
    const [paymentMethodState, setPaymentMethodState] = useState<DropState>({ dataList: [], isProgress: true });
    const [cashLedgerState, setCashLedgerState] = useState<DropState>({ dataList: [], isProgress: false });
    const [bankLedgerState, setBankLedgerState] = useState<DropState>({ dataList: [], isProgress: false });
    const [discountCalcTypeState, setDiscountCalcTypeState] = useState<DropState>({ dataList: [], isProgress: false });

    // Confirmation modal state
    const [showConfirm, setShowConfirm] = useState(false);

    /* ── Load dropdown data ── */
    useEffect(() => {
        Fn_FillListData(dispatch, setAccountTypeState, "dataList", `${API_WEB_URLS.MASTER}/0/token/accountType/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setPaymentMethodState, "dataList", `${API_WEB_URLS.MASTER}/0/token/PaymentMethodMaster/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setDiscountCalcTypeState, "dataList", `${API_WEB_URLS.MASTER}/0/token/CalculationType/Id/0`).catch(console.error);
    }, [dispatch]);

    /* ── Fetch Ledger based on Payment Mode ── */
    useEffect(() => {
        if (formValues.F_PaymentMethodMaster === "1") {
            // Cash - fetch cash ledger from group 16
            setCashLedgerState({ dataList: [], isProgress: true });
            Fn_FillListData(
                dispatch,
                setCashLedgerState,
                "dataList",
                `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/tbl.F_LedgerGroupMaster/16`
            ).catch(console.error);
        } else if (formValues.F_PaymentMethodMaster === "2" || formValues.F_PaymentMethodMaster === "5") {
            // Cheque or Online - fetch bank ledger from group 12
            setBankLedgerState({ dataList: [], isProgress: true });
            Fn_FillListData(
                dispatch,
                setBankLedgerState,
                "dataList",
                `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/tbl.F_LedgerGroupMaster/12`
            ).catch(console.error);
        }
    }, [dispatch, formValues.F_PaymentMethodMaster]);

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

    /* ── Computed: Final Amount Payable (using useMemo for real-time calculation) ── */
    const calculatedFinalAmount = useMemo(() => {
        const remainingInterest = Number(formValues.RemainingInterest) || 0;
        const discount = Number(formValues.DiscountOnInterest) || 0;
        const remainingPrincipal = Number(formValues.RemainingPrincipal) || 0;
        const penalty = Number(formValues.Penalty) || 0;
        
        const interestAfterDiscount = Math.max(remainingInterest - discount, 0);
        const finalAmount = remainingPrincipal + interestAfterDiscount + penalty;
        
        return finalAmount.toFixed(2);
    }, [formValues.RemainingInterest, formValues.DiscountOnInterest, formValues.RemainingPrincipal, formValues.Penalty]);

    /* ── Computed: Interest after Discount ── */
    const interestAfterDiscount = useMemo(() => {
        const remainingInterest = Number(formValues.RemainingInterest) || 0;
        const discount = Number(formValues.DiscountOnInterest) || 0;
        return Math.max(remainingInterest - discount, 0).toFixed(2);
    }, [formValues.RemainingInterest, formValues.DiscountOnInterest]);

    /* ── Handle field change ── */
    const handleFieldChange = (field: string, value: any) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
    };

    /* ── Handle account search ── */
    const handleAccountSearch = () => {
        setAccountSearchModal(true);
    };

    /* ── Get payment mode name ── */
    const getPaymentModeName = (modeId: string): string => {
        const method = paymentMethodState.dataList.find((m: any) => String(m.Id) === modeId);
        return method?.Name || "";
    };

    /* ── Handle select account ── */
    const handleSelectAccount = async (account: any) => {
        // Set F_MemberAccountMaster (account Id) for API submission
        const memberAccountId = account.Id || account.MemberAccountId;
        
        // Format dates
        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return "";
            try {
                return new Date(dateStr).toISOString().split('T')[0];
            } catch {
                return "";
            }
        };

        // Get scheme name from selected scheme dropdown
        const schemeName = selectedAccountTypeScheme 
            ? accountTypeSchemeState.dataList.find((s: any) => String(s.Id) === selectedAccountTypeScheme)?.Name || account.SchemeName || ""
            : account.SchemeName || "";

        // Calculate maturity date from last EMI in EMIScheduleJson
        let formattedMaturityDate = "";
        if (account.EMIScheduleJson) {
            try {
                const emiSchedule = typeof account.EMIScheduleJson === 'string' 
                    ? JSON.parse(account.EMIScheduleJson) 
                    : account.EMIScheduleJson;
                if (Array.isArray(emiSchedule) && emiSchedule.length > 0) {
                    const lastEMI = emiSchedule[emiSchedule.length - 1];
                    formattedMaturityDate = formatDate(lastEMI.DueDate);
                }
            } catch (error) {
                console.error("Error parsing EMIScheduleJson:", error);
            }
        }
        if (!formattedMaturityDate) {
            formattedMaturityDate = formatDate(account.EndDate || account.MaturityDate);
        }

        // Calculate Remaining Principal and Remaining Interest from API data
        const disbursedAmount = Number(account.DisbursedAmount) || 0;
        const receivedAmount = Number(account.ReceivedAmount) || 0;
        const totalInterest = Number(account.TotalInterest) || 0;
        const interestReceived = Number(account.InterestReceived) || 0;
        const penaltyReceived = Number(account.PenaltyReceived) || 0;
        
        const remainingPrincipal = disbursedAmount - receivedAmount;
        const remainingInterest = totalInterest - interestReceived;

        // Update form values with account data
        const updatedValues: FormValues = {
            ...formValues,
            F_MemberAccountMaster: String(memberAccountId || ""),
            AccountNo: account.AccountNo || "",
            MemberName: account.CustomerName || account.MemberName || account.Name || "",
            MemberId: account.F_Member || account.MemberId || account.Id || "",
            ContactNo: account.CustomerMobile || account.ContactNo || account.Mobile || "",
            Address: account.CustomerAddress || account.Address || "",
            FatherName: account.FatherName || "",
            MembershipDate: formatDate(account.MembershipDate || account.CreatedDate),
            DateOfBirth: formatDate(account.DateOfBirth || account.DOB),
            SchemeName: schemeName,
            OpeningDate: formatDate(account.RepaymentStartDate || account.OpeningDate),
            InterestRate: account.InterestRate || account.ROI || "",
            MaturityDate: formattedMaturityDate,
            TotalAmount: account.LoanAmount || account.TotalAmount || "",
            MonthlyAmount: account.EMIAmount || account.MonthlyAmount || "",
            
            // Financial data from API
            DisbursedAmount: String(disbursedAmount),
            ReceivedAmount: String(receivedAmount),
            TotalInterest: String(totalInterest),
            InterestReceived: String(interestReceived),
            PenaltyReceived: String(penaltyReceived),
            
            // Calculated fields
            RemainingPrincipal: remainingPrincipal.toFixed(2),
            RemainingInterest: remainingInterest.toFixed(2),
            
            // Reset discount fields
            F_DiscountCalculationType: "",
            DiscountOnInterest: "0",
            
            // Final Amount (will be recalculated in useEffect)
            FinalAmountPayable: (remainingPrincipal + remainingInterest).toFixed(2),
        };

        // Fetch Last Installment data
        if (memberAccountId) {
            try {
                const lastInstallmentUrl = `${API_WEB_URLS.BASE}Masters/0/token/LastInstallment/Id/${memberAccountId}`;
                const lastInstallmentResponse = await API_HELPER.apiGET(lastInstallmentUrl);
                const lastInstallmentData = lastInstallmentResponse?.data?.dataList?.[0];
                
                if (lastInstallmentData) {
                    updatedValues.InstallmentNo = String(lastInstallmentData.InstallmentNo || lastInstallmentData.NextInstallmentNo || "");
                    updatedValues.LastDueDate = formatDate(lastInstallmentData.DueDate || lastInstallmentData.NextDueDate);
                    updatedValues.DaysOverdue = String(lastInstallmentData.DaysOverdue || lastInstallmentData.OverdueDays || "0");
                    updatedValues.Penalty = String(lastInstallmentData.Penalty || lastInstallmentData.PenaltyAmount || "0");
                    updatedValues.EMIAmount = String(lastInstallmentData.EMIAmount || "0");
                    updatedValues.PrincipalAmount = String(lastInstallmentData.PrincipalAmount || lastInstallmentData.Principal || "0");
                    updatedValues.InterestAmount = String(lastInstallmentData.InterestAmount || lastInstallmentData.Interest || "0");
                    updatedValues.OutstandingAmount = String(lastInstallmentData.OutstandingAmount || lastInstallmentData.Outstanding || lastInstallmentData.RemainingAmount || "0");
                }
            } catch (error) {
                console.error("Failed to fetch last installment data:", error);
            }
        }

        setFormValues(updatedValues);
        setAccountSearchModal(false);
        setSearchText("");
        setSelectedAccountType("");
        setSelectedAccountTypeScheme("");
    };

    /* ── Handle form submit - show confirmation ── */
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formValues.F_MemberAccountMaster) {
            toast.error("Please select an account");
            return;
        }
        if (!formValues.ClosureDate) {
            toast.error("Please select a closure date");
            return;
        }
        if (!formValues.F_PaymentMethodMaster) {
            toast.error("Please select a payment mode");
            return;
        }
        
        // Validate payment mode specific fields
        const modeName = getPaymentModeName(formValues.F_PaymentMethodMaster);
        if (formValues.F_PaymentMethodMaster === "2" || modeName.toLowerCase().includes("cheque")) {
            if (!formValues.ChequeNo) {
                toast.error("Please enter Cheque No");
                return;
            }
            if (!formValues.ChequeDate) {
                toast.error("Please enter Cheque Date");
                return;
            }
            if (!formValues.F_ReceiptLedger) {
                toast.error("Please select Bank");
                return;
            }
        }
        if (formValues.F_PaymentMethodMaster === "5" || modeName.toLowerCase().includes("online") || modeName.toLowerCase().includes("neft") || modeName.toLowerCase().includes("rtgs")) {
            if (!formValues.UTRNo) {
                toast.error("Please enter UTR No");
                return;
            }
            if (!formValues.TransactionDate) {
                toast.error("Please enter Transaction Date");
                return;
            }
            if (!formValues.F_ReceiptLedger) {
                toast.error("Please select Bank");
                return;
            }
        }
        
        setShowConfirm(true);
    };

    /* ── Handle Foreclosure ── */
    const handleForeclosure = async () => {
        setIsSubmitting(true);
        try {
            const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
            const userId = authUser?.uid ?? authUser?.Id ?? "0";
            const userToken = authUser?.Token ?? authUser?.token ?? "token";
            
            const apiUrl = `${API_WEB_URLS.BASE}LoanForeclosure/${userId}/${userToken}`;
            
            const formData = new FormData();
            formData.append("F_MemberAccountMaster", formValues.F_MemberAccountMaster);
            formData.append("ClosureDate", formValues.ClosureDate);
            formData.append("RemainingPrincipal", formValues.RemainingPrincipal);
            formData.append("RemainingInterest", formValues.RemainingInterest);
            formData.append("F_DiscountCalculationType", formValues.F_DiscountCalculationType || "0");
            formData.append("DiscountOnInterest", formValues.DiscountOnInterest || "0");
            formData.append("FinalAmountPayable", calculatedFinalAmount);
            formData.append("Penalty", formValues.Penalty || "0");
            formData.append("PaymentMode", formValues.F_PaymentMethodMaster);
            formData.append("Remarks", formValues.Remarks || "");
            formData.append("F_BranchOffice", localStorage.getItem("F_BranchOffice") || "0");
            formData.append("F_PaymentMethodMaster", formValues.F_PaymentMethodMaster);

            // Payment mode specific fields
            const modeName = getPaymentModeName(formValues.F_PaymentMethodMaster);
            if (formValues.F_PaymentMethodMaster === "1") {
                // Cash - get cash ledger ID
                const cashLedger = cashLedgerState.dataList[0];
                const cashLedgerId = cashLedger?.ID || cashLedger?.Id || "";
                formData.append("F_ReceiptLedger", String(cashLedgerId));
            } else if (formValues.F_PaymentMethodMaster === "2" || modeName.toLowerCase().includes("cheque")) {
                // Cheque
                formData.append("F_ReceiptLedger", formValues.F_ReceiptLedger);
                const selectedBank = bankLedgerState.dataList.find((b: any) => String(b.ID || b.Id) === formValues.F_ReceiptLedger);
                formData.append("BankName", selectedBank?.Name || formValues.BankName || "");
                formData.append("ChequeNo", formValues.ChequeNo || "");
                formData.append("ChequeDate", formValues.ChequeDate || "");
            } else if (formValues.F_PaymentMethodMaster === "5" || modeName.toLowerCase().includes("online") || modeName.toLowerCase().includes("neft") || modeName.toLowerCase().includes("rtgs")) {
                // Online
                formData.append("F_ReceiptLedger", formValues.F_ReceiptLedger);
                const selectedBank = bankLedgerState.dataList.find((b: any) => String(b.ID || b.Id) === formValues.F_ReceiptLedger);
                formData.append("BankName", selectedBank?.Name || "");
                formData.append("UTRNo", formValues.UTRNo || "");
                formData.append("TransactionDate", formValues.TransactionDate || "");
            } else {
                formData.append("F_ReceiptLedger", "0");
            }
            
            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (response.ok && data) {
                toast.success("Loan foreclosed successfully!");
                setShowConfirm(false);
                // Reset form
                setFormValues(initialValues);
            } else {
                toast.error(data?.message || "Failed to foreclose loan");
            }
        } catch (error) {
            console.error("Foreclosure failed:", error);
            toast.error("Error foreclosing loan. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── Filter accounts for modal ── */
    const displayAccounts = useMemo(() => {
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
            <Breadcrumbs mainTitle="Loan Foreclosure" parent="Customer & Loan" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Card>
                            <CardHeaderCommon title="Loan Foreclosure Form" tagClass="card-title mb-0" />
                            <CardBody>
                                <form onSubmit={handleFormSubmit}>
                                    {/* Account Selection */}
                                    <Row className="mb-3">
                                        <Col md="6">
                                            <FormGroup>
                                                <Label><strong>Account No</strong> <span className="text-danger">*</span></Label>
                                                <div className="input-group">
                                                    <Input
                                                        type="text"
                                                        innerRef={accountNoRef}
                                                        value={formValues.AccountNo}
                                                        onChange={(e) => handleFieldChange("AccountNo", e.target.value)}
                                                        placeholder="Search and select account"
                                                        readOnly
                                                    />
                                                    <Btn color="primary" onClick={handleAccountSearch}>
                                                        <i className="fa fa-search" />
                                                    </Btn>
                                                </div>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {/* Member Information */}
                                    {formValues.F_MemberAccountMaster && (
                                        <>
                                            <Card className="mb-3">
                                                <CardBody>
                                                    <h6 className="mb-3 text-primary">
                                                        <i className="fa fa-user me-2" />
                                                        Member Information
                                                    </h6>
                                                    <Row>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Member Name</Label>
                                                                <Input type="text" value={formValues.MemberName} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Father Name</Label>
                                                                <Input type="text" value={formValues.FatherName} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Contact No</Label>
                                                                <Input type="text" value={formValues.ContactNo} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Date of Birth</Label>
                                                                <Input type="date" value={formValues.DateOfBirth} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Membership Date</Label>
                                                                <Input type="date" value={formValues.MembershipDate} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Address</Label>
                                                                <Input type="text" value={formValues.Address} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </CardBody>
                                            </Card>

                                            {/* Account Information */}
                                            <Card className="mb-3">
                                                <CardBody>
                                                    <h6 className="mb-3 text-primary">
                                                        <i className="fa fa-file-text me-2" />
                                                        Account Information
                                                    </h6>
                                                    <Row>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Scheme Name</Label>
                                                                <Input type="text" value={formValues.SchemeName} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Opening Date</Label>
                                                                <Input type="date" value={formValues.OpeningDate} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Maturity Date</Label>
                                                                <Input type="date" value={formValues.MaturityDate} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Loan Amount</Label>
                                                                <Input type="text" value={formValues.TotalAmount} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>EMI Amount</Label>
                                                                <Input type="text" value={formValues.MonthlyAmount} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Interest Rate (%)</Label>
                                                                <Input type="text" value={formValues.InterestRate} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </CardBody>
                                            </Card>

                                            {/* Outstanding Information */}
                                            <Card className="mb-3">
                                                <CardBody>
                                                    <h6 className="mb-3 text-primary">
                                                        <i className="fa fa-money me-2" />
                                                        Outstanding Information
                                                    </h6>
                                                    <Row>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label>Installment No</Label>
                                                                <Input type="text" value={formValues.InstallmentNo} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label>Last Due Date</Label>
                                                                <Input type="date" value={formValues.LastDueDate} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label>Days Overdue</Label>
                                                                <Input type="text" value={formValues.DaysOverdue} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label>Penalty</Label>
                                                                <Input type="text" value={formValues.Penalty} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </CardBody>
                                            </Card>

                                            {/* Financial Information */}
                                            <Card className="mb-3">
                                                <CardBody>
                                                    <h6 className="mb-3 text-primary">
                                                        <i className="fa fa-calculator me-2" />
                                                        Financial Information
                                                    </h6>
                                                    <Row>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label>Disbursed Amount</Label>
                                                                <Input type="text" value={`₹ ${Number(formValues.DisbursedAmount || 0).toLocaleString('en-IN')}`} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label>Principal Received</Label>
                                                                <Input type="text" value={`₹ ${Number(formValues.ReceivedAmount || 0).toLocaleString('en-IN')}`} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label>Total Interest</Label>
                                                                <Input type="text" value={`₹ ${Number(formValues.TotalInterest || 0).toLocaleString('en-IN')}`} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label>Interest Received</Label>
                                                                <Input type="text" value={`₹ ${Number(formValues.InterestReceived || 0).toLocaleString('en-IN')}`} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row className="mt-3">
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label className="text-danger"><strong>Remaining Principal</strong></Label>
                                                                <Input 
                                                                    type="text" 
                                                                    value={`₹ ${Number(formValues.RemainingPrincipal || 0).toLocaleString('en-IN')}`} 
                                                                    readOnly 
                                                                    className="fw-bold text-danger"
                                                                />
                                                                <small className="text-muted">Disbursed - Received</small>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label className="text-warning"><strong>Remaining Interest</strong></Label>
                                                                <Input 
                                                                    type="text" 
                                                                    value={`₹ ${Number(formValues.RemainingInterest || 0).toLocaleString('en-IN')}`} 
                                                                    readOnly 
                                                                    className="fw-bold text-warning"
                                                                />
                                                                <small className="text-muted">Total Interest - Interest Received</small>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label>Penalty Received</Label>
                                                                <Input type="text" value={`₹ ${Number(formValues.PenaltyReceived || 0).toLocaleString('en-IN')}`} readOnly />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </CardBody>
                                            </Card>

                                            {/* Discount & Final Calculation */}
                                            <Card className="mb-3">
                                                <CardBody>
                                                    <h6 className="mb-3 text-primary">
                                                        <i className="fa fa-percent me-2" />
                                                        Discount & Final Calculation
                                                    </h6>
                                                    <Row>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label>Discount Calculation Type</Label>
                                                                <Input
                                                                    type="select"
                                                                    value={formValues.F_DiscountCalculationType}
                                                                    onChange={(e) => handleFieldChange("F_DiscountCalculationType", e.target.value)}
                                                                >
                                                                    <option value="">-- Select --</option>
                                                                    {discountCalcTypeState.dataList.map((type: any) => (
                                                                        <option key={type.Id || type.ID} value={type.Id || type.ID}>{type.Name}</option>
                                                                    ))}
                                                                </Input>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label>Discount on Interest</Label>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={formValues.DiscountOnInterest}
                                                                    onChange={(e) => handleFieldChange("DiscountOnInterest", e.target.value)}
                                                                    placeholder="Enter discount"
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label className="text-info"><strong>Interest after Discount</strong></Label>
                                                                <Input 
                                                                    type="text" 
                                                                    value={`₹ ${Number(interestAfterDiscount).toLocaleString('en-IN')}`} 
                                                                    readOnly 
                                                                    className="fw-bold text-info"
                                                                />
                                                                <small className="text-muted">Remaining Interest - Discount</small>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Label className="text-success"><strong>Total Amount Pending</strong></Label>
                                                                <Input 
                                                                    type="text" 
                                                                    value={`₹ ${Number(calculatedFinalAmount).toLocaleString('en-IN')}`} 
                                                                    readOnly 
                                                                    className="fw-bold text-success bg-light"
                                                                    style={{ fontSize: '1.1rem' }}
                                                                />
                                                                <small className="text-muted">Principal + Interest after Discount + Penalty</small>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </CardBody>
                                            </Card>

                                            {/* Payment Mode (like Receipt.tsx) */}
                                            <Card className="mb-3">
                                                <CardBody>
                                                    <h6 className="mb-3 text-primary">
                                                        <i className="fa fa-credit-card me-2" />
                                                        Payment Details
                                                    </h6>
                                                    <Row>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label><strong>Payment Mode</strong> <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    value={formValues.F_PaymentMethodMaster}
                                                                    onChange={(e) => {
                                                                        handleFieldChange("F_PaymentMethodMaster", e.target.value);
                                                                        handleFieldChange("F_ReceiptLedger", "");
                                                                        handleFieldChange("ChequeNo", "");
                                                                        handleFieldChange("ChequeDate", "");
                                                                        handleFieldChange("BankName", "");
                                                                        handleFieldChange("UTRNo", "");
                                                                        handleFieldChange("TransactionDate", "");
                                                                    }}
                                                                >
                                                                    <option value="">Select Payment Mode</option>
                                                                    {paymentMethodState.dataList.map((method: any) => (
                                                                        <option key={method.Id} value={method.Id}>{method.Name}</option>
                                                                    ))}
                                                                </Input>
                                                            </FormGroup>
                                                        </Col>

                                                        {/* Cheque Fields */}
                                                        {(formValues.F_PaymentMethodMaster === "2" || getPaymentModeName(formValues.F_PaymentMethodMaster).toLowerCase().includes("cheque")) && (
                                                            <>
                                                                <Col md="4">
                                                                    <FormGroup>
                                                                        <Label><strong>Bank</strong> <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            type="select"
                                                                            value={formValues.F_ReceiptLedger}
                                                                            onChange={(e) => handleFieldChange("F_ReceiptLedger", e.target.value)}
                                                                        >
                                                                            <option value="">Select Bank</option>
                                                                            {bankLedgerState.dataList.map((bank: any) => (
                                                                                <option key={bank.ID || bank.Id} value={bank.ID || bank.Id}>{bank.Name}</option>
                                                                            ))}
                                                                        </Input>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="4">
                                                                    <FormGroup>
                                                                        <Label><strong>Cheque No</strong> <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            type="text"
                                                                            value={formValues.ChequeNo}
                                                                            onChange={(e) => handleFieldChange("ChequeNo", e.target.value)}
                                                                            placeholder="Enter Cheque No"
                                                                        />
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="4">
                                                                    <FormGroup>
                                                                        <Label><strong>Cheque Date</strong> <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={formValues.ChequeDate}
                                                                            onChange={(e) => handleFieldChange("ChequeDate", e.target.value)}
                                                                        />
                                                                    </FormGroup>
                                                                </Col>
                                                            </>
                                                        )}

                                                        {/* Online Transfer Fields */}
                                                        {(formValues.F_PaymentMethodMaster === "5" || 
                                                          getPaymentModeName(formValues.F_PaymentMethodMaster).toLowerCase().includes("online") ||
                                                          getPaymentModeName(formValues.F_PaymentMethodMaster).toLowerCase().includes("neft") ||
                                                          getPaymentModeName(formValues.F_PaymentMethodMaster).toLowerCase().includes("rtgs")) && (
                                                            <>
                                                                <Col md="4">
                                                                    <FormGroup>
                                                                        <Label><strong>Bank</strong> <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            type="select"
                                                                            value={formValues.F_ReceiptLedger}
                                                                            onChange={(e) => handleFieldChange("F_ReceiptLedger", e.target.value)}
                                                                        >
                                                                            <option value="">Select Bank</option>
                                                                            {bankLedgerState.dataList.map((bank: any) => (
                                                                                <option key={bank.ID || bank.Id} value={bank.ID || bank.Id}>{bank.Name}</option>
                                                                            ))}
                                                                        </Input>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="4">
                                                                    <FormGroup>
                                                                        <Label><strong>UTR No</strong> <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            type="text"
                                                                            value={formValues.UTRNo}
                                                                            onChange={(e) => handleFieldChange("UTRNo", e.target.value)}
                                                                            placeholder="Enter UTR No"
                                                                        />
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md="4">
                                                                    <FormGroup>
                                                                        <Label><strong>Transaction Date</strong> <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={formValues.TransactionDate}
                                                                            onChange={(e) => handleFieldChange("TransactionDate", e.target.value)}
                                                                        />
                                                                    </FormGroup>
                                                                </Col>
                                                            </>
                                                        )}
                                                    </Row>
                                                </CardBody>
                                            </Card>

                                            {/* Foreclosure Details */}
                                            <Card className="mb-3">
                                                <CardBody>
                                                    <h6 className="mb-3 text-primary">
                                                        <i className="fa fa-file-text-o me-2" />
                                                        Foreclosure Details
                                                    </h6>
                                                    <Row>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label><strong>Closure Date</strong> <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="date"
                                                                    value={formValues.ClosureDate}
                                                                    onChange={(e) => handleFieldChange("ClosureDate", e.target.value)}
                                                                    required
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="8">
                                                            <FormGroup>
                                                                <Label>Remarks</Label>
                                                                <Input
                                                                    type="textarea"
                                                                    rows={2}
                                                                    value={formValues.Remarks}
                                                                    onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                                                                    placeholder="Enter remarks for foreclosure..."
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </CardBody>
                                            </Card>

                                            {/* Action Buttons */}
                                            <div className="text-end">
                                                <Btn color="secondary" className="me-2" onClick={() => setFormValues(initialValues)}>
                                                    <i className="fa fa-times me-1" /> Clear
                                                </Btn>
                                                <Btn color="primary" type="submit" disabled={isSubmitting}>
                                                    <i className="fa fa-check me-1" /> Submit Foreclosure
                                                </Btn>
                                            </div>
                                        </>
                                    )}
                                </form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* ─── Account Search Modal ─── */}
            <Modal isOpen={accountSearchModal} toggle={() => setAccountSearchModal(false)} size="lg">
                <ModalHeader toggle={() => setAccountSearchModal(false)}>Search Account</ModalHeader>
                <ModalBody>
                    <Row className="mb-3">
                        <Col md="4">
                            <FormGroup>
                                <Label>Account Type</Label>
                                <Input
                                    type="select"
                                    value={selectedAccountType}
                                    onChange={(e) => setSelectedAccountType(e.target.value)}
                                >
                                    <option value="">Select Account Type</option>
                                    {accountTypeState.dataList.map((type: any) => (
                                        <option key={type.Id} value={type.Id}>{type.Name}</option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <Label>Account Type Scheme</Label>
                                <Input
                                    type="select"
                                    value={selectedAccountTypeScheme}
                                    onChange={(e) => setSelectedAccountTypeScheme(e.target.value)}
                                    disabled={!selectedAccountType || accountTypeSchemeState.isProgress}
                                >
                                    <option value="">Select Scheme</option>
                                    {accountTypeSchemeState.dataList.map((scheme: any) => (
                                        <option key={scheme.Id} value={scheme.Id}>{scheme.Name}</option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
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
                            <thead className="table-light">
                                <tr>
                                    <th>Account No</th>
                                    <th>Member Name</th>
                                    <th>Loan Amount</th>
                                    <th>Scheme</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center">
                                            {selectedAccountTypeScheme ? "No accounts found" : "Please select Account Type and Scheme"}
                                        </td>
                                    </tr>
                                ) : (
                                    displayAccounts.map((acc: any) => (
                                        <tr key={acc.Id}>
                                            <td>{acc.AccountNo}</td>
                                            <td>{acc.MemberName || acc.Name}</td>
                                            <td>₹ {Number(acc.LoanAmount || 0).toLocaleString('en-IN')}</td>
                                            <td>{acc.SchemeName}</td>
                                            <td>
                                                <Btn 
                                                    color="primary" 
                                                    size="sm"
                                                    onClick={() => handleSelectAccount(acc)}
                                                >
                                                    <i className="fa fa-check me-1" /> Select
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

            {/* ─── Confirmation Modal ─── */}
            <Modal isOpen={showConfirm} toggle={() => setShowConfirm(false)} centered size="lg">
                <ModalHeader toggle={() => setShowConfirm(false)}>
                    <i className="fa fa-exclamation-triangle text-warning me-2" />
                    Confirm Foreclosure
                </ModalHeader>
                <ModalBody>
                    <div className="text-center">
                        <i className="fa fa-exclamation-circle text-warning" style={{ fontSize: '3rem' }} />
                        <h5 className="mt-3">Are you sure you want to foreclose this loan?</h5>
                        <div className="text-start mt-3 p-3 bg-light rounded">
                            <Row>
                                <Col md="6">
                                    <p className="mb-2"><strong>Account No:</strong> {formValues.AccountNo}</p>
                                    <p className="mb-2"><strong>Member Name:</strong> {formValues.MemberName}</p>
                                    <p className="mb-2"><strong>Remaining Principal:</strong> ₹{Number(formValues.RemainingPrincipal || 0).toLocaleString('en-IN')}</p>
                                    <p className="mb-2"><strong>Remaining Interest:</strong> ₹{Number(formValues.RemainingInterest || 0).toLocaleString('en-IN')}</p>
                                </Col>
                                <Col md="6">
                                    <p className="mb-2"><strong>Discount:</strong> ₹{Number(formValues.DiscountOnInterest || 0).toLocaleString('en-IN')}</p>
                                    <p className="mb-2"><strong>Interest after Discount:</strong> ₹{Number(interestAfterDiscount).toLocaleString('en-IN')}</p>
                                    <p className="mb-2"><strong>Penalty:</strong> ₹{Number(formValues.Penalty || 0).toLocaleString('en-IN')}</p>
                                    <p className="mb-2"><strong>Closure Date:</strong> {formValues.ClosureDate}</p>
                                    <p className="mb-0 text-success fw-bold" style={{ fontSize: '1.1rem' }}>
                                        <strong>Final Amount:</strong> ₹{Number(calculatedFinalAmount).toLocaleString('en-IN')}
                                    </p>
                                </Col>
                            </Row>
                        </div>
                        <p className="text-danger mt-3">
                            <small>This action cannot be undone.</small>
                        </p>
                    </div>
                </ModalBody>
                <ModalFooter className="justify-content-center">
                    <Btn color="secondary" onClick={() => setShowConfirm(false)}>
                        <i className="fa fa-arrow-left me-1" /> Go Back
                    </Btn>
                    <Btn color="danger" onClick={handleForeclosure} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner size="sm" className="me-1" /> Processing...
                            </>
                        ) : (
                            <>
                                <i className="fa fa-check me-1" /> Confirm Foreclosure
                            </>
                        )}
                    </Btn>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ForCloser;
