import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { Fn_AddEditData, Fn_DisplayData, Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { Card, CardBody, CardFooter, Col, Container, FormGroup, Input, Label, Row } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Btn } from "../../AbstractElements";

interface DropState { dataList: any[]; isProgress: boolean; filterText: string; }
const emptyDrop = (): DropState => ({ dataList: [], isProgress: false, filterText: "" });

const AddEdit_LedgerMaster = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const firstRef = useRef<HTMLInputElement | null>(null);

  const [state, setState] = useState({ id: 0, formData: { Id: 0, Name: "", F_LedgerGroup: "", F_BranchOffice: localStorage.getItem("F_BranchOffice") ?? "", Remark: "" }, isProgress: false });

  const [ledgerGroupState, setLedgerGroupState] = useState<DropState>(emptyDrop());
  const [branchState, setBranchState] = useState<DropState>(emptyDrop());

  const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/Id`;

  useEffect(() => {
    // Fetch ledger groups from LedgerGroupMaster and branches from BranchOffice
    Fn_FillListData(dispatch, setLedgerGroupState, "dataList", `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.LedgerGroupMaster}/Id/0`).catch(console.error);
    Fn_FillListData(dispatch, setBranchState, "dataList", `${API_WEB_URLS.MASTER}/0/token/BranchOffice/Id/0`).catch(console.error);
  }, [dispatch]);

  useEffect(() => {
    const locationState = (location.state as any) || {};
    const id = locationState?.Id ?? 0;
    if (id > 0) {
      setState((prev) => ({ ...prev, id, isProgress: true }));
      Fn_DisplayData(dispatch, setState as any, id, API_URL_EDIT);
    } else {
      setState({ id: 0, formData: { Id: 0, Name: "", F_LedgerGroup: "", F_BranchOffice: localStorage.getItem("F_BranchOffice") ?? "", Remark: "" }, isProgress: false });
    }
  }, [dispatch, location.state]);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const initialValues = state.formData;

  const validationSchema = useMemo(() => Yup.object({
    Name: Yup.string().required("Name is required"),
    F_LedgerGroup: Yup.string().required("Ledger Group is required"),
  }), []);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const loggedUserId = String(currentUser?.uid ?? currentUser?.id ?? "");

      const fd = new FormData();
      fd.append("Name", values.Name || "");
      fd.append("F_LedgerGroup", String(values.F_LedgerGroup || ""));
      fd.append("F_BranchOffice", String(values.F_BranchOffice || ""));
      fd.append("Remark", values.Remark || "");
      fd.append("UserId", loggedUserId);

      await Fn_AddEditData(dispatch, () => navigate("/ledgerMasterList"), { arguList: { id: values.Id ?? 0, formData: fd } }, `LedgerMaster/${loggedUserId}/token`, true, "ledgerid");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-body">
      <Breadcrumbs mainTitle={state.id > 0 ? "Edit Ledger" : "Add Ledger"} parent="Masters" />
      <Container fluid>
        <Row>
          <Col xs="12">
            <Card>
              <CardHeaderCommon title={state.id > 0 ? "Edit Ledger" : "Add Ledger"} tagClass="card-title mb-0" />
              <CardBody>
                <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
                  {({ values, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label>Name</Label>
                            <Input name="Name" innerRef={firstRef as any} value={values.Name || ""} onChange={handleChange} onBlur={handleBlur} />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label>Ledger Group</Label>
                            <Input type="select" name="F_LedgerGroup" value={values.F_LedgerGroup || ""} onChange={handleChange}>
                              <option value="">Select Group...</option>
                              {ledgerGroupState.dataList.map((g: any) => <option key={g.Id} value={g.Id}>{g.Name}</option>)}
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label>Branch</Label>
                            <Input type="select" name="F_BranchOffice" value={values.F_BranchOffice || ""} onChange={handleChange}>
                              <option value="">Select Branch...</option>
                              {branchState.dataList.map((b: any) => <option key={b.Id} value={b.Id}>{b.Name || b.BranchName}</option>)}
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label>Remark</Label>
                            <Input type="text" name="Remark" value={values.Remark || ""} onChange={handleChange} />
                          </FormGroup>
                        </Col>
                      </Row>

                      <CardFooter className="text-end">
                        <Btn color="secondary" type="button" onClick={() => navigate("/ledgerMasterList")}>Cancel</Btn>
                        <Btn color="primary" type="submit" disabled={isSubmitting as boolean} className="ms-2">{isSubmitting ? 'Saving...' : 'Save'}</Btn>
                      </CardFooter>
                    </Form>
                  )}
                </Formik>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddEdit_LedgerMaster;
