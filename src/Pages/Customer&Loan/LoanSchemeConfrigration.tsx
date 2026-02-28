import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { Fn_AddEditData, Fn_DisplayData, Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import * as Yup from "yup";
import { Card, CardBody, CardFooter, Col, Container, FormGroup, Input, Label, Row } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";

interface FormValues {
    Name: string;
    Code: string;
    F_LoanType: string;
    F_EMIFrequency: string;
    F_InterestType: string;
    F_InterestCalculationBasis: string;
    InterestRate: string;
    IsInterestRateChange: string;
    MinLoanAmount: string;
    MaxLoanAmount: string;
    MinTenureMonths: string;
    MaxTenureMonths: string;
    ProcessingFeePercent: string;
    PrepaymentChargesPercent: string;
    PenalInterestPerDayPercent: string;
    IsInsuranceRequired: string;
    AvailableTenures: string[];
    LTVPercent: string;
    IsActive: string;
}

const initialValues: FormValues = {
    Name: "",
    Code: "",
    F_LoanType: "",
    F_EMIFrequency: "",
    F_InterestType: "",
    F_InterestCalculationBasis: "",
    InterestRate: "",
    IsInterestRateChange: "",
    MinLoanAmount: "",
    MaxLoanAmount: "",
    MinTenureMonths: "",
    MaxTenureMonths: "",
    ProcessingFeePercent: "",
    PrepaymentChargesPercent: "",
    PenalInterestPerDayPercent: "",
    IsInsuranceRequired: "false", // Static default as per request
    AvailableTenures: [],
    LTVPercent: "",
    IsActive: "true",
};

interface DropdownState {
    loanTypes: Array<{ Id?: number; Name?: string }>;
    emiFrequencies: Array<{ Id?: number; Name?: string }>;
    interestTypes: Array<{ Id?: number; Name?: string }>;
    interestCalcBasis: Array<{ Id?: number; Name?: string }>;
    allowInterestChangeOptions: Array<{ Id?: string | number; Name?: string }>;
    availableTenuresOptions: Array<{ Id?: number; Name?: string }>;
}

interface SchemeState {
    id: number;
    formData: Partial<FormValues>;
    isProgress?: boolean;
}

const LoanSchemeConfiguration = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const nameRef = useRef<HTMLInputElement | null>(null);

    const [schemeState, setSchemeState] = useState<SchemeState>({
        id: 0,
        formData: { ...initialValues },
        isProgress: false,
    });

    const [dropdowns, setDropdowns] = useState<DropdownState>({
        loanTypes: [],
        emiFrequencies: [],
        interestTypes: [],
        interestCalcBasis: [],
        allowInterestChangeOptions: [],
        availableTenuresOptions: []
    });

    const isEditMode = schemeState.id > 0;

    // Adjust endpoints to reflect your specific masters
    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = currentUser?.uid ?? currentUser?.id ?? "0";
    const userToken = "token"; // Get from your auth system
    
    const MASTER_URL = `${API_WEB_URLS.MASTER}/${userId}/${userToken}`;
    const API_URL_EDIT = `/api/V1/LoanSchemeMaster/${userId}/${userToken}`;
    const API_URL_SAVE = `/api/V1/LoanSchemeMaster/${userId}/${userToken}`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                Name: Yup.string().trim().required("Name is required"),
                Code: Yup.string().trim().required("Code is required"),
                F_LoanType: Yup.string().required("Loan Type is required"),
                F_EMIFrequency: Yup.string().required("EMI Frequency is required"),
                F_InterestType: Yup.string().required("Interest Type is required"),
                F_InterestCalculationBasis: Yup.string().required("Interest Calculation Basis is required"),
                InterestRate: Yup.number().typeError("Must be a number").required("Interest Rate is required"),
                MinLoanAmount: Yup.number().typeError("Must be a number").required("Min Loan Amount is required"),
                MaxLoanAmount: Yup.number().typeError("Must be a number").required("Max Loan Amount is required"),
                MinTenureMonths: Yup.number().typeError("Must be a number").required("Min Tenure is required"),
                MaxTenureMonths: Yup.number().typeError("Must be a number").required("Max Tenure is required"),
                ProcessingFeePercent: Yup.number().typeError("Must be a number").required("Processing Fee is required"),
                IsInsuranceRequired: Yup.string().required("Insurance Required flag is mandatory"),
            }),
        []
    );

    useEffect(() => {
        nameRef.current?.focus();
        // Fetch all dynamic dropdowns
        const storedUser = localStorage.getItem("user");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const userId = currentUser?.uid ?? currentUser?.id ?? "0";
        const userToken = "token"; // Get from your auth system
        
        Fn_FillListData(dispatch, setDropdowns, "loanTypes", `/api/V1/LoanTypeMaster/${userId}/${userToken}`);
        Fn_FillListData(dispatch, setDropdowns, "emiFrequencies", `/api/V1/EMIFrequencyMaster/${userId}/${userToken}`);
        Fn_FillListData(dispatch, setDropdowns, "interestTypes", `/api/V1/InterestTypeMaster/${userId}/${userToken}`);
        Fn_FillListData(dispatch, setDropdowns, "interestCalcBasis", `/api/V1/InterestCalcBasisMaster/${userId}/${userToken}`);
        Fn_FillListData(dispatch, setDropdowns, "allowInterestChangeOptions", `/api/V1/YesNoMaster/${userId}/${userToken}`);
        Fn_FillListData(dispatch, setDropdowns, "availableTenuresOptions", `/api/V1/TenureMaster/${userId}/${userToken}`);
    }, [dispatch]);

    useEffect(() => {
        const locationState = location.state as { Id?: number } | undefined;
        const recordId = locationState?.Id ?? 0;

        if (recordId > 0) {
            setSchemeState((prev) => ({
                ...prev,
                id: recordId,
            }));
            Fn_DisplayData(dispatch, setSchemeState, recordId, API_URL_EDIT);
        } else {
            setSchemeState((prev) => ({
                ...prev,
                id: 0,
                formData: { ...initialValues },
            }));
        }
    }, [dispatch, location.state, API_URL_EDIT]);

    const toStringOrEmpty = (value: unknown) => (value !== undefined && value !== null ? String(value) : "");

    const initialFormValues: FormValues = {
        ...initialValues,
        Name: toStringOrEmpty(schemeState.formData.Name),
        Code: toStringOrEmpty(schemeState.formData.Code),
        F_LoanType: toStringOrEmpty(schemeState.formData.F_LoanType),
        F_EMIFrequency: toStringOrEmpty(schemeState.formData.F_EMIFrequency),
        F_InterestType: toStringOrEmpty(schemeState.formData.F_InterestType),
        F_InterestCalculationBasis: toStringOrEmpty(schemeState.formData.F_InterestCalculationBasis),
        InterestRate: toStringOrEmpty(schemeState.formData.InterestRate),
        IsInterestRateChange: toStringOrEmpty(schemeState.formData.IsInterestRateChange),
        MinLoanAmount: toStringOrEmpty(schemeState.formData.MinLoanAmount),
        MaxLoanAmount: toStringOrEmpty(schemeState.formData.MaxLoanAmount),
        MinTenureMonths: toStringOrEmpty(schemeState.formData.MinTenureMonths),
        MaxTenureMonths: toStringOrEmpty(schemeState.formData.MaxTenureMonths),
        ProcessingFeePercent: toStringOrEmpty(schemeState.formData.ProcessingFeePercent),
        PrepaymentChargesPercent: toStringOrEmpty(schemeState.formData.PrepaymentChargesPercent),
        PenalInterestPerDayPercent: toStringOrEmpty(schemeState.formData.PenalInterestPerDayPercent),
        IsInsuranceRequired: toStringOrEmpty(schemeState.formData.IsInsuranceRequired) || "false",
        AvailableTenures: schemeState.formData.AvailableTenures || [],
        LTVPercent: toStringOrEmpty(schemeState.formData.LTVPercent),
        IsActive: toStringOrEmpty(schemeState.formData.IsActive) || "true",
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const formData = new FormData();

            formData.append("Id", String(schemeState.id ?? 0));
            Object.keys(values).forEach(key => {
                const val = values[key as keyof FormValues];
                if (Array.isArray(val)) {
                    formData.append(key, val.join(","));
                } else {
                    formData.append(key, String(val || ""));
                }
            });

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            const userId = currentUser?.uid ?? currentUser?.id ?? "0";

            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder callback
                { arguList: { id: schemeState.id, formData } },
                API_URL_SAVE,
                true,
                "memberid",
                navigate,
                "/loanSchemeConfig"
            );

        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Loan Scheme Configuration" parent="Customer & Loan" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Formik<FormValues>
                            initialValues={initialFormValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleChange, handleBlur, errors, touched, setFieldValue, isSubmitting }: FormikProps<FormValues>) => (
                                <Form className="theme-form" onKeyDown={handleEnterToNextField}>
                                    <Card>
                                        <CardBody>
                                            <Row className="gy-0">
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Name <span className="text-danger">*</span></Label>
                                                        <Input type="text" name="Name" placeholder="e.g. Monthly Personal Loan" value={values.Name} onChange={handleChange} onBlur={handleBlur} invalid={touched.Name && !!errors.Name} innerRef={nameRef} />
                                                        <ErrorMessage name="Name" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Code <span className="text-danger">*</span></Label>
                                                        <Input type="text" name="Code" placeholder="e.g. PLM-01" value={values.Code} onChange={handleChange} onBlur={handleBlur} invalid={touched.Code && !!errors.Code} />
                                                        <ErrorMessage name="Code" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Loan Type <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="F_LoanType" value={values.F_LoanType} onChange={handleChange} onBlur={handleBlur} invalid={touched.F_LoanType && !!errors.F_LoanType}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.loanTypes.length === 0 && <option value="1">Mock Personal Loan</option>}
                                                            {dropdowns.loanTypes.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="F_LoanType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>EMI Frequency <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="F_EMIFrequency" value={values.F_EMIFrequency} onChange={handleChange} onBlur={handleBlur} invalid={touched.F_EMIFrequency && !!errors.F_EMIFrequency}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.emiFrequencies.length === 0 && <option value="1">Monthly Mock</option>}
                                                            {dropdowns.emiFrequencies.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="F_EMIFrequency" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Interest Type <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="F_InterestType" value={values.F_InterestType} onChange={handleChange} onBlur={handleBlur} invalid={touched.F_InterestType && !!errors.F_InterestType}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.interestTypes.length === 0 && <option value="1">Mock Flat</option>}
                                                            {dropdowns.interestTypes.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="F_InterestType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Interest Calculation Basis <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="F_InterestCalculationBasis" value={values.F_InterestCalculationBasis} onChange={handleChange} onBlur={handleBlur} invalid={touched.F_InterestCalculationBasis && !!errors.F_InterestCalculationBasis}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.interestCalcBasis.length === 0 && <option value="1">Mock Monthly</option>}
                                                            {dropdowns.interestCalcBasis.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="F_InterestCalculationBasis" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Interest Rate (% per annum) <span className="text-danger">*</span></Label>
                                                        <Input type="number" name="InterestRate" value={values.InterestRate} onChange={handleChange} onBlur={handleBlur} invalid={touched.InterestRate && !!errors.InterestRate} />
                                                        <ErrorMessage name="InterestRate" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Allow Interest Rate Change Mid-Tenure?</Label>
                                                        <Input type="select" name="IsInterestRateChange" value={values.IsInterestRateChange} onChange={handleChange} onBlur={handleBlur} invalid={touched.IsInterestRateChange && !!errors.IsInterestRateChange}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.allowInterestChangeOptions.length === 0 && <option value="false">No</option>}
                                                            {dropdowns.allowInterestChangeOptions.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="IsInterestRateChange" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Min Loan Amount (₹) <span className="text-danger">*</span></Label>
                                                        <Input type="number" name="MinLoanAmount" value={values.MinLoanAmount} onChange={handleChange} onBlur={handleBlur} invalid={touched.MinLoanAmount && !!errors.MinLoanAmount} />
                                                        <ErrorMessage name="MinLoanAmount" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Max Loan Amount (₹) <span className="text-danger">*</span></Label>
                                                        <Input type="number" name="MaxLoanAmount" value={values.MaxLoanAmount} onChange={handleChange} onBlur={handleBlur} invalid={touched.MaxLoanAmount && !!errors.MaxLoanAmount} />
                                                        <ErrorMessage name="MaxLoanAmount" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Min Tenure (Months) <span className="text-danger">*</span></Label>
                                                        <Input type="number" name="MinTenureMonths" value={values.MinTenureMonths} onChange={handleChange} onBlur={handleBlur} invalid={touched.MinTenureMonths && !!errors.MinTenureMonths} />
                                                        <ErrorMessage name="MinTenureMonths" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Max Tenure (Months) <span className="text-danger">*</span></Label>
                                                        <Input type="number" name="MaxTenureMonths" value={values.MaxTenureMonths} onChange={handleChange} onBlur={handleBlur} invalid={touched.MaxTenureMonths && !!errors.MaxTenureMonths} />
                                                        <ErrorMessage name="MaxTenureMonths" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Processing Fee (%) <span className="text-danger">*</span></Label>
                                                        <Input type="number" name="ProcessingFeePercent" value={values.ProcessingFeePercent} onChange={handleChange} onBlur={handleBlur} invalid={touched.ProcessingFeePercent && !!errors.ProcessingFeePercent} />
                                                        <ErrorMessage name="ProcessingFeePercent" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Prepayment Charges (%)</Label>
                                                        <Input type="number" name="PrepaymentChargesPercent" value={values.PrepaymentChargesPercent} onChange={handleChange} onBlur={handleBlur} invalid={touched.PrepaymentChargesPercent && !!errors.PrepaymentChargesPercent} />
                                                        <ErrorMessage name="PrepaymentChargesPercent" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Penal Interest (% per day on overdue)</Label>
                                                        <Input type="number" name="PenalInterestPerDayPercent" value={values.PenalInterestPerDayPercent} onChange={handleChange} onBlur={handleBlur} invalid={touched.PenalInterestPerDayPercent && !!errors.PenalInterestPerDayPercent} />
                                                        <ErrorMessage name="PenalInterestPerDayPercent" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Insurance Required? <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="IsInsuranceRequired" value={values.IsInsuranceRequired} onChange={handleChange} onBlur={handleBlur} invalid={touched.IsInsuranceRequired && !!errors.IsInsuranceRequired}>
                                                            <option value="true">Yes</option>
                                                            <option value="false">No</option>
                                                        </Input>
                                                        <ErrorMessage name="IsInsuranceRequired" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Available Tenures (Multi-select)</Label>
                                                        <Input
                                                            type="select"
                                                            multiple
                                                            name="AvailableTenures"
                                                            value={values.AvailableTenures}
                                                            onChange={(e) => {
                                                                const target = e.target as unknown as HTMLSelectElement;
                                                                const selectedOptions = Array.from(target.selectedOptions).map(option => option.value);
                                                                setFieldValue("AvailableTenures", selectedOptions);
                                                            }}
                                                            onBlur={handleBlur}
                                                            invalid={touched.AvailableTenures && !!errors.AvailableTenures}
                                                        >
                                                            {dropdowns.availableTenuresOptions.length === 0 && (
                                                                <>
                                                                    <option value="6">6 months</option>
                                                                    <option value="12">12 months</option>
                                                                    <option value="18">18 months</option>
                                                                    <option value="24">24 months</option>
                                                                </>
                                                            )}
                                                            {dropdowns.availableTenuresOptions.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="AvailableTenures" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>LTV % (For Gold Loan only)</Label>
                                                        <Input type="number" name="LTVPercent" value={values.LTVPercent} onChange={handleChange} onBlur={handleBlur} invalid={touched.LTVPercent && !!errors.LTVPercent} />
                                                        <ErrorMessage name="LTVPercent" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Active Status</Label>
                                                        <Input type="select" name="IsActive" value={values.IsActive} onChange={handleChange} onBlur={handleBlur}>
                                                            <option value="true">Active</option>
                                                            <option value="false">Inactive</option>
                                                        </Input>
                                                        <ErrorMessage name="IsActive" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                            </Row>
                                        </CardBody>
                                        <CardFooter className="d-flex align-items-center gap-2">
                                            <Btn color="primary" type="button" className="px-4">
                                                <i className="fa fa-calculator me-1"></i> Preview EMI
                                            </Btn>
                                            <Btn color="secondary" type="button" outline className="px-3">
                                                <i className="fa fa-copy me-1"></i> Clone Scheme
                                            </Btn>
                                            <Btn color="success" type="submit" disabled={isSubmitting} className="px-4">
                                                <i className="fa fa-check me-1"></i> {isEditMode ? "Update Scheme" : "Activate Scheme"}
                                            </Btn>
                                            <Btn color="danger" type="button" className="px-4">
                                                <i className="fa fa-minus-circle me-1"></i> Deactivate
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

export default LoanSchemeConfiguration;
