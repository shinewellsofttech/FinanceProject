import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, Input, Label, Row, Table, Modal, ModalHeader, ModalBody, Spinner } from "reactstrap";
import { Btn } from "../../AbstractElements";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Fn_FillListData, Fn_DisplayData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";

const LIST_API_URL = `${API_WEB_URLS.MASTER}/0/token/MemberAccountData/Id/0`;

/* ─── EMI Schedule Interface ─── */
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

interface ListState {
    dataList: any[];
    isProgress: boolean;
    filterText: string;
}

const PageList_MemberAccount = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [state, setState] = useState<ListState>({
        dataList: [],
        isProgress: true,
        filterText: "",
    });

    const [emiModal, setEmiModal] = useState<{ isOpen: boolean; schedule: EMIScheduleItem[]; accountNo: string; isLoading: boolean }>({
        isOpen: false,
        schedule: [],
        accountNo: "",
        isLoading: false,
    });

    const loadData = useCallback(() => {
        setState((prev) => ({ ...prev, isProgress: true }));
        Fn_FillListData(dispatch, setState, "dataList", LIST_API_URL).catch((error) => {
            console.error("Failed to load member account list:", error);
            setState((prev) => ({ ...prev, isProgress: false }));
        });
    }, [dispatch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAdd = () => {
        navigate("/addEditMemberAccount", { state: { Id: 0 } });
    };

    const handleEdit = (id: number | string) => {
        if (!id) return;
        navigate("/addEditMemberAccount", { state: { Id: id } });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState((prev) => ({ ...prev, filterText: e.target.value }));
    };

    const handleViewEMI = (item: any) => {
        if (!item?.Id) return;
        
        // Open modal with loading state
        setEmiModal({
            isOpen: true,
            schedule: [],
            accountNo: item.AccountNo ?? "",
            isLoading: true,
        });

        // Fetch account data by ID
        const apiUrl = `${API_WEB_URLS.MASTER}/0/token/MemberAccountData/Id`;
        const tempState = { formData: {} as any };
        
        Fn_DisplayData(
            dispatch,
            (prevState: any) => {
                const updatedState = typeof prevState === 'function' ? prevState({}) : { ...tempState, ...prevState };
                const formData = updatedState.formData;
                
                try {
                    let schedule: EMIScheduleItem[] = [];
                    if (formData?.EMIScheduleJson) {
                        const parsed = typeof formData.EMIScheduleJson === 'string' 
                            ? JSON.parse(formData.EMIScheduleJson) 
                            : formData.EMIScheduleJson;
                        schedule = Array.isArray(parsed) ? parsed : [];
                    }
                    setEmiModal(prev => ({
                        ...prev,
                        schedule,
                        isLoading: false,
                    }));
                } catch (e) {
                    console.error("Error parsing EMI Schedule:", e);
                    setEmiModal(prev => ({
                        ...prev,
                        schedule: [],
                        isLoading: false,
                    }));
                }
                return updatedState;
            },
            item.Id,
            apiUrl
        );
    };

    const filteredList = useMemo(() => {
        const list = Array.isArray(state.dataList) ? state.dataList : [];
        const search = state.filterText.trim().toLowerCase();
        if (!search) return list;
        return list.filter((item: any) =>
            String(item?.AccountNo ?? "").toLowerCase().includes(search) ||
            String(item?.MemberName ?? "").toLowerCase().includes(search) ||
            String(item?.LoanAmount ?? "").toLowerCase().includes(search)
        );
    }, [state.dataList, state.filterText]);

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Loan Accounts" parent="Masters" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Card>
                            <CardHeaderCommon title="Loan Account List" tagClass="card-title mb-0" />
                            <CardBody>
                                <Row className="mb-3">
                                    <Col md="6" className="d-flex align-items-center">
                                        <Label className="me-2 mb-0">Search:</Label>
                                        <Input
                                            type="search"
                                            placeholder="Search by account no, member, amount..."
                                            value={state.filterText}
                                            onChange={handleSearchChange}
                                        />
                                    </Col>
                                    <Col md="6" className="text-end">
                                        <Btn color="primary" onClick={handleAdd}>
                                            <i className="fa fa-plus me-2" />
                                            Add Loan Account
                                        </Btn>
                                    </Col>
                                </Row>

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
                                                    <th>Account No</th>
                                                    <th>Loan Amount</th>
                                                    <th>Interest Rate</th>
                                                    <th>Tenure</th>
                                                    <th>EMI Amount</th>
                                                    <th>Total Repayment</th>
                                                    <th>Status</th>
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
                                                        <tr key={item?.Id ?? index}>
                                                            <td>{index + 1}</td>
                                                            <td>{item?.AccountNo ?? "-"}</td>
                                                            <td className="text-end">{item?.LoanAmount != null ? `₹ ${Number(item.LoanAmount).toLocaleString("en-IN")}` : "-"}</td>
                                                            <td className="text-end">{item?.InterestRate != null ? `${Number(item.InterestRate).toFixed(2)}%` : "-"}</td>
                                                            <td className="text-center">{item?.PeriodCount ?? "-"}</td>
                                                            <td className="text-end">{item?.EMIAmount != null ? `₹ ${Number(item.EMIAmount).toLocaleString("en-IN")}` : "-"}</td>
                                                            <td className="text-end">{item?.TotalRepaymentAmount != null ? `₹ ${Number(item.TotalRepaymentAmount).toLocaleString("en-IN")}` : "-"}</td>
                                                            <td className="text-center">
                                                                <span className={`badge ${item?.F_StatusMaster === 1 ? "bg-success" : "bg-warning"}`}>
                                                                    {item?.F_StatusMaster === 1 ? "Active" : "Pending"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <Btn color="primary" size="sm" className="me-1" onClick={() => handleEdit(item?.Id)} title="Edit">
                                                                    <i className="fa fa-edit" />
                                                                </Btn>
                                                                <Btn color="info" size="sm" onClick={() => handleViewEMI(item)} title="View EMI Schedule">
                                                                    <i className="fa fa-calendar" />
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

            {/* ── EMI Schedule Modal ── */}
            <Modal isOpen={emiModal.isOpen} toggle={() => setEmiModal(prev => ({ ...prev, isOpen: false }))} size="xl">
                <ModalHeader toggle={() => setEmiModal(prev => ({ ...prev, isOpen: false }))}>
                    EMI Schedule - Account: {emiModal.accountNo}
                </ModalHeader>
                <ModalBody>
                    {emiModal.isLoading ? (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="mt-2 text-muted">Loading EMI Schedule...</p>
                        </div>
                    ) : emiModal.schedule.length === 0 ? (
                        <div className="text-center py-4 text-muted">No EMI Schedule available</div>
                    ) : (
                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
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
                                    {emiModal.schedule.map((item, idx) => (
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
                    )}
                </ModalBody>
            </Modal>
        </div>
    );
};

export default PageList_MemberAccount;
