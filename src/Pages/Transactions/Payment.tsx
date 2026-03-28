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

type PaymentMode = "Cash" | "Cheque / E.F." | "Saving A/c";

interface FormValues {
    // Voucher Information
    AccountNo: string;
    VoucherDate: string;
    PaymentMode: PaymentMode;
    Status: string;

    // Cheque / E.F. fields
    ChequeNo: string;
    ChqAmount: string;
    ChqDate: string;
    F_Bank: string;

    // Saving A/c fields
    TransferToSB: boolean;

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
    FatherName: string;
    ContactNo: string;
    Address: string;

    // Payment Information
    Amount: string;
    PaymentNo: string;
    PaymentDate: string;
    AmountInWords: string;
    Narration: string;
}

const initialValues: FormValues = {
    AccountNo: "",
    VoucherDate: new Date().toISOString().split("T")[0],
    PaymentMode: "Cash",
    Status: "",

    ChequeNo: "",
    ChqAmount: "",
    ChqDate: "",
    F_Bank: "",

    TransferToSB: false,

    SchemeName: "",
    OpeningDate: "",
    InterestRate: "",
    MaturityDate: "",
    TotalAmount: "",
    MonthlyAmount: "",

    MemberName: "",
    MemberId: "",
    FatherName: "",
    ContactNo: "",
    Address: "",

    Amount: "",
    PaymentNo: "",
    PaymentDate: new Date().toISOString().split("T")[0],
    AmountInWords: "",
    Narration: "",
};

interface DropState {
    dataList: any[];
    isProgress: boolean;
}

/* ─── Component ─────────────────────────────────────────── */

const Payment = () => {
    const dispatch = useDispatch();
    const accountNoRef = useRef<HTMLInputElement | null>(null);

    const [bankState, setBankState] = useState<DropState>({ dataList: [], isProgress: true });
    const [memberAccountState, setMemberAccountState] = useState<DropState>({ dataList: [], isProgress: true });
    const [accountSearchModal, setAccountSearchModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [formikSetFieldValue, setFormikSetFieldValue] = useState<((field: string, value: any) => void) | null>(null);
    const [memberInfoExpanded, setMemberInfoExpanded] = useState(false);

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
            formikSetFieldValue("FatherName", account.FatherName || "");
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

    /* ── Validation schema based on payment mode ── */
    const getValidationSchema = (paymentMode: PaymentMode) => {
        const baseSchema = {
            AccountNo: Yup.string().required("Account No is required"),
            VoucherDate: Yup.string().required("Voucher Date is required"),
            PaymentMode: Yup.string().required("Payment Mode is required"),
            Amount: Yup.number().typeError("Must be a number").required("Amount is required").min(1, "Amount must be greater than 0"),
        };

        switch (paymentMode) {
            case "Cheque / E.F.":
                return Yup.object({
                    ...baseSchema,
                    ChequeNo: Yup.string().required("Cheque No is required"),
                    ChqAmount: Yup.number().typeError("Must be a number").required("Amount is required"),
                    ChqDate: Yup.string().required("Cheque Date is required"),
                    F_Bank: Yup.string().required("Bank is required"),
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
            fd.append("PaymentMode", values.PaymentMode);
            fd.append("Status", values.Status);

            if (values.PaymentMode === "Cheque / E.F.") {
                fd.append("ChequeNo", values.ChequeNo);
                fd.append("ChqAmount", values.ChqAmount);
                fd.append("ChqDate", values.ChqDate);
                fd.append("F_Bank", values.F_Bank);
            } else if (values.PaymentMode === "Saving A/c") {
                fd.append("TransferToSB", values.TransferToSB ? "true" : "false");
            }

            fd.append("Amount", values.Amount);
            fd.append("PaymentNo", values.PaymentNo);
            fd.append("PaymentDate", values.PaymentDate);
            fd.append("AmountInWords", values.AmountInWords);
            fd.append("Narration", values.Narration);
            fd.append("UserId", loggedUserId);
            fd.append("F_BranchOffice", localStorage.getItem("F_BranchOffice") || "");

            await Fn_AddEditData(
                dispatch,
                () => { },
                { arguList: { id: 0, formData: fd } },
                `VoucherPayment/${loggedUserId}/token`,
                true,
                "paymentid",
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
            <Breadcrumbs mainTitle="Voucher Payment" parent="Transactions" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<FormValues>
                            initialValues={initialValues}
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
                                                                // Reset mode-specific fields
                                                                setFieldValue("ChequeNo", "");
                                                                setFieldValue("ChqAmount", "");
                                                                setFieldValue("ChqDate", "");
                                                                setFieldValue("F_Bank", "");
                                                                setFieldValue("TransferToSB", false);
                                                            }}
                                                            onBlur={handleBlur}
                                                            style={{ backgroundColor: "#ffe4c4" }}
                                                        >
                                                            <option value="Cash">Cash</option>
                                                            <option value="Cheque / E.F.">Cheque / E.F.</option>
                                                            <option value="Saving A/c">Saving A/c</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3">
                                                    <FormGroup className="mb-0">
                                                        <Label>Status</Label>
                                                        <Input
                                                            type="text"
                                                            name="Status"
                                                            value={values.Status}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* ─── Cheque / E.F. Fields ─── */}
                                            {values.PaymentMode === "Cheque / E.F." && (
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
                                                            <Label>Chq Amount <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                name="ChqAmount"
                                                                value={values.ChqAmount}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.ChqAmount && !!errors.ChqAmount}
                                                            />
                                                            <ErrorMessage name="ChqAmount" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2">
                                                        <FormGroup className="mb-0">
                                                            <Label>Chq Date <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="date"
                                                                name="ChqDate"
                                                                value={values.ChqDate}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.ChqDate && !!errors.ChqDate}
                                                            />
                                                            <ErrorMessage name="ChqDate" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="3">
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
                                                                <option value="">Select Head Office ...</option>
                                                                {bankState.dataList.map((bank: any) => (
                                                                    <option key={bank.Id} value={bank.Id}>{bank.Name}</option>
                                                                ))}
                                                            </Input>
                                                            <ErrorMessage name="F_Bank" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}

                                            {/* ─── Saving A/c Fields ─── */}
                                            {values.PaymentMode === "Saving A/c" && (
                                                <Row className="gy-3 mt-2">
                                                    <Col md="3">
                                                        <FormGroup check className="mb-0">
                                                            <Input
                                                                type="checkbox"
                                                                name="TransferToSB"
                                                                id="TransferToSB"
                                                                checked={values.TransferToSB}
                                                                onChange={handleChange}
                                                            />
                                                            <Label check htmlFor="TransferToSB">Transfer To SB</Label>
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
                                                            <Label>Father Name</Label>
                                                            <Input type="text" name="FatherName" value={values.FatherName} readOnly style={{ backgroundColor: "#f5f5f5" }} />
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
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>Payment No <span className="text-danger">*</span></Label>
                                                        <Input
                                                            type="text"
                                                            name="PaymentNo"
                                                            value={values.PaymentNo}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                    <FormGroup className="mb-0">
                                                        <Label>Payment Date</Label>
                                                        <Input
                                                            type="date"
                                                            name="PaymentDate"
                                                            value={values.PaymentDate}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
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
                                            <Btn color="light" type="button">
                                                <i className="fa fa-refresh me-1" /> Recent Payment
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

export default Payment;
