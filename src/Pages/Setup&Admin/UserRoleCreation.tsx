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
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Btn } from "../../AbstractElements";

interface FormValues {
    Name: string;
    Code: string;
    TransactionApprovalLimit: string;
    IsViewBlackData: string;
    Description: string;
    Status: string;
}

const initialValues: FormValues = {
    Name: "",
    Code: "",
    TransactionApprovalLimit: "",
    IsViewBlackData: "false",
    Description: "",
    Status: "Active",
};


interface RoleState {
    id: number;
    formData: Partial<FormValues> & {
        IsActive?: boolean;
    };
    isProgress?: boolean;
    isEditingOpen?: boolean;
}

const UserRoleCreation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const roleNameRef = useRef<HTMLInputElement | null>(null);

    const [roleState, setRoleState] = useState<RoleState>({
        id: 0,
        formData: { ...initialValues },
        isProgress: false,
        isEditingOpen: true,
    });


    const isEditMode = roleState.id > 0;

    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/UserRoleEdit/Id`;
    const API_URL_SAVE = `UserRoleMaster/0/token`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                Name: Yup.string().trim().required("Role Name is required"),
                Code: Yup.string().trim().required("Role Code is required"),
                TransactionApprovalLimit: Yup.number().typeError("Must be a number").min(0, "Cannot be negative"),
                IsViewBlackData: Yup.string().trim().required("Selection is required"),
                Description: Yup.string().trim(),
                Status: Yup.string().trim().required("Status is required"),
            }),
        []
    );

    useEffect(() => {
        roleNameRef.current?.focus();
    }, []);

    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;

        if (recordId > 0) {
            setRoleState((prev) => ({
                ...prev,
                id: recordId,
            }));
            Fn_DisplayData(dispatch, setRoleState, recordId, API_URL_EDIT);
        } else {
            setRoleState((prev) => ({
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
        Name: toStringOrEmpty(roleState.formData.Name),
        Code: toStringOrEmpty(roleState.formData.Code),
        TransactionApprovalLimit: toStringOrEmpty(roleState.formData.TransactionApprovalLimit),
        IsViewBlackData: roleState.formData.IsViewBlackData === "true" ? "true" : "false",
        Description: toStringOrEmpty(roleState.formData.Description),
        Status: roleState.formData.IsActive === true || roleState.formData.Status === "Active" ? "Active" :
            (roleState.formData.IsActive === false || roleState.formData.Status === "Inactive" ? "Inactive" : "Active"),
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Id", String(roleState.id ?? 0));
            formData.append("Name", values.Name || "");
            formData.append("Code", values.Code || "");
            formData.append("TransactionApprovalLimit", values.TransactionApprovalLimit || "0");
            formData.append("IsViewBlackData", values.IsViewBlackData === "true" ? "true" : "false");
            formData.append("Description", values.Description || "");
            formData.append("IsActive", values.Status === "Active" ? "true" : "false");

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            const userId = currentUser?.uid ?? currentUser?.id ?? "0";
            formData.append("UserId", userId);

            const currentApiUrlSave = `UserRole/${userId}/token`;

            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder callback
                { arguList: { id: roleState.id, formData } },
                currentApiUrlSave,
                true,
                "memberid",
                navigate,
                "/userRoleCreation"
            );

        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="User Role Creation" parent="Setup & Admin" />
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
                                            <fieldset disabled={!roleState.isEditingOpen}>
                                                <Row className="gy-0">
                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>
                                                                Role Name <span className="text-danger">*</span>
                                                            </Label>
                                                            <Input
                                                                type="text"
                                                                name="Name"
                                                                placeholder="e.g. Branch Manager"
                                                                value={values.Name}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.Name && !!errors.Name}
                                                                innerRef={roleNameRef}
                                                            />
                                                            <ErrorMessage name="Name" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>
                                                                Role Code <span className="text-danger">*</span>
                                                            </Label>
                                                            <Input
                                                                type="text"
                                                                name="Code"
                                                                placeholder="e.g. BM-01"
                                                                value={values.Code}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.Code && !!errors.Code}
                                                            />
                                                            <ErrorMessage name="Code" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>
                                                                Transaction Approval Limit (₹)
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                name="TransactionApprovalLimit"
                                                                placeholder="e.g. 100000"
                                                                value={values.TransactionApprovalLimit}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.TransactionApprovalLimit && !!errors.TransactionApprovalLimit}
                                                            />
                                                            <ErrorMessage name="TransactionApprovalLimit" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md="4">
                                                        <FormGroup className="mb-0">
                                                            <Label>
                                                                Can View Black Data?
                                                            </Label>
                                                            <Input
                                                                type="select"
                                                                name="IsViewBlackData"
                                                                value={values.IsViewBlackData}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.IsViewBlackData && !!errors.IsViewBlackData}
                                                            >
                                                                <option value="true">Yes (Show Black + White data)</option>
                                                                <option value="false">No (Show White data only)</option>
                                                            </Input>
                                                            <ErrorMessage name="IsViewBlackData" component="div" className="text-danger small mt-1" />
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

                                                    <Col md="12">
                                                        <FormGroup className="mb-0">
                                                            <Label>
                                                                Description
                                                            </Label>
                                                            <Input
                                                                type="textarea"
                                                                name="Description"
                                                                rows={2}
                                                                placeholder="Role description and responsibilities"
                                                                value={values.Description}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                invalid={touched.Description && !!errors.Description}
                                                            />
                                                            <ErrorMessage name="Description" component="div" className="text-danger small mt-1" />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </fieldset>

                                            <div className="mt-4">
                                                <Card className="shadow-none border mb-0">
                                                    <div className="card-header bg-light py-3 border-bottom d-flex align-items-center gap-2">
                                                        <i className="fa fa-file-text-o text-muted"></i>
                                                        <h6 className="mb-0 text-primary">Reference: Default Role Templates</h6>
                                                    </div>
                                                    <CardBody className="bg-light bg-opacity-50">
                                                        <Row className="gy-0">
                                                            <Col md="4">
                                                                <Card className="h-100 shadow-sm border mb-0">
                                                                    <CardBody className="p-3">
                                                                        <h6 className="mb-3 d-flex align-items-center gap-2 text-primary">
                                                                            <i className="fa fa-diamond fa-xs"></i> Loan Officer
                                                                        </h6>
                                                                        <ul className="list-unstyled mb-0 d-flex flex-column gap-2 text-muted small">
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> Add Loan Application</li>
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> Edit Customer</li>
                                                                            <li><i className="fa fa-times text-danger fw-bold fs-6 me-2 ms-n1"></i> Approve Loan</li>
                                                                            <li><i className="fa fa-times text-danger fw-bold fs-6 me-2 ms-n1"></i> Delete Customer</li>
                                                                            <li><i className="fa fa-times text-danger fw-bold fs-6 me-2 ms-n1"></i> Reverse Receipt</li>
                                                                        </ul>
                                                                    </CardBody>
                                                                </Card>
                                                            </Col>
                                                            <Col md="4">
                                                                <Card className="h-100 shadow-sm border border-primary img-fluid mb-0">
                                                                    <CardBody className="p-3">
                                                                        <h6 className="mb-3 d-flex align-items-center gap-2 text-primary">
                                                                            <i className="fa fa-diamond text-danger fa-xs"></i> Branch Manager
                                                                        </h6>
                                                                        <ul className="list-unstyled mb-0 d-flex flex-column gap-2 text-muted small">
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> Approve Loan</li>
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> Reverse Receipt</li>
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> View All Branch Reports</li>
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> Day Closing</li>
                                                                            <li><i className="fa fa-times text-danger fw-bold fs-6 me-2 ms-n1"></i> Create Loan Product</li>
                                                                        </ul>
                                                                    </CardBody>
                                                                </Card>
                                                            </Col>
                                                            <Col md="4">
                                                                <Card className="h-100 shadow-sm border mb-0">
                                                                    <CardBody className="p-3">
                                                                        <h6 className="mb-3 d-flex align-items-center gap-2 text-primary">
                                                                            <i className="fa fa-caret-up text-danger me-1"></i> HO Admin
                                                                        </h6>
                                                                        <ul className="list-unstyled mb-0 d-flex flex-column gap-2 text-muted small">
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> Create Loan Product</li>
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> Approve High Value Loan</li>
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> Global Reports</li>
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> System Config</li>
                                                                            <li><i className="fa fa-check-square text-success me-2"></i> All Modules</li>
                                                                        </ul>
                                                                    </CardBody>
                                                                </Card>
                                                            </Col>
                                                        </Row>
                                                    </CardBody>
                                                </Card>
                                            </div>

                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="primary" type="submit" disabled={isSubmitting || !roleState.isEditingOpen}>
                                                <i className="fa fa-save me-1"></i> {isEditMode ? "Update Role" : "Save Role"}
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

export default UserRoleCreation;
