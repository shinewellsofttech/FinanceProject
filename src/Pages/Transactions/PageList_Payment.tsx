import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, Input, Label, Row, Table } from "reactstrap";
import { Btn } from "../../AbstractElements";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { API_HELPER } from "../../helpers/ApiHelper";
import { formatDateDisplay } from "../../helpers/dateUtils";

interface DropdownOption {
    Id?: number;
    ID?: number;
    Name?: string;
}

interface DropState {
    dataList: DropdownOption[];
    isProgress: boolean;
}

interface ListState {
    dataList: any[];
    isProgress: boolean;
    filterText: string;
}

const PageList_Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // State for list data
    const [state, setState] = useState<ListState>({
        dataList: [],
        isProgress: true,
        filterText: "",
    });

    // State for dropdown filters
    const [accountTypeSchemeState, setAccountTypeSchemeState] = useState<DropState>({ dataList: [], isProgress: true });
    const [loanTypeState, setLoanTypeState] = useState<DropState>({ dataList: [], isProgress: true });

    // Filter values - start with 0 (All)
    const [selectedAccountTypeScheme, setSelectedAccountTypeScheme] = useState<string>("0");
    const [selectedLoanType, setSelectedLoanType] = useState<string>("0");

    // Helper to get Id handling both cases
    const getOptionId = (opt: DropdownOption): string => String(opt.Id ?? opt.ID ?? "");

    // Get logged user info
    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const loggedUserId = String(currentUser?.uid ?? currentUser?.id ?? "0");
    const branchId = localStorage.getItem("F_BranchOffice") || "0";

    // Load dropdown data on mount
    useEffect(() => {
        Fn_FillListData(dispatch, setAccountTypeSchemeState, "dataList", `${API_WEB_URLS.MASTER}/0/token/AccountTypeSchemeData/Id/0`).catch(console.error);
        Fn_FillListData(dispatch, setLoanTypeState, "dataList", `${API_WEB_URLS.MASTER}/0/token/LoanType/Id/0`).catch(console.error);
    }, [dispatch]);

    // Load payment data using POST API
    const loadData = useCallback(async () => {
        setState((prev) => ({ ...prev, isProgress: true }));

        try {
            const formData = new FormData();
            formData.append("Id", "0");
            formData.append("F_BranchOffice", branchId);
            formData.append("F_AccountTypeScheme", selectedAccountTypeScheme);
            formData.append("F_LoanType", selectedLoanType);

            const apiUrl = `${API_WEB_URLS.BASE}GetPaymentData/${loggedUserId}/token`;
            const response = await API_HELPER.apiPOST_Multipart(apiUrl, formData);

            if (response && response.data && response.data.response) {
                const list = Array.isArray(response.data.response) ? response.data.response : [];
                setState((prev) => ({ ...prev, dataList: list, isProgress: false }));
            } else {
                setState((prev) => ({ ...prev, dataList: [], isProgress: false }));
            }
        } catch (error) {
            console.error("Failed to load payment list:", error);
            setState((prev) => ({ ...prev, dataList: [], isProgress: false }));
        }
    }, [branchId, selectedAccountTypeScheme, selectedLoanType, loggedUserId]);

    // Load data when filters change
    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAdd = () => {
        navigate("/payment", { state: { Id: 0 } });
    };

    const handleEdit = (id: number | string) => {
        if (!id) return;
        navigate("/payment", { state: { Id: id } });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState((prev) => ({ ...prev, filterText: e.target.value }));
    };

    const handleSchemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAccountTypeScheme(e.target.value);
    };

    const handleLoanTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedLoanType(e.target.value);
    };

    const filteredList = useMemo(() => {
        const list = Array.isArray(state.dataList) ? state.dataList : [];
        const search = state.filterText.trim().toLowerCase();
        if (!search) return list;
        return list.filter(
            (item: any) =>
                String(item?.VoucherNo ?? "").toLowerCase().includes(search) ||
                String(item?.AccountNo ?? "").toLowerCase().includes(search) ||
                String(item?.BankName ?? "").toLowerCase().includes(search) ||
                String(item?.Remarks ?? "").toLowerCase().includes(search) ||
                String(item?.Amount ?? "").toLowerCase().includes(search)
        );
    }, [state.dataList, state.filterText]);

    const formatDate = formatDateDisplay;

    const formatAmount = (amount: number | null | undefined) => {
        if (amount == null) return "-";
        return `₹ ${Number(amount).toLocaleString("en-IN")}`;
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Payment Vouchers" parent="Transactions" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Card>
                            <CardHeaderCommon title="Payment Voucher List" tagClass="card-title mb-0" />
                            <CardBody>
                                {/* Filter Row */}
                                <Row className="mb-3">
                                    <Col md="3">
                                        <Label className="mb-1">Account Type Scheme</Label>
                                        <Input
                                            type="select"
                                            value={selectedAccountTypeScheme}
                                            onChange={handleSchemeChange}
                                            disabled={accountTypeSchemeState.isProgress}
                                        >
                                            <option value="0">-- All Schemes --</option>
                                            {accountTypeSchemeState.dataList.map((opt, idx) => (
                                                <option key={idx} value={getOptionId(opt)}>
                                                    {opt.Name ?? "-"}
                                                </option>
                                            ))}
                                        </Input>
                                    </Col>
                                    <Col md="3">
                                        <Label className="mb-1">Loan Type</Label>
                                        <Input
                                            type="select"
                                            value={selectedLoanType}
                                            onChange={handleLoanTypeChange}
                                            disabled={loanTypeState.isProgress}
                                        >
                                            <option value="0">-- All Types --</option>
                                            {loanTypeState.dataList.map((opt, idx) => (
                                                <option key={idx} value={getOptionId(opt)}>
                                                    {opt.Name ?? "-"}
                                                </option>
                                            ))}
                                        </Input>
                                    </Col>
                                    <Col md="4" className="d-flex align-items-end">
                                        <div className="w-100">
                                            <Label className="mb-1">Search</Label>
                                            <Input
                                                type="search"
                                                placeholder="Search by voucher no, account, bank..."
                                                value={state.filterText}
                                                onChange={handleSearchChange}
                                            />
                                        </div>
                                    </Col>
                                    <Col md="2" className="d-flex align-items-end justify-content-end">
                                        <Btn color="primary" onClick={handleAdd}>
                                            <i className="fa fa-plus me-2" />
                                            Add Payment
                                        </Btn>
                                    </Col>
                                </Row>

                                {/* Table */}
                                {state.isProgress ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table bordered hover striped>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Voucher No</th>
                                                    <th>Date</th>
                                                    <th>Account No</th>
                                                    <th>Payment Mode</th>
                                                    <th>Bank Name</th>
                                                    <th className="text-end">Amount</th>
                                                    <th>Remarks</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={9} className="text-center py-4">
                                                            No records found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredList.map((item: any, index: number) => (
                                                        <tr key={item?.Id ?? item?.ID ?? index}>
                                                            <td>{index + 1}</td>
                                                            <td>{item?.VoucherNo ?? "-"}</td>
                                                            <td>{formatDate(item?.DisbursementDate)}</td>
                                                            <td>{item?.AccountNo ?? "-"}</td>
                                                            <td>{item?.PaymentMode === 1 ? "Cash" : item?.PaymentMode === 2 ? "Cheque" : item?.PaymentMode === 5 ? "Online" : "-"}</td>
                                                            <td>{item?.BankName ?? "-"}</td>
                                                            <td className="text-end">{formatAmount(item?.Amount)}</td>
                                                            <td>{item?.Remarks ?? "-"}</td>
                                                            <td>
                                                                <Btn 
                                                                    color="primary" 
                                                                    size="sm" 
                                                                    className="me-1" 
                                                                    onClick={() => handleEdit(item?.Id ?? item?.ID)}
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-edit" />
                                                                </Btn>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PageList_Payment;
