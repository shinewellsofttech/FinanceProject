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
    SchemeName: string;
    SchemeCode: string;
    LoanType: string;
    EMIFrequency: string;
    InterestType: string;
    InterestCalculationBasis: string;
    InterestRate: string;
    AllowInterestRateChange: string;
    MinLoanAmount: string;
    MaxLoanAmount: string;
    MinTenure: string;
    MaxTenure: string;
    ProcessingFee: string;
    PrepaymentCharges: string;
    PenalInterest: string;
    InsuranceRequired: string;
    AvailableTenures: string[];
    LTV: string;
}

const initialValues: FormValues = {
    SchemeName: "",
    SchemeCode: "",
    LoanType: "",
    EMIFrequency: "",
    InterestType: "",
    InterestCalculationBasis: "",
    InterestRate: "",
    AllowInterestRateChange: "",
    MinLoanAmount: "",
    MaxLoanAmount: "",
    MinTenure: "",
    MaxTenure: "",
    ProcessingFee: "",
    PrepaymentCharges: "",
    PenalInterest: "",
    InsuranceRequired: "No", // Static default as per request
    AvailableTenures: [],
    LTV: "",
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
    const MASTER_URL = `${API_WEB_URLS.MASTER}/0/token`;
    const API_URL_EDIT = `${MASTER_URL}/LoanSchemeMaster/Id`;
    const API_URL_SAVE = `LoanSchemeMaster/0/token`;

    const validationSchema = useMemo(
        () =>
            Yup.object({
                SchemeName: Yup.string().trim().required("Scheme Name is required"),
                SchemeCode: Yup.string().trim().required("Scheme Code is required"),
                LoanType: Yup.string().required("Loan Type is required"),
                EMIFrequency: Yup.string().required("EMI Frequency is required"),
                InterestType: Yup.string().required("Interest Type is required"),
                InterestCalculationBasis: Yup.string().required("Interest Calculation Basis is required"),
                InterestRate: Yup.number().typeError("Must be a number").required("Interest Rate is required"),
                MinLoanAmount: Yup.number().typeError("Must be a number").required("Min Loan Amount is required"),
                MaxLoanAmount: Yup.number().typeError("Must be a number").required("Max Loan Amount is required"),
                MinTenure: Yup.number().typeError("Must be a number").required("Min Tenure is required"),
                MaxTenure: Yup.number().typeError("Must be a number").required("Max Tenure is required"),
                ProcessingFee: Yup.number().typeError("Must be a number").required("Processing Fee is required"),
                InsuranceRequired: Yup.string().required("Insurance Required flag is mandatory"),
            }),
        []
    );

    useEffect(() => {
        nameRef.current?.focus();
        // Fetch all dynamic dropdowns
        Fn_FillListData(dispatch, setDropdowns, "loanTypes", `${MASTER_URL}/LoanTypeMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "emiFrequencies", `${MASTER_URL}/EMIFrequencyMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "interestTypes", `${MASTER_URL}/InterestTypeMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "interestCalcBasis", `${MASTER_URL}/InterestCalcBasisMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "allowInterestChangeOptions", `${MASTER_URL}/YesNoMaster/Id/0`);
        Fn_FillListData(dispatch, setDropdowns, "availableTenuresOptions", `${MASTER_URL}/TenureMaster/Id/0`);
    }, [dispatch, MASTER_URL]);

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
        SchemeName: toStringOrEmpty(schemeState.formData.SchemeName),
        SchemeCode: toStringOrEmpty(schemeState.formData.SchemeCode),
        LoanType: toStringOrEmpty(schemeState.formData.LoanType),
        EMIFrequency: toStringOrEmpty(schemeState.formData.EMIFrequency),
        InterestType: toStringOrEmpty(schemeState.formData.InterestType),
        InterestCalculationBasis: toStringOrEmpty(schemeState.formData.InterestCalculationBasis),
        InterestRate: toStringOrEmpty(schemeState.formData.InterestRate),
        AllowInterestRateChange: toStringOrEmpty(schemeState.formData.AllowInterestRateChange),
        MinLoanAmount: toStringOrEmpty(schemeState.formData.MinLoanAmount),
        MaxLoanAmount: toStringOrEmpty(schemeState.formData.MaxLoanAmount),
        MinTenure: toStringOrEmpty(schemeState.formData.MinTenure),
        MaxTenure: toStringOrEmpty(schemeState.formData.MaxTenure),
        ProcessingFee: toStringOrEmpty(schemeState.formData.ProcessingFee),
        PrepaymentCharges: toStringOrEmpty(schemeState.formData.PrepaymentCharges),
        PenalInterest: toStringOrEmpty(schemeState.formData.PenalInterest),
        InsuranceRequired: toStringOrEmpty(schemeState.formData.InsuranceRequired) || "No",
        AvailableTenures: schemeState.formData.AvailableTenures || [],
        LTV: toStringOrEmpty(schemeState.formData.LTV),
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
            formData.append("UserId", currentUser?.uid ?? currentUser?.id ?? "0");

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
                                                        <Label>Scheme Name <span className="text-danger">*</span></Label>
                                                        <Input type="text" name="SchemeName" placeholder="e.g. Monthly Personal Loan" value={values.SchemeName} onChange={handleChange} onBlur={handleBlur} invalid={touched.SchemeName && !!errors.SchemeName} innerRef={nameRef} />
                                                        <ErrorMessage name="SchemeName" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Scheme Code <span className="text-danger">*</span></Label>
                                                        <Input type="text" name="SchemeCode" placeholder="e.g. PLM-01" value={values.SchemeCode} onChange={handleChange} onBlur={handleBlur} invalid={touched.SchemeCode && !!errors.SchemeCode} />
                                                        <ErrorMessage name="SchemeCode" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Loan Type <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="LoanType" value={values.LoanType} onChange={handleChange} onBlur={handleBlur} invalid={touched.LoanType && !!errors.LoanType}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.loanTypes.length === 0 && <option value="1">Mock Personal Loan</option>}
                                                            {dropdowns.loanTypes.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="LoanType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>EMI Frequency <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="EMIFrequency" value={values.EMIFrequency} onChange={handleChange} onBlur={handleBlur} invalid={touched.EMIFrequency && !!errors.EMIFrequency}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.emiFrequencies.length === 0 && <option value="1">Monthly Mock</option>}
                                                            {dropdowns.emiFrequencies.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="EMIFrequency" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Interest Type <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="InterestType" value={values.InterestType} onChange={handleChange} onBlur={handleBlur} invalid={touched.InterestType && !!errors.InterestType}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.interestTypes.length === 0 && <option value="1">Mock Flat</option>}
                                                            {dropdowns.interestTypes.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="InterestType" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Interest Calculation Basis <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="InterestCalculationBasis" value={values.InterestCalculationBasis} onChange={handleChange} onBlur={handleBlur} invalid={touched.InterestCalculationBasis && !!errors.InterestCalculationBasis}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.interestCalcBasis.length === 0 && <option value="1">Mock Monthly</option>}
                                                            {dropdowns.interestCalcBasis.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="InterestCalculationBasis" component="div" className="text-danger small mt-1" />
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
                                                        <Input type="select" name="AllowInterestRateChange" value={values.AllowInterestRateChange} onChange={handleChange} onBlur={handleBlur} invalid={touched.AllowInterestRateChange && !!errors.AllowInterestRateChange}>
                                                            <option value="">-- Select --</option>
                                                            {dropdowns.allowInterestChangeOptions.length === 0 && <option value="No">No</option>}
                                                            {dropdowns.allowInterestChangeOptions.map(opt => (
                                                                <option key={opt.Id} value={String(opt.Id)}>{opt.Name}</option>
                                                            ))}
                                                        </Input>
                                                        <ErrorMessage name="AllowInterestRateChange" component="div" className="text-danger small mt-1" />
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
                                                        <Input type="number" name="MinTenure" value={values.MinTenure} onChange={handleChange} onBlur={handleBlur} invalid={touched.MinTenure && !!errors.MinTenure} />
                                                        <ErrorMessage name="MinTenure" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Max Tenure (Months) <span className="text-danger">*</span></Label>
                                                        <Input type="number" name="MaxTenure" value={values.MaxTenure} onChange={handleChange} onBlur={handleBlur} invalid={touched.MaxTenure && !!errors.MaxTenure} />
                                                        <ErrorMessage name="MaxTenure" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Processing Fee (%) <span className="text-danger">*</span></Label>
                                                        <Input type="number" name="ProcessingFee" value={values.ProcessingFee} onChange={handleChange} onBlur={handleBlur} invalid={touched.ProcessingFee && !!errors.ProcessingFee} />
                                                        <ErrorMessage name="ProcessingFee" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Prepayment Charges (%)</Label>
                                                        <Input type="number" name="PrepaymentCharges" value={values.PrepaymentCharges} onChange={handleChange} onBlur={handleBlur} invalid={touched.PrepaymentCharges && !!errors.PrepaymentCharges} />
                                                        <ErrorMessage name="PrepaymentCharges" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Penal Interest (% per day on overdue)</Label>
                                                        <Input type="number" name="PenalInterest" value={values.PenalInterest} onChange={handleChange} onBlur={handleBlur} invalid={touched.PenalInterest && !!errors.PenalInterest} />
                                                        <ErrorMessage name="PenalInterest" component="div" className="text-danger small mt-1" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup className="mb-0">
                                                        <Label>Insurance Required? <span className="text-danger">*</span></Label>
                                                        <Input type="select" name="InsuranceRequired" value={values.InsuranceRequired} onChange={handleChange} onBlur={handleBlur} invalid={touched.InsuranceRequired && !!errors.InsuranceRequired}>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </Input>
                                                        <ErrorMessage name="InsuranceRequired" component="div" className="text-danger small mt-1" />
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
                                                        <Input type="number" name="LTV" value={values.LTV} onChange={handleChange} onBlur={handleBlur} invalid={touched.LTV && !!errors.LTV} />
                                                        <ErrorMessage name="LTV" component="div" className="text-danger small mt-1" />
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
