import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps } from "formik";
import * as Yup from "yup";
import { Card, CardBody, CardFooter, Col, Container, FormGroup, Input, Label, Row } from "reactstrap";
import { Btn } from "../../../AbstractElements";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Fn_FillListData, Fn_DisplayData, Fn_AddEditData } from "../../../store/Functions";
import { API_WEB_URLS } from "../../../constants/constAPI";

interface FormValues {
  Name: string;
  F_LedgerGroupMaster: string;
  F_BranchOffice: string;
  Remarks: string;
}

const API_URL = API_WEB_URLS.MASTER + "/0/token/LedgerMaster";
const API_URL_SAVE = API_WEB_URLS.LedgerMaster + "/0/token";
const API_URL_EDIT = API_WEB_URLS.MASTER + "/0/token/LedgerMaster/Id";

const AddEdit_LedgerMasterContainer = () => {
  const [state, setState] = useState({
    id: 0,
    FillArray: [],
    formData: {} as any,
    LedgerGroupMasterList: [] as any[],
    BranchOfficeList: [] as any[],
    isProgress: true,
  });

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fill list data
    Fn_FillListData(dispatch, setState, "FillArray", API_URL + "/Id/0");
    
    // Load LedgerGroupMaster dropdown data
    Fn_FillListData(
      dispatch,
      setState,
      "LedgerGroupMasterList",
      API_WEB_URLS.MASTER + "/0/token/LedgerGroupMaster/Id/0"
    );
    
    // Load BranchOffice dropdown data
    Fn_FillListData(
      dispatch,
      setState,
      "BranchOfficeList",
      API_WEB_URLS.MASTER + "/0/token/BranchOffice/Id/0"
    );

    const Id = (location.state && (location.state as any).Id) || 0;

    if (Id > 0) {
      setState((prevState) => ({
        ...prevState,
        id: Id,
      }));
      Fn_DisplayData(dispatch, setState, Id, API_URL_EDIT);
    }
  }, [dispatch, location.state]);

  const validationSchema = Yup.object({
    Name: Yup.string().required("Name is required"),
    F_LedgerGroupMaster: Yup.string().required("Ledger Group is required"),
    F_BranchOffice: Yup.string(),
    Remarks: Yup.string(),
  });

  const handleSubmit = (values: FormValues) => {
    const obj = JSON.parse(localStorage.getItem("authUser") || "{}");
    let vformData = new FormData();

    vformData.append("Name", values.Name);
    vformData.append("Remarks", values.Remarks || "");
    vformData.append("F_LedgerGroupMaster", values.F_LedgerGroupMaster);
    vformData.append("F_BranchOffice", values.F_BranchOffice || "");
    vformData.append("UserId", obj.uid || obj.id || "");

    Fn_AddEditData(
      dispatch,
      setState,
      { arguList: { id: state.id, formData: vformData } },
      API_URL_SAVE,
      true,
      "memberid",
      navigate,
      "/ledgerMasterList"
    );
  };

  const isEditMode = state.id > 0;
  const initialValues: FormValues = {
    Name: state.formData?.Name || "",
    F_LedgerGroupMaster: state.formData?.F_LedgerGroupMaster || "",
    F_BranchOffice: state.formData?.F_BranchOffice || "",
    Remarks: state.formData?.Remarks || "",
  };

  return (
    <div className="page-body">
      <style>{`
        .theme-form input[type="text"],
        .theme-form textarea,
        .theme-form select {
          color: #000000 !important;
        }
        body.dark-only .theme-form input[type="text"],
        body.dark-only .theme-form textarea,
        body.dark-only .theme-form select {
          color: #ffffff !important;
        }
      `}</style>
      <Breadcrumbs mainTitle="Ledger Master" parent="Masters" />
      <Container fluid>
        <Row>
          <Col xs="12">
            <Formik<FormValues>
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, handleChange, handleBlur, errors, touched }: FormikProps<FormValues>) => (
                <Form className="theme-form">
                  <Card>
                    <CardHeaderCommon
                      title={`${isEditMode ? "Edit" : "Add"} Ledger Master`}
                      tagClass="card-title mb-0"
                    />
                    <CardBody>
                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label>
                              Name <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="text"
                              name="Name"
                              placeholder="Enter ledger name"
                              value={values.Name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              invalid={touched.Name && !!errors.Name}
                            />
                            <ErrorMessage name="Name" component="div" className="text-danger small" />
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <Label>
                              Ledger Group <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="select"
                              name="F_LedgerGroupMaster"
                              value={values.F_LedgerGroupMaster}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              invalid={touched.F_LedgerGroupMaster && !!errors.F_LedgerGroupMaster}
                            >
                              <option value="">Select Ledger Group</option>
                              {(Array.isArray(state.LedgerGroupMasterList) ? state.LedgerGroupMasterList : []).map(
                                (item: any) => (
                                  <option key={item.ID || item.Id} value={item.ID || item.Id}>
                                    {item.Name}
                                  </option>
                                )
                              )}
                            </Input>
                            <ErrorMessage name="F_LedgerGroupMaster" component="div" className="text-danger small" />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label>
                              Branch Office
                            </Label>
                            <Input
                              type="select"
                              name="F_BranchOffice"
                              value={values.F_BranchOffice}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            >
                              <option value="">Select Branch Office</option>
                              {(Array.isArray(state.BranchOfficeList) ? state.BranchOfficeList : []).map(
                                (item: any) => (
                                  <option key={item.ID || item.Id} value={item.ID || item.Id}>
                                    {item.Name || item.BranchName}
                                  </option>
                                )
                              )}
                            </Input>
                            <ErrorMessage name="F_BranchOffice" component="div" className="text-danger small" />
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <Label>Remarks</Label>
                            <Input
                              type="textarea"
                              name="Remarks"
                              placeholder="Enter remarks"
                              value={values.Remarks}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              rows={3}
                            />
                            <ErrorMessage name="Remarks" component="div" className="text-danger small" />
                          </FormGroup>
                        </Col>
                      </Row>
                    </CardBody>
                    <CardFooter className="text-end">
                      <Btn
                        color="secondary"
                        type="button"
                        className="me-2"
                        onClick={() => navigate("/ledgerMasterList")}
                      >
                        Cancel
                      </Btn>
                      <Btn color="primary" type="submit">
                        {isEditMode ? "Update" : "Submit"}
                      </Btn>
                    </CardFooter>
                  </Card>
                </Form>
              )}
            </Formik>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddEdit_LedgerMasterContainer;
