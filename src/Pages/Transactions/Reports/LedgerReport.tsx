import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Card,
  CardBody,
  CardFooter,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
} from "reactstrap";
import { Btn } from "../../../AbstractElements";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import DateInput from "../../../CommonElements/DateInput/DateInput";
import { Fn_FillListData, Fn_GetReport } from "../../../store/Functions";
import { API_WEB_URLS } from "../../../constants/constAPI";

const LEDGER_MASTER_API = `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.LedgerMaster}/Id/0`;

interface LedgerOption {
  Id?: number;
  Name?: string;
}

interface ReportState {
  reportData: any[];
  isProgress: boolean;
}

interface DropdownState {
  ledgerMasters: LedgerOption[];
}

const LedgerReport = () => {
  const dispatch = useDispatch();

  const [fromDate, setFromDate] = useState<string>("2025-04-01");
  const [toDate, setToDate] = useState<string>("2026-03-31");
  const [selectedLedger, setSelectedLedger] = useState<string>("");
  const [showDetailedReport, setShowDetailedReport] = useState<boolean>(false);

  const [reportState, setReportState] = useState<ReportState>({
    reportData: [],
    isProgress: false,
  });

  const [dropdowns, setDropdowns] = useState<DropdownState>({
    ledgerMasters: [],
  });

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const loggedUserId = String(currentUser?.uid ?? currentUser?.id ?? "0");

  useEffect(() => {
    Fn_FillListData(dispatch, setDropdowns, "ledgerMasters", LEDGER_MASTER_API).catch(
      (err) => console.error("Failed to fetch ledger masters:", err)
    );
  }, [dispatch]);

  const handleGetReport = useCallback(async () => {
    setReportState((prev) => ({ ...prev, isProgress: true, reportData: [] }));

    try {
      const fd = new FormData();
      fd.append("FromDate", fromDate);
      fd.append("ToDate", toDate);
      fd.append("F_LedgerMaster", String(Number(selectedLedger) || 0));
      fd.append("F_BranchOffice", String(Number(localStorage.getItem("F_BranchOffice")) || 0));
      fd.append("ShowDetailedReport", String(showDetailedReport));

      await Fn_GetReport(
        dispatch,
        setReportState,
        "reportData",
        `LedgerReport/${loggedUserId}/token`,
        { arguList: { id: 0, formData: fd } },
        true
      );
    } catch (error) {
      console.error("Failed to fetch report:", error);
      setReportState((prev) => ({ ...prev, isProgress: false }));
    }
  }, [dispatch, fromDate, toDate, selectedLedger, showDetailedReport, loggedUserId]);

  const reportData = useMemo(() => {
    return Array.isArray(reportState.reportData) ? reportState.reportData : [];
  }, [reportState.reportData]);

  const formatDate = (val: string | null | undefined) => {
    if (!val) return "-";
    try {
      return new Date(val).toLocaleDateString("en-IN");
    } catch {
      return val;
    }
  };

  // Group rows by "Ledger Name"
  const groupedData = useMemo(() => {
    const groups: Record<string, any[]> = {};
    reportData.forEach((row) => {
      const ledger = row["Ledger Name"] ?? "Unknown";
      if (!groups[ledger]) groups[ledger] = [];
      groups[ledger].push(row);
    });
    return groups;
  }, [reportData]);

  return (
    <div className="page-body">
      <Breadcrumbs mainTitle="Ledger Report" parent="Reporting" />
      <Container fluid>
        <Row>
          <Col xs="12">
            <Card>
              <CardHeaderCommon title="Ledger Report" tagClass="card-title mb-0" />
              <CardBody>
                <Row className="mb-3 gy-3">
                  <Col md="3">
                    <FormGroup className="mb-0">
                      <Label>From Date</Label>
                      <DateInput
                        name="FromDate"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup className="mb-0">
                      <Label>To Date</Label>
                      <DateInput
                        name="ToDate"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup className="mb-0">
                      <Label>Ledger Master</Label>
                      <Input
                        type="select"
                        name="F_LedgerMaster"
                        value={selectedLedger}
                        onChange={(e) => setSelectedLedger(e.target.value)}
                      >
                        <option value="">-- Select Ledger --</option>
                        {dropdowns.ledgerMasters.map((opt) => (
                          <option key={opt?.Id} value={opt?.Id ?? ""}>
                            {opt?.Name ?? `Ledger ${opt?.Id ?? ""}`}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="3" className="d-flex align-items-end">
                    <FormGroup check className="mb-0">
                      <Input
                        type="checkbox"
                        id="showDetailedReport"
                        checked={showDetailedReport}
                        onChange={(e) => setShowDetailedReport(e.target.checked)}
                      />
                      <Label check htmlFor="showDetailedReport" className="ms-1">
                        Show Detailed Report
                      </Label>
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter className="d-flex align-items-center gap-2">
                <Btn
                  color="primary"
                  onClick={handleGetReport}
                  disabled={reportState.isProgress}
                >
                  <i className="fa fa-search me-1"></i> Get Report
                </Btn>
              </CardFooter>
            </Card>

            {/* Report Result */}
            {(reportState.isProgress || reportData.length > 0) && (
              <Card className="mt-3">
                <CardHeaderCommon title="Ledger Report Result" tagClass="card-title mb-0" />
                <CardBody>
                  {reportState.isProgress ? (
                    <div className="text-center py-5">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : reportData.length === 0 ? (
                    <p className="text-center py-4 mb-0">No records found.</p>
                  ) : showDetailedReport ? (
                    /* ── Detailed View ── */
                    <div className="table-responsive">
                      {Object.entries(groupedData).map(([ledgerName, rows]) => {
                        const first = rows[0];
                        return (
                          <div key={ledgerName} className="mb-4">
                            <div className="bg-light border px-3 py-2 mb-0 rounded-top">
                              <strong>{ledgerName}</strong>
                              {first?.["Group"] && (
                                <span className="text-muted ms-2">({first["Group"]})</span>
                              )}
                              {first?.["Branch"] && (
                                <span className="text-muted ms-3 small">{first["Branch"]}</span>
                              )}
                            </div>
                            <Table bordered hover striped className="mb-0">
                              <thead className="table-primary">
                                <tr>
                                  <th>S.No</th>
                                  <th>Date</th>
                                  <th>Voucher Type</th>
                                  <th>Voucher No</th>
                                  <th>Particulars</th>
                                  <th>Cheque No</th>
                                  <th>Cheque Date</th>
                                  <th className="text-end">Debit (Dr)</th>
                                  <th className="text-end">Credit (Cr)</th>
                                  <th className="text-end">Balance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row: any, idx: number) => (
                                  <tr key={idx} className={row["Voucher Type"] === "Opening Balance" ? "table-secondary fw-semibold" : ""}>
                                    <td>{row["S.No"] ?? idx + 1}</td>
                                    <td>{formatDate(row["Date"])}</td>
                                    <td>{row["Voucher Type"] ?? "-"}</td>
                                    <td>{row["Voucher No"] ?? "-"}</td>
                                    <td>{row["Particulars"] ?? "-"}</td>
                                    <td>{row["Cheque No"] ?? "-"}</td>
                                    <td>{formatDate(row["Cheque Date"])}</td>
                                    <td className="text-end text-success fw-semibold">{row["Debit (Dr)"] || "-"}</td>
                                    <td className="text-end text-danger fw-semibold">{row["Credit (Cr)"] || "-"}</td>
                                    <td className="text-end fw-bold">{row["Balance"] ?? "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* ── Summary View ── */
                    <div className="table-responsive">
                      <Table bordered hover striped>
                        <thead className="table-primary">
                          <tr>
                            <th>#</th>
                            <th>Ledger Name</th>
                            <th>Group</th>
                            <th>Branch</th>
                            <th className="text-end">Opening Dr</th>
                            <th className="text-end">Opening Cr</th>
                            <th className="text-end">Total Debit</th>
                            <th className="text-end">Total Credit</th>
                            <th className="text-end">Closing Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td>{row["Ledger Name"] ?? "-"}</td>
                              <td>{row["Group"] ?? "-"}</td>
                              <td>{row["Branch"] ?? "-"}</td>
                              <td className="text-end">{row["Opening Dr"] ?? "-"}</td>
                              <td className="text-end">{row["Opening Cr"] ?? "-"}</td>
                              <td className="text-end text-success fw-semibold">{row["Total Debit"] ?? "-"}</td>
                              <td className="text-end text-danger fw-semibold">{row["Total Credit"] ?? "-"}</td>
                              <td className="text-end fw-bold">{row["Closing Balance"] ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LedgerReport;
