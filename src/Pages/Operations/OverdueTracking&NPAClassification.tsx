import React, { useState } from "react";
import { Alert, Card, CardBody, Col, Container, FormGroup, Input, Label, Row, Table } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";

interface NPARuleRow {
    dpdRange: string;
    classification: string;
    classificationClass: string;
    provisioningPercent: string;
    actionRequired: string;
}

const NPA_RULES: NPARuleRow[] = [
    { dpdRange: "0 days", classification: "Standard Asset", classificationClass: "text-success", provisioningPercent: "0.25%", actionRequired: "No action needed" },
    { dpdRange: "1 - 30 days", classification: "Regular", classificationClass: "text-success", provisioningPercent: "0.25%", actionRequired: "SMS reminder to customer" },
    { dpdRange: "31 - 60 days", classification: "SMA-1", classificationClass: "text-warning", provisioningPercent: "0.25%", actionRequired: "Field visit + escalation to BM" },
    { dpdRange: "61 - 90 days", classification: "SMA-2", classificationClass: "text-warning", provisioningPercent: "0.25%", actionRequired: "Legal notice + recovery planning" },
    { dpdRange: "> 90 days", classification: "NPA", classificationClass: "text-danger", provisioningPercent: "10% - 100%", actionRequired: "NPA provisioning + recovery action" },
    { dpdRange: "> 90 days (Sub-standard)", classification: "Sub-Standard", classificationClass: "text-danger", provisioningPercent: "10%", actionRequired: "Loan tagged NPA in all reports" },
    { dpdRange: "> 12 months NPA", classification: "Doubtful", classificationClass: "text-danger", provisioningPercent: "25% - 100%", actionRequired: "Legal recovery proceedings" },
];

