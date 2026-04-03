import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
    Card,
    CardBody,
    Col,
    Container,
    FormGroup,
    Input,
    Label,
    Row,
    Table,
    Spinner,
} from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Btn } from "../../AbstractElements";
import { Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { API_HELPER } from "../../helpers/ApiHelper";
import { toast } from "react-toastify";

interface DropState {
    dataList: any[];
    isProgress: boolean;
}

/* ─── Component ─────────────────────────────────────────── */

const LoanApproval = () => {
    const dispatch = useDispatch();

    // Dropdown states
    const [accountTypeState, setAccountTypeState] = useState<DropState>({ dataList: [], isProgress: true });
    const [accountTypeSchemeState, setAccountTypeSchemeState] = useState<DropState>({ dataList: [], isProgress: false });
    const [accountListState, setAccountListState] = useState<DropState>({ dataList: [], isProgress: false });

    // Filter states
    const [searchText, setSearchText] = useState("");
    const [selectedAccountType, setSelectedAccountType] = useState("");
    const [selectedAccountTypeScheme, setSelectedAccountTypeScheme] = useState("");

    // Approval state
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* ── Load dropdown data ── */
    useEffect(() => {
        Fn_FillListData(dispatch, setAccountTypeState, "dataList", `${API_WEB_URLS.MASTER}/0/token/accountType/Id/0`).catch(console.error);
    }, [dispatch]);

    /* ── Fetch AccountTypeScheme when AccountType changes ── */
    useEffect(() => {
        if (selectedAccountType) {
            setAccountTypeSchemeState({ dataList: [], isProgress: true });
            setSelectedAccountTypeScheme("");
            setAccountListState({ dataList: [], isProgress: false });
            Fn_FillListData(
                dispatch, 
                setAccountTypeSchemeState, 
                "dataList", 
                `${API_WEB_URLS.MASTER}/0/token/AccountTypeSchemeByType/TBL.F_AccountType/${selectedAccountType}`
            ).catch(console.error);
        } else {
            setAccountTypeSchemeState({ dataList: [], isProgress: false });
            setSelectedAccountTypeScheme("");
            setAccountListState({ dataList: [], isProgress: false });
        }
    }, [dispatch, selectedAccountType]);

    /* ── Fetch Accounts when AccountTypeScheme changes ── */
    useEffect(() => {
        if (selectedAccountTypeScheme) {
            setAccountListState({ dataList: [], isProgress: true });
            Fn_FillListData(
                dispatch, 
                setAccountListState, 
                "dataList", 
                `${API_WEB_URLS.MASTER}/0/token/MemberAccountDataBySchemeForApproval/Id/${selectedAccountTypeScheme}`
            ).catch(console.error);
        } else {
            setAccountListState({ dataList: [], isProgress: false });
        }
    }, [dispatch, selectedAccountTypeScheme]);

    /* ── Handle Approve ── */
    const handleApprove = async (account: any) => {
        setIsSubmitting(true);
        try {
            const apiUrl = `${API_WEB_URLS.BASE}Masters/0/token/ApproveLoan/Id/${account.Id}`;
            const response = await API_HELPER.apiGET(apiUrl);
            
            // Response format: data.dataList[0] or data.response[0]
            const data = response?.data?.dataList?.[0] || response?.data?.response?.[0] || response?.data?.[0] || response?.data;

            if (response && (response.status === 200 || data)) {
                toast.success("Loan approved successfully!");
                // Refresh the list
                if (selectedAccountTypeScheme) {
                    Fn_FillListData(
                        dispatch, 
                        setAccountListState, 
                        "dataList", 
                        `${API_WEB_URLS.MASTER}/0/token/MemberAccountDataBySchemeForApproval/Id/${selectedAccountTypeScheme}`
                    ).catch(console.error);
                }
            } else {
                toast.error(response?.data?.message || response?.message || "Failed to approve loan");
            }
        } catch (error) {
            console.error("Approval failed:", error);
            toast.error("Error approving loan. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── Handle Reject ── */
    const handleReject = async (account: any) => {
        setIsSubmitting(true);
        try {
            const apiUrl = `${API_WEB_URLS.BASE}Masters/0/token/RejectLoan/Id/${account.Id}`;
            const response = await API_HELPER.apiGET(apiUrl);
            
            // Response format: data.dataList[0] or data.response[0]
            const data = response?.data?.dataList?.[0] || response?.data?.response?.[0] || response?.data?.[0] || response?.data;

            if (response && (response.status === 200 || data)) {
                toast.success("Loan rejected successfully!");
                // Refresh the list
                if (selectedAccountTypeScheme) {
                    Fn_FillListData(
                        dispatch, 
                        setAccountListState, 
                        "dataList", 
                        `${API_WEB_URLS.MASTER}/0/token/MemberAccountDataBySchemeForApproval/Id/${selectedAccountTypeScheme}`
                    ).catch(console.error);
                }
            } else {
                toast.error(response?.data?.message || response?.message || "Failed to reject loan");
            }
        } catch (error) {
            console.error("Rejection failed:", error);
            toast.error("Error rejecting loan. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── Filter accounts ── */
    const displayAccounts = useMemo(() => {
        if (selectedAccountTypeScheme && accountListState.dataList.length > 0) {
            const search = searchText.toLowerCase();
            const schemeName = accountTypeSchemeState.dataList.find((s: any) => String(s.Id) === selectedAccountTypeScheme)?.Name || "";
            
            return accountListState.dataList.filter((acc: any) => {
                if (!searchText) return true;
                return (
                    (acc.AccountNo?.toLowerCase().includes(search)) ||
                    (acc.CustomerName?.toLowerCase().includes(search)) ||
                    (acc.MemberName?.toLowerCase().includes(search)) ||
                    (acc.Name?.toLowerCase().includes(search))
                );
            }).map((acc: any) => ({
                ...acc,
                SchemeName: schemeName,
                MemberName: acc.CustomerName || acc.MemberName || acc.Name
            }));
        }
        return [];
    }, [selectedAccountTypeScheme, accountListState.dataList, searchText, accountTypeSchemeState.dataList]);

    /* ─── Render ─────────────────────────────────────────── */
    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Loan Approval" parent="Customer & Loan" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Card>
                            <CardHeaderCommon title="Search Member Account" tagClass="card-title mb-0" />
                            <CardBody>
                                <Row className="mb-3">
                                    <Col md="3">
                                        <FormGroup className="mb-0">
                                            <Label>Account Type</Label>
                                            <Input
                                                type="select"
                                                value={selectedAccountType}
                                                onChange={(e) => setSelectedAccountType(e.target.value)}
                                            >
                                                <option value="">Select Account Type</option>
                                                {accountTypeState.dataList.map((type: any) => (
                                                    <option key={type.Id} value={type.Id}>{type.Name}</option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup className="mb-0">
                                            <Label>Account Type Scheme</Label>
                                            <Input
                                                type="select"
                                                value={selectedAccountTypeScheme}
                                                onChange={(e) => setSelectedAccountTypeScheme(e.target.value)}
                                                disabled={!selectedAccountType || accountTypeSchemeState.isProgress}
                                            >
                                                <option value="">Select Scheme</option>
                                                {accountTypeSchemeState.dataList.map((scheme: any) => (
                                                    <option key={scheme.Id} value={scheme.Id}>{scheme.Name}</option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup className="mb-0">
                                            <Label>Search</Label>
                                            <Input
                                                type="text"
                                                placeholder="Search by Account No or Member Name..."
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                {accountListState.isProgress ? (
                                    <div className="text-center p-3">
                                        <Spinner color="primary" />
                                    </div>
                                ) : (
                                    <Table bordered hover responsive size="sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Account No</th>
                                                <th>Member Name</th>
                                                <th>Loan Amount</th>
                                                <th>Scheme</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayAccounts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center">
                                                        {selectedAccountTypeScheme ? "No accounts found for approval" : "Please select Account Type and Scheme"}
                                                    </td>
                                                </tr>
                                            ) : (
                                                displayAccounts.map((acc: any) => (
                                                    <tr key={acc.Id}>
                                                        <td>{acc.AccountNo}</td>
                                                        <td>{acc.MemberName || acc.Name}</td>
                                                        <td>{acc.LoanAmount}</td>
                                                        <td>{acc.SchemeName}</td>
                                                        <td>
                                                            <Btn 
                                                                color="success" 
                                                                size="sm" 
                                                                className="me-1"
                                                                onClick={() => handleApprove(acc)}
                                                                disabled={isSubmitting}
                                                            >
                                                                <i className="fa fa-check me-1" /> Approve
                                                            </Btn>
                                                            <Btn 
                                                                color="danger" 
                                                                size="sm"
                                                                onClick={() => handleReject(acc)}
                                                                disabled={isSubmitting}
                                                            >
                                                                <i className="fa fa-times me-1" /> Reject
                                                            </Btn>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LoanApproval;
