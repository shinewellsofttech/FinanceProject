import React, { useState } from "react";
import { Alert, Card, CardBody, Col, Container, FormGroup, Input, Label, Row, Table } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";

type EMIStatus = "PENDING" | "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "WAIVED";

interface EMIScheduleRow {
    emiNo: number;
    dueDate: string;
    principal: number;
    interest: number;
    totalEmi: number;
    outstanding: number;
    status: EMIStatus;
    paidDate: string | null;
}

const sampleSchedule: EMIScheduleRow[] = [
    { emiNo: 1, dueDate: "01-Mar-2024", principal: 4200, interest: 1000, totalEmi: 5200, outstanding: 95800, status: "PAID", paidDate: "01-Mar-2024" },
    { emiNo: 2, dueDate: "01-Apr-2024", principal: 4250, interest: 950, totalEmi: 5200, outstanding: 91550, status: "PAID", paidDate: "30-Mar-2024" },
    { emiNo: 3, dueDate: "01-May-2024", principal: 4300, interest: 900, totalEmi: 5200, outstanding: 87250, status: "PENDING", paidDate: null },
    { emiNo: 4, dueDate: "01-Jun-2024", principal: 4350, interest: 850, totalEmi: 5200, outstanding: 82900, status: "PENDING", paidDate: null },
    { emiNo: 5, dueDate: "01-Jul-2024", principal: 4400, interest: 800, totalEmi: 5200, outstanding: 78500, status: "PENDING", paidDate: null },
];

const formatCurrency = (n: number) => n.toLocaleString("en-IN");

const statusBadgeClass = (status: EMIStatus): string => {
    switch (status) {
        case "PAID":
            return "bg-success";
        case "PENDING":
            return "bg-warning text-dark";
        case "PARTIALLY_PAID":
            return "bg-info";
        case "OVERDUE":
            return "bg-danger";
        case "WAIVED":
            return "bg-secondary";
        default:
            return "bg-light text-dark";
    }
};

const EMISchedule = () => {
    const [loanAccountNumber, setLoanAccountNumber] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [schedule, setSchedule] = useState<EMIScheduleRow[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        if (!loanAccountNumber.trim()) return;
        setLoading(true);
        // TODO: Replace with Fn_FillListData or API to fetch EMI schedule by loan account
        setTimeout(() => {
            setCustomerName("Auto-filled");
            setSchedule(sampleSchedule);
            setLoading(false);
        }, 300);
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="EMI Schedule" parent="Operations" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Card>
                            <CardBody>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <i className="fa fa-calendar-check-o text-success" style={{ fontSize: "1.25rem" }} aria-hidden="true" />
                                    <h5 className="card-title mb-0 text-success fw-bold">Form 1: EMI Schedule (Auto-Generated)</h5>
                                </div>
                                <p className="text-muted small mb-2">
                                    System → Auto-Generated after Sanction | Table: tbl_emi_schedule | Read-only view for users
                                </p>

                                <Alert color="warning" className="d-flex align-items-start gap-2 py-2 mb-3" style={{ backgroundColor: "#fff3cd" }}>
                                    <i className="fa fa-wrench mt-1 text-warning" aria-hidden="true" />
                                    <div className="small">
                                        <strong>Dev Note:</strong> EMI schedule is system-generated — users don&apos;t fill this form, they VIEW it.
                                        Generated when loan status moves to SANCTIONED.
                                        Table: tbl_emi_schedule(loan_id, emi_no, due_date, principal, interest, total_emi, balance_outstanding, status, paid_date, paid_amount).
                                        Status values: PENDING / PAID / PARTIALLY_PAID / OVERDUE / WAIVED.
                                        Re-generate schedule if prepayment or interest rate change occurs.
                                    </div>
                                </Alert>

                                <Row className="mb-4">
                                    <Col md="6">
                                        <FormGroup>
                                            <Label>Loan Account Number <span className="text-danger">*</span></Label>
                                            <div className="d-flex gap-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Search loan account"
                                                    value={loanAccountNumber}
                                                    onChange={(e) => setLoanAccountNumber(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                                />
                                                <Btn color="primary" onClick={handleSearch} disabled={loading}>
                                                    {loading ? "..." : "View"}
                                                </Btn>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label>Customer Name (Auto-filled)</Label>
                                            <Input
                                                type="text"
                                                value={customerName}
                                                readOnly
                                                disabled
                                                className="bg-light"
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                {schedule.length > 0 && (
                                    <>
                                        <div className="table-responsive">
                                            <Table bordered hover striped className="mb-0">
                                                <thead style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                                    <tr>
                                                        <th className="border-0">EMI #</th>
                                                        <th className="border-0">Due Date</th>
                                                        <th className="border-0 text-end">Principal (₹)</th>
                                                        <th className="border-0 text-end">Interest (₹)</th>
                                                        <th className="border-0 text-end">Total EMI (₹)</th>
                                                        <th className="border-0 text-end">Outstanding (₹)</th>
                                                        <th className="border-0 text-center">Status</th>
                                                        <th className="border-0">Paid Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {schedule.map((row) => (
                                                        <tr key={row.emiNo}>
                                                            <td>{row.emiNo}</td>
                                                            <td>{row.dueDate}</td>
                                                            <td className="text-end">{formatCurrency(row.principal)}</td>
                                                            <td className="text-end">{formatCurrency(row.interest)}</td>
                                                            <td className="text-end">{formatCurrency(row.totalEmi)}</td>
                                                            <td className="text-end">{formatCurrency(row.outstanding)}</td>
                                                            <td className="text-center">
                                                                <span className={`badge ${statusBadgeClass(row.status)}`}>
                                                                    {row.status}
                                                                </span>
                                                            </td>
                                                            <td>{row.paidDate ?? "—"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
                                            <Btn color="primary" type="button" className="text-white">
                                                <i className="fa fa-print me-1" aria-hidden="true" /> Print EMI Schedule
                                            </Btn>
                                            <Btn color="info" type="button" className="text-white">
                                                <i className="fa fa-file-pdf-o me-1" aria-hidden="true" /> Export to PDF / Excel
                                            </Btn>
                                        </div>
                                    </>
                                )}

                                {schedule.length === 0 && loanAccountNumber && !loading && (
                                    <p className="text-muted mb-0">No EMI schedule found for this loan account.</p>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EMISchedule;
