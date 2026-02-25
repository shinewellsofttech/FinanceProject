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
    FullName: string;
    EmployeeID: string;
    Username: string;
    Password: string;
    AssignRole: string;
    AssignBranch: string;
    MobileNumber: string;
    EmailID: string;
    DateOfJoining: string;
    UserStatus: string;
}

const initialValues: FormValues = {
    FullName: "",
    EmployeeID: "",
    Username: "",
    Password: "",
    AssignRole: "",
    AssignBranch: "",
    MobileNumber: "",
    EmailID: "",
    DateOfJoining: "",
    UserStatus: "Active",
};

interface DropdownState {
    roles: Array<{ Id?: number; Name?: string }>;
    branches: Array<{ Id?: number; Name?: string }>;
}

interface UserState {
    id: number;
    formData: Partial<FormValues>;
    isProgress?: boolean;
}

const UserCreationBranceMapping = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const fullNameRef = useRef<HTMLInputElement | null>(null);

    const [userState, setUserState] = useState<UserState>({
        id: 0,
        formData: { ...initialValues },
        isProgress: false,
    });

    const [dropdowns, setDropdowns] = useState<DropdownState>({
        roles: [],
        branches: [],
    });

    const isEditMode = userState.id > 0;

    const ROLE_API_URL = `${API_WEB_URLS.MASTER}/0/token/UserRoleMaster/Id/0`;
    const BRANCH_API_URL = `${API_WEB_URLS.MASTER}/0/token/BranchOfficeMaster/Id/0`;

    const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/UserMaster/Id`;
    const API_URL_SAVE = `UserMaster/0/token`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                FullName: Yup.string().trim().required("Full Name is required"),
                EmployeeID: Yup.string().trim(),
                Username: Yup.string().trim().required("Username/Login ID is required"),
                Password: Yup.string()
                    .trim()
                    .min(8, "Minimum 8 characters required")
                    .matches(/[A-Z]/, "Requires at least one uppercase letter")
                    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Requires at least one special character")
                    .required("Password is required"),
                AssignRole: Yup.string().trim().required("Assign Role is required"),
                AssignBranch: Yup.string().trim().required("Assign Branch is required"),
                MobileNumber: Yup.string().trim().required("Mobile Number is required"),
                EmailID: Yup.string().trim().email("Invalid email format").required("Email ID is required"),
                DateOfJoining: Yup.string().trim(),
                UserStatus: Yup.string().trim(),
            }),
        []
    );

    useEffect(() => {
        fullNameRef.current?.focus();
    }, []);

    useEffect(() => {
        Fn_FillListData(dispatch, setDropdowns, "roles", ROLE_API_URL)
            .catch((err) => console.error("Failed to fetch roles:", err));
        Fn_FillListData(dispatch, setDropdowns, "branches", BRANCH_API_URL)
            .catch((err) => console.error("Failed to fetch branches:", err));
    }, [dispatch, ROLE_API_URL, BRANCH_API_URL]);

    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;

        if (recordId > 0) {
            setUserState((prev) => ({
                ...prev,
                id: recordId,
            }));
            Fn_DisplayData(dispatch, setUserState, recordId, API_URL_EDIT);
        } else {
            setUserState((prev) => ({
                ...prev,
                id: 0,
                formData: { ...initialValues },
            }));
        }
    }, [dispatch, location.state, API_URL_EDIT]);

    const toStringOrEmpty = (value: unknown) => (value !== undefined && value !== null ? String(value) : "");

    const initialFormValues: FormValues = {
        ...initialValues,
        FullName: toStringOrEmpty(userState.formData.FullName),
        EmployeeID: toStringOrEmpty(userState.formData.EmployeeID),
        Username: toStringOrEmpty(userState.formData.Username),
        Password: toStringOrEmpty(userState.formData.Password),
        AssignRole: toStringOrEmpty(userState.formData.AssignRole),
        AssignBranch: toStringOrEmpty(userState.formData.AssignBranch),
        MobileNumber: toStringOrEmpty(userState.formData.MobileNumber),
        EmailID: toStringOrEmpty(userState.formData.EmailID),
        DateOfJoining: toStringOrEmpty(userState.formData.DateOfJoining),
        UserStatus: toStringOrEmpty(userState.formData.UserStatus) || "Active",
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Id", String(userState.id ?? 0));
            formData.append("FullName", values.FullName || "");
            formData.append("EmployeeID", values.EmployeeID || "");
            formData.append("Username", values.Username || "");
            formData.append("Password", values.Password || "");
            formData.append("AssignRole", values.AssignRole || "");
            formData.append("AssignBranch", values.AssignBranch || "");
            formData.append("MobileNumber", values.MobileNumber || "");
            formData.append("EmailID", values.EmailID || "");
            formData.append("DateOfJoining", values.DateOfJoining || "");
            formData.append("UserStatus", values.UserStatus || "Active");

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            formData.append("UserId", currentUser?.uid ?? currentUser?.id ?? "0");

            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder callback
                { arguList: { id: userState.id, formData } },
                API_URL_SAVE,
                true,
                "memberid",
                navigate,
                "/userCreation"
            );

        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="User Creation & Branch Mapping" parent="Setup & Admin" />
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
                                                            Full Name <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="FullName"
                                                            placeholder="Employee full name"
                                                            value={values.FullName}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.FullName && !!errors.FullName}
                                                            innerRef={fullNameRef}
                                                        />
                                                        <ErrorMessage name="FullName" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Employee ID
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="EmployeeID"
                                                            placeholder="EMP001"
                                                            value={values.EmployeeID}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.EmployeeID && !!errors.EmployeeID}
                                                        />
                                                        <ErrorMessage name="EmployeeID" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Username / Login ID <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="Username"
                                                            placeholder="e.g. rajesh.kumar"
                                                            value={values.Username}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.Username && !!errors.Username}
                                                        />
                                                        <ErrorMessage name="Username" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Password <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="password"
                                                            name="Password"
                                                            placeholder="Min 8 chars, 1 uppercase, 1 special char"
                                                            value={values.Password}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.Password && !!errors.Password}
                                                        />
                                                        <ErrorMessage name="Password" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Assign Role <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="AssignRole"
                                                            value={values.AssignRole}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.AssignRole && !!errors.AssignRole}
                                                        >
                                                            <option value="">-- Select Role --</option>
                                                            {dropdowns.roles.length === 0 && <option value="1">Loan Officer (Role 1)</option>}
                                                            {dropdowns.roles.map((roleOption) => (
                                                                <option key={roleOption?.Id} value={roleOption?.Id ?? ""}>
                                                                    {roleOption?.Name || `Role ${roleOption?.Id ?? ""}`}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="AssignRole" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Assign Branch <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="AssignBranch"
                                                            value={values.AssignBranch}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.AssignBranch && !!errors.AssignBranch}
                                                        >
                                                            <option value="">-- Select Branch --</option>
                                                            {dropdowns.branches.length === 0 && <option value="1">Bandra Branch (BR002)</option>}
                                                            {dropdowns.branches.map((branchOption) => (
                                                                <option key={branchOption?.Id} value={branchOption?.Id ?? ""}>
                                                                    {branchOption?.Name || `Branch ${branchOption?.Id ?? ""}`}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="AssignBranch" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Mobile Number <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="MobileNumber"
                                                            placeholder="+91-XXXXXXXXXX"
                                                            value={values.MobileNumber}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.MobileNumber && !!errors.MobileNumber}
                                                        />
                                                        <ErrorMessage name="MobileNumber" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Email ID <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="email"
                                                            name="EmailID"
                                                            placeholder="user@company.com"
                                                            value={values.EmailID}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.EmailID && !!errors.EmailID}
                                                        />
                                                        <ErrorMessage name="EmailID" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            Date of Joining
                                                        </Label>
                                                        <Input
                                                            type="date"
                                                            name="DateOfJoining"
                                                            value={values.DateOfJoining}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.DateOfJoining && !!errors.DateOfJoining}
                                                        />
                                                        <ErrorMessage name="DateOfJoining" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>
                                                            User Status
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            name="UserStatus"
                                                            value={values.UserStatus}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            invalid={touched.UserStatus && !!errors.UserStatus}
                                                        >
                                                            <option value="Active">Active</option>
                                                            <option value="Inactive">Inactive</option>
                                                        </Input>
                                                        <ErrorMessage name="UserStatus" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="primary" type="submit" disabled={isSubmitting}>
                                                <i className="fa fa-user-plus me-1"></i> {isEditMode ? "Update User" : "Create User"}
                                            </Btn>
                                            <Btn color="light" type="button" className="text-dark">
                                                <i className="fa fa-pencil me-1"></i> Edit
                                            </Btn>
                                            <Btn color="warning" type="button" className="text-white">
                                                <i className="fa fa-key me-1"></i> Reset Password
                                            </Btn>
                                            <Btn color="danger" type="button">
                                                <i className="fa fa-times me-1"></i> Deactivate User
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

export default UserCreationBranceMapping;