const OverdueTrackingNPAClassification = () => {
    const [branch, setBranch] = useState("all");
    const [dpdCategory, setDpdCategory] = useState("all");
    const [loanScheme, setLoanScheme] = useState("all");
    const [asOnDate, setAsOnDate] = useState("");
    const [overdueAmountRange, setOverdueAmountRange] = useState("");
    const [fieldOfficer, setFieldOfficer] = useState("all");

    const [monthPeriod, setMonthPeriod] = useState("");
    const [assetCategory, setAssetCategory] = useState("standard");
    const [portfolioOutstanding, setPortfolioOutstanding] = useState("");
    const [provisionAmount, setProvisionAmount] = useState("");

    return (                                                                                            
        <div className="page-body">
            <Breadcrumbs mainTitle="Overdue Tracking & NPA Classification" parent="Operations" />
            <Container fluid>
                <Row>
                    <Col xs="12">

                    
                        {/* NPA Classification Rules */}
                        <Alert color="warning" className="d-flex align-items-start gap-2 py-2 mb-2" style={{ backgroundColor: "#fff3cd" }}>
                            <i className="fa fa-wrench mt-1 text-warning" aria-hidden="true" />
                            <div className="small">
                                <strong>Dev Note:</strong> NPA classification runs as a daily scheduled job.
                                DPD (Days Past Due) = Today - EMI Due Date (for unpaid EMIs); updates tbl_loan_accounts.npa_status and tbl_loan_accounts.dpd daily.
                                Penal interest auto-accrues: Penal_Amount = Outstanding × Penal_Rate% / 365 × DPD.
                                Provisioning percentages are regulatory — store in config table.
                            </div>
                        </Alert>

                        <Card className="mb-4">
                            <CardBody>
                                <h6 className="mb-3 text-primary">
                                    <i className="fa fa-list-alt me-2" aria-hidden="true" /> NPA Classification Rules
                                </h6>
                                <div className="table-responsive">
                                    <Table bordered hover size="sm">
                                        <thead style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                            <tr>
                                                <th className="border-0">DPD Range</th>
                                                <th className="border-0">Classification</th>
                                                <th className="border-0">Provisioning %</th>
                                                <th className="border-0">Action Required</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {NPA_RULES.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>{row.dpdRange}</td>
                                                    <td><span className={row.classificationClass + " fw-semibold"}>{row.classification}</span></td>
                                                    <td>{row.provisioningPercent}</td>
                                                    <td>{row.actionRequired}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Overdue Search / Dashboard Filter */}
                        <Card className="mb-4">
                            <CardBody>
                                <h6 className="mb-3 text-primary">
                                    <i className="fa fa-search me-2" aria-hidden="true" /> Overdue Search / Dashboard Filter
                                </h6>
                                <Row>
                                    <Col md="4">
                                        <FormGroup className="mb-2">
                                            <Label>Branch <span className="text-danger">*</span></Label>
                                            <Input type="select" value={branch} onChange={(e) => setBranch(e.target.value)}>
                                                <option value="all">All Branches</option>
                                                <option value="1">Branch 1</option>
                                                <option value="2">Branch 2</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup className="mb-2">
                                            <Label>DPD Category</Label>
                                            <Input type="select" value={dpdCategory} onChange={(e) => setDpdCategory(e.target.value)}>
                                                <option value="all">All</option>
                                                <option value="regular">Regular</option>
                                                <option value="sma1">SMA-1</option>
                                                <option value="sma2">SMA-2</option>
                                                <option value="npa">NPA</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup className="mb-2">
                                            <Label>Loan Scheme</Label>
                                            <Input type="select" value={loanScheme} onChange={(e) => setLoanScheme(e.target.value)}>
                                                <option value="all">All Schemes</option>
                                                <option value="1">Personal Loan</option>
                                                <option value="2">Gold Loan</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup className="mb-2">
                                            <Label>As on Date <span className="text-danger">*</span></Label>
                                            <Input type="date" value={asOnDate} onChange={(e) => setAsOnDate(e.target.value)} placeholder="dd-mm-yyyy" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup className="mb-2">
                                            <Label>Overdue Amount Range (₹)</Label>
                                            <Input type="text" value={overdueAmountRange} onChange={(e) => setOverdueAmountRange(e.target.value)} placeholder="e.g. 5000 - 50000" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup className="mb-2">
                                            <Label>Field Officer</Label>
                                            <Input type="select" value={fieldOfficer} onChange={(e) => setFieldOfficer(e.target.value)}>
                                                <option value="all">All</option>
                                                <option value="1">Officer 1</option>
                                                <option value="2">Officer 2</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    <Btn color="primary" type="button" className="text-white">
                                        <i className="fa fa-search me-1" aria-hidden="true" /> Search Overdue Accounts
                                    </Btn>
                                    <Btn color="primary" type="button" className="text-white">
                                        <i className="fa fa-file-excel-o me-1" aria-hidden="true" /> Export to Excel
                                    </Btn>
                                    <Btn color="warning" type="button" className="text-dark">
                                        <i className="fa fa-send me-1" aria-hidden="true" /> Send Bulk SMS Reminder
                                    </Btn>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Provisioning Entry (Accountant) */}
                        <Alert color="warning" className="d-flex align-items-start gap-2 py-2 mb-2" style={{ backgroundColor: "#fff3cd" }}>
                            <i className="fa fa-wrench mt-1 text-warning" aria-hidden="true" />
                            <div className="small">
                                <strong>Dev Note:</strong> Provisioning entries are monthly Journal Entries in GL.
                                Formula: Provision Amount = Outstanding × Provision Rate%.
                                GL Entry: Provision for Bad Debts A/c Dr — NPA Provision Reserve A/c Cr.
                                This is separate from NPA classification — classification is auto-daily; provisioning is monthly manual/auto entry with checker approval.
                            </div>
                        </Alert>

                        <Card>
                            <CardBody>
                                <h6 className="mb-3 text-primary">
                                    <i className="fa fa-calculator me-2" aria-hidden="true" /> Provisioning Entry (Accountant)
                                </h6>
                                <Row>
                                    <Col md="6">
                                        <FormGroup className="mb-2">
                                            <Label>Month / Period <span className="text-danger">*</span></Label>
                                            <Input type="month" value={monthPeriod} onChange={(e) => setMonthPeriod(e.target.value)} />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup className="mb-2">
                                            <Label>Asset Category <span className="text-danger">*</span></Label>
                                            <Input type="select" value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)}>
                                                <option value="standard">Standard Asset (0.25%)</option>
                                                <option value="substandard">Sub-Standard (10%)</option>
                                                <option value="doubtful">Doubtful (25% - 100%)</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup className="mb-2">
                                            <Label>Portfolio Outstanding (₹) — Auto</Label>
                                            <Input type="text" value={portfolioOutstanding} readOnly className="bg-light" placeholder="Sum of outstanding in category" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup className="mb-2">
                                            <Label>Provision Amount (₹) — Auto</Label>
                                            <Input type="text" value={provisionAmount} readOnly className="bg-light" placeholder="Outstanding x Rate%" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Alert color="success" className="py-2 mb-3 small" style={{ backgroundColor: "#d4edda" }}>
                                    <strong>Provisioning GL Entry (Monthly):</strong><br />
                                    Provision for Bad Debts A/c Dr ₹ [Amount]<br />
                                    To NPA Provision Reserve A/c Cr ₹ [Amount]
                                </Alert>
                                <div className="d-flex flex-wrap gap-2">
                                    <Btn color="primary" type="button" className="text-white">
                                        <i className="fa fa-save me-1" aria-hidden="true" /> Save Provision Entry
                                    </Btn>
                                    <Btn color="primary" type="button" className="text-white">
                                        <i className="fa fa-file-text-o me-1" aria-hidden="true" /> View Provision Report
                                    </Btn>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default OverdueTrackingNPAClassification;
