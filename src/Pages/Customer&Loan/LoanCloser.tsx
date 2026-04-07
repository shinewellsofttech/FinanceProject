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
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CardHeaderCommon from "../../CommonElements/CardHeaderCommon/CardHeaderCommon";
import { Btn } from "../../AbstractElements";
import { Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { toast } from "react-toastify";

interface DropState {
    dataList: any[];
    isProgress: boolean;
}

interface ClosureModalState {
    isOpen: boolean;
    showConfirm: boolean;
    selectedAccount: any | null;
    closureDate: string;
    closingRemarks: string;
}

/* ─── Component ─────────────────────────────────────────── */

const LoanCloser = () => {
    const dispatch = useDispatch();

    // Dropdown states
    const [accountTypeState, setAccountTypeState] = useState<DropState>({ dataList: [], isProgress: true });
    const [accountTypeSchemeState, setAccountTypeSchemeState] = useState<DropState>({ dataList: [], isProgress: false });
    const [accountListState, setAccountListState] = useState<DropState>({ dataList: [], isProgress: false });

    // Filter states
    const [searchText, setSearchText] = useState("");
    const [selectedAccountType, setSelectedAccountType] = useState("");
    const [selectedAccountTypeScheme, setSelectedAccountTypeScheme] = useState("");

    // Closure state
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Modal state for closure
    const [closureModal, setClosureModal] = useState<ClosureModalState>({
        isOpen: false,
        showConfirm: false,
        selectedAccount: null,
        closureDate: new Date().toISOString().split('T')[0],
        closingRemarks: "",
    });

    /* ── Open closure modal ── */
    const openClosureModal = (account: any) => {
        setClosureModal({
            isOpen: true,
            showConfirm: false,
            selectedAccount: account,
            closureDate: new Date().toISOString().split('T')[0],
            closingRemarks: "",
        });
    };

    /* ── Close modal ── */
    const closeModal = () => {
        setClosureModal({
            isOpen: false,
            showConfirm: false,
            selectedAccount: null,
            closureDate: new Date().toISOString().split('T')[0],
            closingRemarks: "",
        });
    };

    /* ── Handle form submit - show confirmation ── */
    const handleFormSubmit = () => {
        if (!closureModal.closureDate) {
            toast.error("Please select a closure date");
            return;
        }
        setClosureModal(prev => ({ ...prev, showConfirm: true }));
    };

    /* ── Handle Close Loan ── */
    const handleCloseLoan = async () => {
        if (!closureModal.selectedAccount) return;
        
        setIsSubmitting(true);
        try {
            const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
            const userId = authUser?.uid ?? authUser?.Id ?? "0";
            const userToken = authUser?.Token ?? authUser?.token ?? "token";
            
            const apiUrl = `${API_WEB_URLS.BASE}LoanClosure/${userId}/${userToken}`;
            
            const formData = new FormData();
            formData.append("F_MemberAccountMaster", String(closureModal.selectedAccount.Id));
            formData.append("ClosureDate", closureModal.closureDate);
            formData.append("ClosingRemarks", closureModal.closingRemarks);
            
            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (response.ok && data) {
                toast.success("Loan closed successfully!");
                closeModal();
                // Refresh the list
                if (selectedAccountTypeScheme) {
                    Fn_FillListData(
                        dispatch, 
                        setAccountListState, 
                        "dataList", 
                        `${API_WEB_URLS.MASTER}/0/token/MemberAccountDataFullyPaid/Id/${selectedAccountTypeScheme}`
                    ).catch(console.error);
                }
            } else {
                toast.error(data?.message || "Failed to close loan");
            }
        } catch (error) {
            console.error("Loan closure failed:", error);
            toast.error("Error closing loan. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                `${API_WEB_URLS.MASTER}/0/token/MemberAccountDataFullyPaid/Id/${selectedAccountTypeScheme}`
            ).catch(console.error);
        } else {
            setAccountListState({ dataList: [], isProgress: false });
        }
    }, [dispatch, selectedAccountTypeScheme]);

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
            <Breadcrumbs mainTitle="Loan Closer" parent="Customer & Loan" />
            <Container fluid>
                <Row>
                    <Col xs="12">
                        <Card>
                            <CardHeaderCommon title="Search Fully Paid Loans" tagClass="card-title mb-0" />
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
                                                        {selectedAccountTypeScheme ? "No fully paid loans found for closure" : "Please select Account Type and Scheme"}
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
                                                                color="primary" 
                                                                size="sm"
                                                                onClick={() => openClosureModal(acc)}
                                                                disabled={isSubmitting}
                                                            >
                                                                <i className="fa fa-lock me-1" /> Close Loan
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

            {/* Closure Modal */}
            <Modal isOpen={closureModal.isOpen && !closureModal.showConfirm} toggle={closeModal} centered>
                <ModalHeader toggle={closeModal}>
                    <i className="fa fa-lock me-2" />
                    Loan Closure Details
                </ModalHeader>
                <ModalBody>
                    <div className="mb-3 p-3 bg-light rounded">
                        <strong>Account No:</strong> {closureModal.selectedAccount?.AccountNo}<br />
                        <strong>Member Name:</strong> {closureModal.selectedAccount?.MemberName || closureModal.selectedAccount?.Name}<br />
                        <strong>Loan Amount:</strong> ₹{closureModal.selectedAccount?.LoanAmount?.toLocaleString('en-IN')}
                    </div>
                    <FormGroup>
                        <Label for="closureDate"><strong>Closure Date</strong> <span className="text-danger">*</span></Label>
                        <Input
                            type="date"
                            id="closureDate"
                            value={closureModal.closureDate}
                            onChange={(e) => setClosureModal(prev => ({ ...prev, closureDate: e.target.value }))}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="closingRemarks"><strong>Closing Remarks</strong></Label>
                        <Input
                            type="textarea"
                            id="closingRemarks"
                            rows={3}
                            placeholder="Enter remarks for loan closure..."
                            value={closureModal.closingRemarks}
                            onChange={(e) => setClosureModal(prev => ({ ...prev, closingRemarks: e.target.value }))}
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Btn color="secondary" onClick={closeModal}>
                        <i className="fa fa-times me-1" /> Cancel
                    </Btn>
                    <Btn color="primary" onClick={handleFormSubmit}>
                        <i className="fa fa-check me-1" /> Proceed
                    </Btn>
                </ModalFooter>
            </Modal>

            {/* Confirmation Modal */}
            <Modal isOpen={closureModal.showConfirm} toggle={() => setClosureModal(prev => ({ ...prev, showConfirm: false }))} centered>
                <ModalHeader toggle={() => setClosureModal(prev => ({ ...prev, showConfirm: false }))}>
                    <i className="fa fa-exclamation-triangle text-warning me-2" />
                    Confirm Loan Closure
                </ModalHeader>
                <ModalBody>
                    <div className="text-center">
                        <i className="fa fa-exclamation-circle text-warning" style={{ fontSize: '3rem' }} />
                        <h5 className="mt-3">Are you sure you want to close this loan?</h5>
                        <p className="text-muted mb-0">
                            Account No: <strong>{closureModal.selectedAccount?.AccountNo}</strong><br />
                            Closure Date: <strong>{closureModal.closureDate}</strong>
                        </p>
                        <p className="text-danger mt-2">
                            <small>This action cannot be undone.</small>
                        </p>
                    </div>
                </ModalBody>
                <ModalFooter className="justify-content-center">
                    <Btn color="secondary" onClick={() => setClosureModal(prev => ({ ...prev, showConfirm: false }))}>
                        <i className="fa fa-arrow-left me-1" /> Go Back
                    </Btn>
                    <Btn color="danger" onClick={handleCloseLoan} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner size="sm" className="me-1" /> Closing...
                            </>
                        ) : (
                            <>
                                <i className="fa fa-lock me-1" /> Confirm Close
                            </>
                        )}
                    </Btn>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default LoanCloser;
