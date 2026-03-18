import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, Input, Label, Row, Table } from "reactstrap";
import { Btn } from "../../AbstractElements";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";

const LIST_API_URL = `${API_WEB_URLS.MASTER}/0/token/MemberAccountData/Id/0`;

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

    const filteredList = useMemo(() => {
        const list = Array.isArray(state.dataList) ? state.dataList : [];
        const search = state.filterText.trim().toLowerCase();
        if (!search) return list;
        return list.filter((item: any) =>
            String(item?.MemberName ?? "").toLowerCase().includes(search) ||
            String(item?.SchemeName ?? "").toLowerCase().includes(search) ||
            String(item?.EngineNo ?? "").toLowerCase().includes(search) ||
            String(item?.BusinessType ?? "").toLowerCase().includes(search)
        );
    }, [state.dataList, state.filterText]);

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Member Account" parent="Masters" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Card>
                            <CardHeaderCommon title="Member Account List" tagClass="card-title mb-0" />
                            <CardBody>
                                <Row className="mb-3">
                                    <Col md="6" className="d-flex align-items-center">
                                        <Label className="me-2 mb-0">Search:</Label>
                                        <Input
                                            type="search"
                                            placeholder="Search by member, scheme, engine no..."
                                            value={state.filterText}
                                            onChange={handleSearchChange}
                                        />
                                    </Col>
                                    <Col md="6" className="text-end">
                                        <Btn color="primary" onClick={handleAdd}>
                                            <i className="fa fa-plus me-2" />
                                            Add Member Account
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
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Member</th>
                                                    <th>Scheme</th>
                                                    <th>Amount</th>
                                                    <th>Tenure</th>
                                                    <th>Gross Wt.</th>
                                                    <th>Net Wt.</th>
                                                    <th>Purity</th>
                                                    <th>Vehicle Type</th>
                                                    <th>Engine No.</th>
                                                    <th>Monthly Income</th>
                                                    <th>Business Type</th>
                                                    <th>Maturity Date</th>
                                                    <th>Installment Amt.</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={15} className="text-center py-4">
                                                            No records found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredList.map((item: any, index: number) => (
                                                        <tr key={item?.Id ?? index}>
                                                            <td>{index + 1}</td>
                                                            <td>{item?.MemberName ?? item?.F_Member ?? "-"}</td>
                                                            <td>{item?.SchemeName ?? item?.F_Scheme ?? "-"}</td>
                                                            <td>{item?.Amount != null ? Number(item.Amount).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "-"}</td>
                                                            <td>{item?.Tenure ?? "-"}</td>
                                                            <td>{item?.GrossWeight ?? "-"}</td>
                                                            <td>{item?.NetWeight ?? "-"}</td>
                                                            <td>{item?.Purity ?? "-"}</td>
                                                            <td>{item?.VehicleTypeName ?? item?.F_VehicleType ?? "-"}</td>
                                                            <td>{item?.EngineNo ?? "-"}</td>
                                                            <td>{item?.MonthlyIncome != null ? Number(item.MonthlyIncome).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "-"}</td>
                                                            <td>{item?.BusinessType ?? "-"}</td>
                                                            <td>{item?.MaturityDate ? new Date(item.MaturityDate).toLocaleDateString("en-IN") : "-"}</td>
                                                            <td>{item?.InstallmentAmount != null ? Number(item.InstallmentAmount).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "-"}</td>
                                                            <td>
                                                                <Btn color="primary" size="sm" className="me-2" onClick={() => handleEdit(item?.Id)}>
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

export default PageList_MemberAccount;
