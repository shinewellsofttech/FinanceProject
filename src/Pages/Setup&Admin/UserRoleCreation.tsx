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
    RoleName: string;
    TransactionApprovalLimit: string;
    CanViewBlackData: string;
    Description: string;
}

const initialValues: FormValues = {
    RoleName: "",
    TransactionApprovalLimit: "",
    CanViewBlackData: "No",
    Description: "",
};


interface RoleState {
    id: number;
    formData: Partial<FormValues>;
    isProgress?: boolean;
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
    });


    const isEditMode = roleState.id > 0;

    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/UserRoleMaster/Id`;
    const API_URL_SAVE = `UserRoleMaster/0/token`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                RoleName: Yup.string().trim().required("Role Name is required"),
                TransactionApprovalLimit: Yup.number().typeError("Must be a number").min(0, "Cannot be negative"),
                CanViewBlackData: Yup.string().trim().required("Selection is required"),
                Description: Yup.string().trim(),
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
            }));
        }
    }, [dispatch, location.state, API_URL_EDIT]);

    const toStringOrEmpty = (value: unknown) => (value !== undefined && value !== null ? String(value) : "");

    const initialFormValues: FormValues = {
        ...initialValues,
        RoleName: toStringOrEmpty(roleState.formData.RoleName),
        TransactionApprovalLimit: toStringOrEmpty(roleState.formData.TransactionApprovalLimit),
        CanViewBlackData: toStringOrEmpty(roleState.formData.CanViewBlackData) || "No",
        Description: toStringOrEmpty(roleState.formData.Description),
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Id", String(roleState.id ?? 0));
            formData.append("RoleName", values.RoleName || "");
            formData.append("TransactionApprovalLimit", values.TransactionApprovalLimit || "0");
            formData.append("CanViewBlackData", values.CanViewBlackData || "No");
            formData.append("Description", values.Description || "");

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            formData.append("UserId", currentUser?.uid ?? currentUser?.id ?? "0");

            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder callback
                { arguList: { id: roleState.id, formData } },
                API_URL_SAVE,
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
                                            <Row className="gy-0">
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Role Name <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="RoleName"
                                                            placeholder="e.g. Branch Manager"
                                                            value={values.RoleName}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.RoleName && !!errors.RoleName}
                                                            innerRef={roleNameRef}
                                                        />
                                                        <ErrorMessage name="RoleName" component="div" className="text-danger small mt-1" />
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
                                                            name="CanViewBlackData"
                                                            value={values.CanViewBlackData}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.CanViewBlackData && !!errors.CanViewBlackData}
                                                        >
                                                            <option value="Yes">Yes (Show Black + White data)</option>
                                                            <option value="No">No (Show White data only)</option>
                                                        </Input>
                                                        <ErrorMessage name="CanViewBlackData" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4"></Col>

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
                                            <Btn color="primary" type="submit" disabled={isSubmitting}>
                                                <i className="fa fa-save me-1"></i> {isEditMode ? "Update Role" : "Save Role"}
                                            </Btn>
                                            <Btn color="light" type="button" className="text-dark">
                                                <i className="fa fa-pencil me-1"></i> Edit
                                            </Btn>
                                            <Btn color="danger" type="button">
                                                <i className="fa fa-trash me-1"></i> Delete
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
