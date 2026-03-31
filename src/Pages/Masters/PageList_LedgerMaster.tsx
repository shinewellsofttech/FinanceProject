import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, Input, Label, Row, Table } from "reactstrap";
import { Btn } from "../../AbstractElements";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";

const LIST_API_URL = `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/Id/0`;

interface ListState {
  dataList: any[];
  isProgress: boolean;
  filterText: string;
}

const PageList_LedgerMaster = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [state, setState] = useState<ListState>({ dataList: [], isProgress: true, filterText: "" });

  const loadData = useCallback(() => {
    setState((prev) => ({ ...prev, isProgress: true }));
    Fn_FillListData(dispatch, setState, "dataList", LIST_API_URL).catch((err) => {
      console.error("Failed to load ledger list:", err);
      setState((prev) => ({ ...prev, isProgress: false }));
    });
  }, [dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = () => navigate("/addEditLedgerMaster", { state: { Id: 0 } });
  const handleEdit = (id: number | string) => { if (!id) return; navigate("/addEditLedgerMaster", { state: { Id: id } }); };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setState((prev) => ({ ...prev, filterText: e.target.value }));

  const filteredList = useMemo(() => {
    const list = Array.isArray(state.dataList) ? state.dataList : [];
    const q = state.filterText.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item: any) =>
      String(item?.Name ?? "").toLowerCase().includes(q) ||
      String(item?.Id ?? "").includes(q) ||
      String(item?.LedgerGroupName ?? "").toLowerCase().includes(q)
    );
  }, [state.dataList, state.filterText]);

  return (
    <div className="page-body">
      <Breadcrumbs mainTitle="Ledger Master" parent="Masters" />
      <Container fluid>
        <Row>
          <Col xs="12">
            <Card>
              <CardHeaderCommon title="Ledger List" tagClass="card-title mb-0" />
              <CardBody>
                <Row className="mb-3">
                  <Col md="6" className="d-flex align-items-center">
                    <Label className="me-2 mb-0">Search:</Label>
                    <Input type="search" placeholder="Search by name, group..." value={state.filterText} onChange={handleSearchChange} />
                  </Col>
                  <Col md="6" className="text-end">
                    <Btn color="primary" onClick={handleAdd}><i className="fa fa-plus me-2" />Add Ledger</Btn>
                  </Col>
                </Row>

                {state.isProgress ? (
                  <div className="text-center py-5"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>
                ) : (
                  <div className="table-responsive">
                    <Table bordered hover striped>
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Ledger Group</th>
                          <th>Branch</th>
                          <th>Remark</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredList.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-4">No records found.</td></tr>
                        ) : (
                          filteredList.map((item: any, idx: number) => (
                            <tr key={item?.Id ?? idx}>
                              <td>{idx + 1}</td>
                              <td>{item?.Name ?? "-"}</td>
                              <td>{item?.LedgerGroupName || item?.LedgerGroup || item?.F_LedgerGroup}</td>
                              <td>{item?.BranchName || item?.F_BranchOffice}</td>
                              <td>{item?.Remark ?? ""}</td>
                              <td>
                                <Btn color="primary" size="sm" className="me-1" onClick={() => handleEdit(item?.Id)} title="Edit"><i className="fa fa-edit" /></Btn>
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

export default PageList_LedgerMaster;
