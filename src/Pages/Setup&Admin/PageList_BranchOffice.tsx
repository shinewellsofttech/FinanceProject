import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, Input, Label, Row, Table } from "reactstrap";
import { Btn } from "../../AbstractElements";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Fn_DeleteData, Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";

const LIST_API_URL = `${API_WEB_URLS.MASTER}/0/token/BranchOfficeMaster/Id/0`;
const DELETE_API_URL = `${API_WEB_URLS.MASTER}/0/token/BranchOfficeMaster/Id`;

interface ListState {
  dataList: any[];
  isProgress: boolean;
  filterText: string;
}

const PageList_BranchOffice = () => {
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
      console.error("Failed to load branch office list:", error);
      setState((prev) => ({ ...prev, isProgress: false }));
    });
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = () => {
    navigate("/branchOfficeCreation", { state: { Id: 0 } });
  };

  const handleEdit = (id: number | string) => {
    if (!id) return;
    navigate("/branchOfficeCreation", { state: { Id: id } });
  };

  const handleDelete = (id: number | string) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this branch office?")) {
      Fn_DeleteData(dispatch, setState as any, Number(id), DELETE_API_URL, LIST_API_URL)
        .then(() => loadData())
        .catch((error) => {
          console.error("Failed to delete:", error);
          alert("Failed to delete. Please try again.");
        });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, filterText: e.target.value }));
  };

  const filteredList = useMemo(() => {
    const list = Array.isArray(state.dataList) ? state.dataList : [];
    const search = state.filterText.trim().toLowerCase();
    if (!search) return list;
    return list.filter(
      (item: any) =>
        String(item?.BranchName ?? "").toLowerCase().includes(search) ||
        String(item?.BranchCode ?? "").toLowerCase().includes(search) ||
        String(item?.BranchAddress ?? "").toLowerCase().includes(search)
    );
  }, [state.dataList, state.filterText]);

  return (
    <div className="page-body">
      <Breadcrumbs mainTitle="Branch Office" parent="Setup & Admin" />
      <Container fluid>
        <Row>
          <Col xs="12">
            <Card>
              <CardHeaderCommon title="Branch Office List" tagClass="card-title mb-0" />
              <CardBody>
                <Row className="mb-3">
                  <Col md="6" className="d-flex align-items-center">
                    <Label className="me-2 mb-0">Search:</Label>
                    <Input
                      type="search"
                      placeholder="Search by name, code, address..."
                      value={state.filterText}
                      onChange={handleSearchChange}
                    />
                  </Col>
                  <Col md="6" className="text-end">
                    <Btn color="primary" onClick={handleAdd}>
                      <i className="fa fa-plus me-2" />
                      Add Branch Office
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
                          <th>Branch Name</th>
                          <th>Branch Code</th>
                          <th>Address</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-4">
                              No records found.
                            </td>
                          </tr>
                        ) : (
                          filteredList.map((item: any, index: number) => (
                            <tr key={item?.Id ?? index}>
                              <td>{index + 1}</td>
                              <td>{item?.BranchName ?? "-"}</td>
                              <td>{item?.BranchCode ?? "-"}</td>
                              <td>{item?.BranchAddress ?? "-"}</td>
                              <td>
                                <Btn color="primary" size="sm" className="me-2" onClick={() => handleEdit(item?.Id)}>
                                  <i className="fa fa-edit" />
                                </Btn>
                                <Btn color="danger" size="sm" onClick={() => handleDelete(item?.Id)}>
                                  <i className="fa fa-trash" />
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

export default PageList_BranchOffice;
