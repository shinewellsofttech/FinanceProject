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
import { Fn_AddEditData, Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";

/* ─── Types ─────────────────────────────────────────────── */

type ReceiveMode = "Cash" | "Cheque / RTGS" | "Bank Challan" | "E.F.T" | "Current A/c" | "Saving A/c";

interface FormValues {
    // Voucher Information
    AccountNo: string;
    VoucherDate: string;
    ReceiveMode: ReceiveMode;

    // Cheque / RTGS fields
    ChequeNo: string;
    ChequeAmount: string;
    ChequeDate: string;
    BankCode: string;
    F_Bank: string;

    // Bank Challan / E.F.T fields
    F_MakerBank: string;
    F_MakerBranch: string;
    F_BankAccountNo: string;
    TransId: string;
    TransDate: string;

    // Current A/c / Saving A/c fields
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
    ReceiveMode: "Cash",

    ChequeNo: "",
    ChequeAmount: "",
    ChequeDate: "",
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
    const accountNoRef = useRef<HTMLInputElement | null>(null);

    const [bankState, setBankState] = useState<DropState>({ dataList: [], isProgress: true });
    const [branchState, setBranchState] = useState<DropState>({ dataList: [], isProgress: false });
    const [accountState, setAccountState] = useState<DropState>({ dataList: [], isProgress: false });
    const [memberAccountState, setMemberAccountState] = useState<DropState>({ dataList: [], isProgress: true });
    const [accountSearchModal, setAccountSearchModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [formikSetFieldValue, setFormikSetFieldValue] = useState<((field: string, value: any) => void) | null>(null);

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const loggedUserId = String(currentUser?.uid ?? currentUser?.id ?? "");

    /* ── Load dropdown data ── */
    useEffect(() => {
        Fn_FillListData(dispatch, setBankState, "dataList", `${API_WEB_URLS.MASTER}/0/token/BankMaster/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setMemberAccountState, "dataList", `${API_WEB_URLS.MASTER}/0/token/MemberAccountData/Id/0`).catch(console.error);
    }, [dispatch]);

    useEffect(() => {
        accountNoRef.current?.focus();
    }, []);

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
            formikSetFieldValue("MemberName", account.MemberName || account.Name || "");
            formikSetFieldValue("MemberId", account.MemberId || account.Id || "");
            formikSetFieldValue("MembershipDate", account.MembershipDate || "");
            formikSetFieldValue("FatherName", account.FatherName || "");
            formikSetFieldValue("DateOfBirth", account.DateOfBirth || account.DOB || "");
            formikSetFieldValue("ContactNo", account.ContactNo || account.Mobile || "");
            formikSetFieldValue("Address", account.Address || "");
            formikSetFieldValue("SchemeName", account.SchemeName || "");
            formikSetFieldValue("OpeningDate", account.OpeningDate || "");
            formikSetFieldValue("InterestRate", account.InterestRate || account.ROI || "");
            formikSetFieldValue("MaturityDate", account.MaturityDate || "");
            formikSetFieldValue("TotalAmount", account.TotalAmount || account.LoanAmount || "");
            formikSetFieldValue("MonthlyAmount", account.MonthlyAmount || account.EMIAmount || "");
        }
        setAccountSearchModal(false);
        setSearchText("");
    };

    /* ── Validation schema based on receive mode ── */
    const getValidationSchema = (receiveMode: ReceiveMode) => {
        const baseSchema = {
            AccountNo: Yup.string().required("Account No is required"),
            VoucherDate: Yup.string().required("Voucher Date is required"),
            ReceiveMode: Yup.string().required("Receive Mode is required"),
            ReceiptAmount: Yup.number().typeError("Must be a number").required("Amount is required").min(1, "Amount must be greater than 0"),
        };

        switch (receiveMode) {
            case "Cheque / RTGS":
                return Yup.object({
                    ...baseSchema,
                    ChequeNo: Yup.string().required("Cheque No is required"),
                    ChequeAmount: Yup.number().typeError("Must be a number").required("Amount is required"),
                    ChequeDate: Yup.string().required("Cheque Date is required"),
                    F_Bank: Yup.string().required("Bank is required"),
                });
            case "Bank Challan":
            case "E.F.T":
                return Yup.object({
                    ...baseSchema,
                    F_MakerBank: Yup.string().required("Maker Bank is required"),
                    F_MakerBranch: Yup.string().required("Maker Branch is required"),
                    F_BankAccountNo: Yup.string().required("Account No is required"),
                });
            case "Current A/c":
            case "Saving A/c":
                return Yup.object({
                    ...baseSchema,
                    IBCA_MASA: Yup.string().required(`${receiveMode === "Current A/c" ? "IBCA" : "MASA"} is required`),
                    OTP: Yup.string().required("OTP is required"),
                });
            default:
                return Yup.object(baseSchema);
        }
    };

    /* ── Submit ── */
    const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
        try {
            const fd = new FormData();

            fd.append("AccountNo", values.AccountNo);
            fd.append("VoucherDate", values.VoucherDate);
            fd.append("ReceiveMode", values.ReceiveMode);

            if (values.ReceiveMode === "Cheque / RTGS") {
                fd.append("ChequeNo", values.ChequeNo);
                fd.append("ChequeAmount", values.ChequeAmount);
                fd.append("ChequeDate", values.ChequeDate);
                fd.append("BankCode", values.BankCode);
                fd.append("F_Bank", values.F_Bank);
            } else if (values.ReceiveMode === "Bank Challan" || values.ReceiveMode === "E.F.T") {
                fd.append("F_MakerBank", values.F_MakerBank);
                fd.append("F_MakerBranch", values.F_MakerBranch);
                fd.append("F_BankAccountNo", values.F_BankAccountNo);
                fd.append("TransId", values.TransId);
                fd.append("TransDate", values.TransDate);
            } else if (values.ReceiveMode === "Current A/c" || values.ReceiveMode === "Saving A/c") {
                fd.append("IBCA_MASA", values.IBCA_MASA);
                fd.append("Bal", values.Bal);
                fd.append("OTP", values.OTP);
            }

            fd.append("ReceiptAmount", values.ReceiptAmount);
            fd.append("AmountInWords", values.AmountInWords);
            fd.append("ReceiptNo", values.ReceiptNo);
            fd.append("ReceiptDate", values.ReceiptDate);
            fd.append("Remarks", values.Remarks);
            fd.append("UserId", loggedUserId);
            fd.append("F_BranchOffice", localStorage.getItem("F_BranchOffice") || "");

            await Fn_AddEditData(
                dispatch,
                () => { },
                { arguList: { id: 0, formData: fd } },
                `VoucherReceipt/${loggedUserId}/token`,
                true,
                "receiptid",
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

    /* ── Filter accounts for modal ── */
    const filteredAccounts = memberAccountState.dataList.filter((acc: any) => {
        const search = searchText.toLowerCase();
        return (
            (acc.AccountNo?.toLowerCase().includes(search)) ||
            (acc.MemberName?.toLowerCase().includes(search)) ||
            (acc.Name?.toLowerCase().includes(search))
        );
    });

    /* ─── Render ─────────────────────────────────────────── */
    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Voucher Receipt" parent="Transactions" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<FormValues>
                            initialValues={initialValues}
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
                                                                innerRef={accountNoRef}
                                                                invalid={touched.AccountNo && !!errors.AccountNo}
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
                                                                // Reset mode-specific fields
                                                                setFieldValue("ChequeNo", "");
                                                                setFieldValue("ChequeAmount", "");
                                                                setFieldValue("ChequeDate", "");
                                                                setFieldValue("BankCode", "");
                                                                setFieldValue("F_Bank", "");
                                                                setFieldValue("F_MakerBank", "");
                                                                setFieldValue("F_MakerBranch", "");
                                                                setFieldValue("F_BankAccountNo", "");
                                                                setFieldValue("TransId", "");
                                                                setFieldValue("TransDate", "");
                                                                setFieldValue("IBCA_MASA", "");
                                                                setFieldValue("Bal", "");
                                                                setFieldValue("OTP", "");
                                                            }}
                                                            onBlur={handleBlur}
                                                            style={{ backgroundColor: "#ffe4c4" }}
                                                        >
                                                            <option value="Cash">Cash</option>
                                                            <option value="Cheque / RTGS">Cheque / RTGS</option>
                                                            <option value="Bank Challan">Bank Challan</option>
                                                            <option value="E.F.T">E.F.T</option>
                                                            <option value="Current A/c">Current A/c</option>
                                                            <option value="Saving A/c">Saving A/c</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* ─── Cheque / RTGS Fields ─── */}
                                            {values.ReceiveMode === "Cheque / RTGS" && (
                                                <Row className="gy-3 mt-2">
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
                                                            <Label>Amount <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                name="ChequeAmount"
                                                                value={values.ChequeAmount}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                            />
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
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2">
                                                        <FormGroup className="mb-0">
                                                            <Label>Bank Code</Label>
                                                            <InputGroup>
                                                                <Input
                                                                    type="text"
                                                                    name="BankCode"
                                                                    value={values.BankCode}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                />
                                                                <Btn color="light" type="button">...</Btn>
                                                            </InputGroup>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>Select Bank <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="F_Bank"
                                                                value={values.F_Bank}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.F_Bank && !!errors.F_Bank}
                                                            >
                                                                <option value="">Select Bank ...</option>
                                                                {bankState.dataList.map((bank: any) => (
                                                                    <option key={bank.Id} value={bank.Id}>{bank.Name}</option>
                                                                ))}
                                                            </Input>
                                                            <ErrorMessage name="F_Bank" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}

                                            {/* ─── Bank Challan / E.F.T Fields ─── */}
                                            {(values.ReceiveMode === "Bank Challan" || values.ReceiveMode === "E.F.T") && (
                                                <>
                                                    <Row className="gy-3 mt-2">
                                                        <Col md="3">
                                                            <FormGroup className="mb-0">
                                                                <Label>Maker Bank <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="F_MakerBank"
                                                                    value={values.F_MakerBank}
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        loadBranches(e.target.value);
                                                                        setFieldValue("F_MakerBranch", "");
                                                                        setFieldValue("F_BankAccountNo", "");
                                                                    }}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.F_MakerBank && !!errors.F_MakerBank}
                                                                >
                                                                    <option value="">Select Bank</option>
                                                                    {bankState.dataList.map((bank: any) => (
                                                                        <option key={bank.Id} value={bank.Id}>{bank.Name}</option>
                                                                    ))}
                                                                </Input>
                                                                <ErrorMessage name="F_MakerBank" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup className="mb-0">
                                                                <Label>Maker Branch <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="F_MakerBranch"
                                                                    value={values.F_MakerBranch}
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        loadBankAccounts(e.target.value);
                                                                        setFieldValue("F_BankAccountNo", "");
                                                                    }}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.F_MakerBranch && !!errors.F_MakerBranch}
                                                                >
                                                                    <option value="">Select Branch</option>
                                                                    {branchState.dataList.map((branch: any) => (
                                                                        <option key={branch.Id} value={branch.Id}>{branch.Name}</option>
                                                                    ))}
                                                                </Input>
                                                                <ErrorMessage name="F_MakerBranch" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup className="mb-0">
                                                                <Label>Account No. <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="F_BankAccountNo"
                                                                    value={values.F_BankAccountNo}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.F_BankAccountNo && !!errors.F_BankAccountNo}
                                                                >
                                                                    <option value="">Select Account No</option>
                                                                    {accountState.dataList.map((acc: any) => (
                                                                        <option key={acc.Id} value={acc.Id}>{acc.AccountNo || acc.Name}</option>
                                                                    ))}
                                                                </Input>
                                                                <ErrorMessage name="F_BankAccountNo" component="div" className="text-danger small mt-1" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row className="gy-3 mt-2">
                                                        <Col md="3">
                                                            <FormGroup className="mb-0">
                                                                <Label>Trans. ID</Label>
                                                                <Input
                                                                    type="text"
                                                                    name="TransId"
                                                                    value={values.TransId}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup className="mb-0">
                                                                <Label>Trans. Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    name="TransDate"
                                                                    value={values.TransDate}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </>
                                            )}

                                            {/* ─── Current A/c / Saving A/c Fields ─── */}
                                            {(values.ReceiveMode === "Current A/c" || values.ReceiveMode === "Saving A/c") && (
                                                <Row className="gy-3 mt-2">
                                                    <Col md="3">
                                                        <FormGroup className="mb-0">
                                                            <Label>{values.ReceiveMode === "Current A/c" ? "IBCA" : "MASA"} <span className="text-danger">*</span></Label>
                                                            <InputGroup>
                                                                <Input
                                                                    type="text"
                                                                    name="IBCA_MASA"
                                                                    value={values.IBCA_MASA}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    invalid={touched.IBCA_MASA && !!errors.IBCA_MASA}
                                                                />
                                                                <Btn color="primary" type="button">Search</Btn>
                                                            </InputGroup>
                                                            <ErrorMessage name="IBCA_MASA" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2">
                                                        <FormGroup className="mb-0">
                                                            <Label>Bal</Label>
                                                            <Input
                                                                type="text"
                                                                name="Bal"
                                                                value={values.Bal}
                                                                readOnly
                                                                style={{ backgroundColor: "#f5f5f5" }}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2">
                                                        <FormGroup className="mb-0">
                                                            <Label>OTP <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="text"
                                                                name="OTP"
                                                                value={values.OTP}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.OTP && !!errors.OTP}
                                                            />
                                                            <ErrorMessage name="OTP" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2" className="d-flex align-items-end">
                                                        <Btn color="secondary" type="button">Generate</Btn>
                                                    </Col>
                                                </Row>
                                            )}
                                        </CardBody>
                                    </Card>

                                    {/* ─── Member Information Card ─── */}
                                    <Card className="mb-3">
                                        <CardHeaderCommon title="Member Information" tagClass="card-title mb-0" />
                                        <CardBody>
                                            <Row className="gy-3">
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Member Name</Label>
                                                        <Input type="text" name="MemberName" value={values.MemberName} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Member ID</Label>
                                                        <Input type="text" name="MemberId" value={values.MemberId} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Membership Date</Label>
                                                        <Input type="text" name="MembershipDate" value={values.MembershipDate} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row className="gy-3 mt-2">
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Father Name</Label>
                                                        <Input type="text" name="FatherName" value={values.FatherName} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Date Of Birth</Label>
                                                        <Input type="text" name="DateOfBirth" value={values.DateOfBirth} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3">
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
                                                <Col md="3" className="d-flex align-items-end gap-2">
                                                    <Btn color="light" type="button">More Details ...</Btn>
                                                    <Btn color="light" type="button">Show A/c Form ...</Btn>
                                                </Col>
                                            </Row>
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
                                            <Btn color="light" type="button">
                                                <i className="fa fa-refresh me-1" /> Recent Receipt
                                            </Btn>
                                            <Btn color="primary" type="button">
                                                <i className="fa fa-plus me-1" /> Add
                                            </Btn>
                                            <Btn color="success" type="submit" disabled={isSubmitting} className="text-white">
                                                <i className="fa fa-save me-1" />
                                                {isSubmitting ? "Saving..." : "Save"}
                                            </Btn>
                                            <Btn color="secondary" type="reset">
                                                <i className="fa fa-times me-1" /> Cancel
                                            </Btn>
                                            <Btn color="info" type="button" className="text-white">
                                                <i className="fa fa-eye me-1" /> View Status
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
            </Container>

            {/* ─── Account Search Modal ─── */}
            <Modal isOpen={accountSearchModal} toggle={() => setAccountSearchModal(false)} size="lg">
                <ModalHeader toggle={() => setAccountSearchModal(false)}>Search Account</ModalHeader>
                <ModalBody>
                    <Input
                        type="text"
                        placeholder="Search by Account No or Member Name..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="mb-3"
                    />
                    {memberAccountState.isProgress ? (
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
                                {filteredAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">No accounts found</td>
                                    </tr>
                                ) : (
                                    filteredAccounts.slice(0, 50).map((acc: any) => (
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
