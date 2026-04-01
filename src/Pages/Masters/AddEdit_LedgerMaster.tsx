import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { Fn_AddEditData, Fn_DisplayData, Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import { Card, CardBody, CardFooter, Col, Container, FormGroup, Input, Label, Row } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Btn } from "../../AbstractElements";

interface FormValues {
  Name: string;
  F_LedgerGroupMaster: string;
  F_BranchOffice: string;
  Remarks: string;
}

const initialFormValues: FormValues = {
  Name: "",
  F_LedgerGroupMaster: "",
  F_BranchOffice: "",
  Remarks: "",
};

interface MasterState {
  id: number;
  formData: Partial<FormValues>;
  isProgress?: boolean;
}

interface DropState { 
  dataList: any[]; 
  isProgress: boolean; 
  filterText: string; 
}

const emptyDrop = (): DropState => ({ dataList: [], isProgress: false, filterText: "" });

const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/Id`;
const API_URL_SAVE = `${API_WEB_URLS.LedgerMaster}/0/token`;

const AddEdit_LedgerMaster = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const nameRef = useRef<HTMLInputElement | null>(null);

  const [masterState, setMasterState] = useState<MasterState>({
    id: 0,
    formData: { ...initialFormValues },
    isProgress: false,
  });

  const [ledgerGroupState, setLedgerGroupState] = useState<DropState>(emptyDrop());
  const [branchState, setBranchState] = useState<DropState>(emptyDrop());

  const isEditMode = masterState.id > 0;

  const validationSchema = useMemo(
    () =>
      Yup.object({
        Name: Yup.string().trim().required("Name is required"),
        F_LedgerGroupMaster: Yup.string().required("Ledger Group is required"),
      }),
    []
  );

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    // Fetch ledger groups from LedgerGroupMaster and branches from BranchOffice
    Fn_FillListData(dispatch, setLedgerGroupState, "dataList", `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.LedgerGroupMaster}/Id/0`).catch(console.error);
    Fn_FillListData(dispatch, setBranchState, "dataList", `${API_WEB_URLS.MASTER}/0/token/BranchOffice/Id/0`).catch(console.error);
  }, [dispatch]);

  useEffect(() => {
    const locationState = location.state as { Id?: number } | undefined;
    const recordId = locationState?.Id ?? 0;

    if (recordId > 0) {
      setMasterState((prev) => ({ ...prev, id: recordId }));
      Fn_DisplayData(dispatch, setMasterState, recordId, API_URL_EDIT);
    } else {
      setMasterState((prev) => ({
        ...prev,
        id: 0,
        formData: { 
          ...initialFormValues,
          F_BranchOffice: localStorage.getItem("F_BranchOffice") || "",
        },
      }));
    }
  }, [dispatch, location.state]);

  const toStringOrEmpty = (value: unknown) =>
    value !== undefined && value !== null ? String(value) : "";

  const currentFormValues: FormValues = {
    ...initialFormValues,
    Name: toStringOrEmpty(masterState.formData.Name),
    F_LedgerGroupMaster: toStringOrEmpty((masterState.formData as any).F_LedgerGroupMaster),
    F_BranchOffice: toStringOrEmpty((masterState.formData as any).F_BranchOffice || localStorage.getItem("F_BranchOffice")),
    Remarks: toStringOrEmpty((masterState.formData as any).Remarks),
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const loggedUserId = String(currentUser?.uid ?? currentUser?.id ?? "0");

      const formData = new FormData();
      formData.append("Name", values.Name || "");
      formData.append("Remarks", values.Remarks || "");
      formData.append("F_LedgerGroupMaster", String(values.F_LedgerGroupMaster || ""));
      formData.append("F_BranchOffice", String(values.F_BranchOffice || ""));
      formData.append("UserId", loggedUserId);

      await Fn_AddEditData(
        dispatch,
        () => undefined,
        { arguList: { id: masterState.id, formData } },
        API_URL_SAVE,
        true,
        "ledgerid",
        navigate,
        "/ledgerMasterList"
      );
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-body">
      <Breadcrumbs mainTitle={isEditMode ? "Edit Ledger" : "Add Ledger"} parent="Masters" />
      <Container fluid>
        <Row>
          <Col xs="12">
            <Formik<FormValues>
              initialValues={currentFormValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, handleChange, handleBlur, errors, touched, isSubmitting }: FormikProps<FormValues>) => (
                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                  <Card>
                    <CardHeaderCommon
                      title={`${isEditMode ? "Edit" : "Add"} Ledger Master`}
                      tagClass="card-title mb-0"
                    />
                    <CardBody>
                      <Row className="gy-3">
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
                              innerRef={nameRef}
                            />
                            <ErrorMessage name="Name" component="div" className="text-danger small mt-1" />
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
                              <option value="">Select Group...</option>
                              {ledgerGroupState.dataList.map((g: any) => (
                                <option key={g.ID || g.Id} value={g.ID || g.Id}>
                                  {g.Name}
                                </option>
                              ))}
                            </Input>
                            <ErrorMessage name="F_LedgerGroupMaster" component="div" className="text-danger small mt-1" />
                          </FormGroup>
                        </Col>
                      </Row>

                      <Row className="gy-3">
                        <Col md="6">
                          <FormGroup>
                            <Label>Branch Office</Label>
                            <Input
                              type="select"
                              name="F_BranchOffice"
                              value={values.F_BranchOffice}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            >
                              <option value="">Select Branch...</option>
                              {branchState.dataList.map((b: any) => (
                                <option key={b.ID || b.Id} value={b.ID || b.Id}>
                                  {b.Name || b.BranchName}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <Label>Remarks</Label>
                            <Input
                              type="text"
                              name="Remarks"
                              placeholder="Enter remarks"
                              value={values.Remarks}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </CardBody>
                    <CardFooter className="d-flex align-items-center gap-2">
                      <Btn color="primary" type="submit" disabled={isSubmitting}>
                        <i className="fa fa-save me-1"></i> {isEditMode ? "Update" : "Save"}
                      </Btn>
                      <Btn
                        color="light"
                        type="button"
                        className="text-dark"
                        onClick={() => navigate("/ledgerMasterList")}
                      >
                        <i className="fa fa-list me-1"></i> Back to List
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

export default AddEdit_LedgerMaster;
