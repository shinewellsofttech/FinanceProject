import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_FillListData, Fn_AddEditData, Fn_DisplayData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import * as Yup from "yup";
import { Card, CardBody, CardFooter, Col, Container, FormGroup, Input, Label, Row } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Btn } from "../../AbstractElements";

interface FormValues {
  Name: string;
  F_CountryMaster: string;
}

const initialValues: FormValues = {
  Name: "",
  F_CountryMaster: "",
};

interface MasterState {
  id: number;
  formData: Partial<FormValues>;
  isProgress?: boolean;
}

interface DropdownState {
  countries: Array<{ Id?: number; Name?: string }>;
}

const COUNTRY_API_URL = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.CountryMaster}/Id/0`;
const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.StateMaster}/Id`;
const API_URL_SAVE = `${API_WEB_URLS.StateMaster}/0/token`;

const AddEdit_StateMaster = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const nameRef = useRef<HTMLInputElement | null>(null);

  const [masterState, setMasterState] = useState<MasterState>({
    id: 0,
    formData: { ...initialValues },
    isProgress: false,
  });

  const [dropdowns, setDropdowns] = useState<DropdownState>({
    countries: [],
  });

  const isEditMode = masterState.id > 0;

  const validationSchema = useMemo(
    () =>
      Yup.object({
        Name: Yup.string().trim().required("Name is required"),
        F_CountryMaster: Yup.string().trim().required("Country is required"),
      }),
    []
  );

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    Fn_FillListData(dispatch, setDropdowns, "countries", COUNTRY_API_URL).catch((err) =>
      console.error("Failed to fetch countries:", err)
    );
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
        formData: { ...initialValues },
      }));
    }
  }, [dispatch, location.state, API_URL_EDIT]);

  const toStringOrEmpty = (value: unknown) =>
    value !== undefined && value !== null ? String(value) : "";

  const initialFormValues: FormValues = {
    ...initialValues,
    Name: toStringOrEmpty(masterState.formData.Name),
    F_CountryMaster: toStringOrEmpty(masterState.formData.F_CountryMaster),
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      const formData = new FormData();
      formData.append("Id", String(masterState.id ?? 0));
      formData.append("Name", values.Name || "");
      formData.append("F_CountryMaster", values.F_CountryMaster || "");

      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      formData.append("UserId", currentUser?.uid ?? currentUser?.id ?? "0");

      await Fn_AddEditData(
        dispatch,
        () => undefined,
        { arguList: { id: masterState.id, formData } },
        API_URL_SAVE,
        true,
        "memberid",
        navigate,
        "/stateMaster"
      );
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-body">
      <Breadcrumbs mainTitle={isEditMode ? "Edit State" : "Add State"} parent="Masters" />
      <Container fluid>
        <Row>
          <Col xs="12">
            <Formik<FormValues>
              initialValues={initialFormValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, handleChange, handleBlur, errors, touched, isSubmitting }: FormikProps<FormValues>) => (
                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                  <Card>
                    <CardHeaderCommon
                      title={`${isEditMode ? "Edit" : "Add"} State`}
                      tagClass="card-title mb-0"
                    />
                    <CardBody>
                      <Row className="gy-0">
                        <Col md="4">
                          <FormGroup className="mb-0">
                            <Label>Name <span className="text-danger">*</span></Label>
                            <Input
                              type="text"
                              name="Name"
                              placeholder="e.g. Maharashtra"
                              value={values.Name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              invalid={touched.Name && !!errors.Name}
                              innerRef={nameRef}
                            />
                            <ErrorMessage name="Name" component="div" className="text-danger small mt-1" />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup className="mb-0">
                            <Label>Country <span className="text-danger">*</span></Label>
                            <Input
                              type="select"
                              name="F_CountryMaster"
                              value={values.F_CountryMaster}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              invalid={touched.F_CountryMaster && !!errors.F_CountryMaster}
                            >
                              <option value="">-- Select Country --</option>
                              {dropdowns.countries.map((opt) => (
                                <option key={opt?.Id} value={opt?.Id ?? ""}>
                                  {opt?.Name ?? `Country ${opt?.Id ?? ""}`}
                                </option>
                              ))}
                            </Input>
                            <ErrorMessage name="F_CountryMaster" component="div" className="text-danger small mt-1" />
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
                        onClick={() => navigate("/stateMaster")}
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

export default AddEdit_StateMaster;
