import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_AddEditData, Fn_DisplayData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import * as Yup from "yup";
import { Card, CardBody, CardFooter, Col, Container, FormGroup, Input, Label, Row } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";

interface FormValues {
    Name: string;
    Path: string;
    Status: string;
}

const initialValues: FormValues = {
    Name: "",
    Path: "",
    Status: "Active",
};

interface ModuleState {
    id: number;
    formData: Partial<FormValues> & {
        IsActive?: boolean;
    };
    isProgress?: boolean;
    isEditingOpen?: boolean;
}

const AddEdit_ModuleMaster = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const nameRef = useRef<HTMLInputElement | null>(null);

    const [moduleState, setModuleState] = useState<ModuleState>({
        id: 0,
        formData: { ...initialValues },
        isProgress: false,
        isEditingOpen: true,
    });

    const isEditMode = moduleState.id > 0;

    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/ModuleMasterEdit/Id`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                Name: Yup.string().trim().required("Name is required"),
                Path: Yup.string().trim().required("Path is required"),
                Status: Yup.string().trim().required("Status is required"),
            }),
        []
    );

    useEffect(() => {
        nameRef.current?.focus();
    }, []);

    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;

        if (recordId > 0) {
            setModuleState((prev) => ({
                ...prev,
                id: recordId,
                isEditingOpen: false,
            }));
            Fn_DisplayData(dispatch, setModuleState, recordId, API_URL_EDIT);
        } else {
            setModuleState((prev) => ({
                ...prev,
                id: 0,
                formData: { ...initialValues },
                isEditingOpen: true,
            }));
        }
    }, [dispatch, location.state, API_URL_EDIT]);

    const toStringOrEmpty = (value: unknown) => (value !== undefined && value !== null ? String(value) : "");

    const initialFormValues: FormValues = {
        ...initialValues,
        Name: toStringOrEmpty(moduleState.formData.Name),
        Path: toStringOrEmpty(moduleState.formData.Path),
        Status: moduleState.formData.IsActive === true || moduleState.formData.Status === "Active" ? "Active" :
            (moduleState.formData.IsActive === false || moduleState.formData.Status === "Inactive" ? "Inactive" : "Active"),
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Id", String(moduleState.id ?? 0));
            formData.append("Name", values.Name || "");
            formData.append("Path", values.Path || "");
            formData.append("IsActive", values.Status === "Active" ? "true" : "false");

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            const userId = currentUser?.uid ?? currentUser?.id ?? "0";
            formData.append("UserId", userId);

            const currentApiUrlSave = `ModuleMaster/${userId}/token`;

            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder callback
                { arguList: { id: moduleState.id, formData } },
                currentApiUrlSave,
                true,
                "memberid",
                navigate,
                "/moduleMasterList"
            );

        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Module Master Entry" parent="Masters" />
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
                                        <CardBody>
                                            <fieldset disabled={!moduleState.isEditingOpen}>
                                                <Row className="gy-0">
                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>
                                                                Module Name <span className="text-danger">*</span>
                                                            </Label>
                                                            <Input
                                                                type="text"
                                                                name="Name"
                                                                placeholder="e.g. Finance"
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
                                                            <Label>
                                                                Module Path <span className="text-danger">*</span>
                                                            </Label>
                                                            <Input
                                                                type="text"
                                                                name="Path"
                                                                placeholder="e.g. /finance"
                                                                value={values.Path}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.Path && !!errors.Path}
                                                            />
                                                            <ErrorMessage name="Path" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>
                                                                Status <span className="text-danger">*</span>
                                                            </Label>
                                                            <Input
                                                                type="select"
                                                                name="Status"
                                                                value={values.Status}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.Status && !!errors.Status}
                                                            >
                                                                <option value="Active">Active</option>
                                                                <option value="Inactive">Inactive</option>
                                                            </Input>
                                                            <ErrorMessage name="Status" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </fieldset>
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="primary" type="submit" disabled={isSubmitting || !moduleState.isEditingOpen}>
                                                <i className="fa fa-save me-1"></i> {isEditMode ? "Update Module" : "Save Module"}
                                            </Btn>
                                            <Btn
                                                color="light"
                                                type="button"
                                                className="text-dark"
                                                onClick={() => setModuleState(prev => ({ ...prev, isEditingOpen: !prev.isEditingOpen }))}
                                                disabled={!isEditMode}
                                            >
                                                <i className="fa fa-pencil me-1"></i> {moduleState.isEditingOpen ? "Lock" : "Edit"}
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

export default AddEdit_ModuleMaster;
