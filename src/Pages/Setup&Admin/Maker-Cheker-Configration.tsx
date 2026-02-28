import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Card, CardBody, CardFooter, Col, Container, Input, Row, Table, Button } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Fn_FillListData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";

interface DropdownState {
    roles: Array<{ Id?: number; Name?: string }>;
    transactions: Array<{ Id?: number; Name?: string }>;
}

interface MakerCheckerConfig {
    TransactionId: number;
    TransactionName: string;
    IsRequired: "Required" | "Not Required";
    MinAmount: string;
    CheckerRoleId: string;
}

const mockTransactionsData = [
    { Id: 1, Name: "Loan Application Submission" },
    { Id: 2, Name: "Loan Disbursement" },
    { Id: 3, Name: "Receipt / EMI Collection" },
    { Id: 4, Name: "Manual Journal Entry" },
    { Id: 5, Name: "Receipt Reversal" },
    { Id: 6, Name: "Loan Closure / Foreclosure" }
];

const MakerCheckerConfiguration = () => {
    const dispatch = useDispatch();
    const [configs, setConfigs] = useState<MakerCheckerConfig[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [dropdowns, setDropdowns] = useState<DropdownState>({
        roles: [],
        transactions: [],
    });

    const ROLE_API_URL = `${API_WEB_URLS.MASTER}/0/token/UserRole/Id/0`;
    const TRANSACTION_API_URL = `${API_WEB_URLS.MASTER}/0/token/TransactionTypeMaster/Id/0`; // Assuming there might be a master for this

    useEffect(() => {
        Fn_FillListData(dispatch, setDropdowns, "roles", ROLE_API_URL)
            .catch(err => console.error("Failed to fetch roles:", err));

        Fn_FillListData(dispatch, setDropdowns, "transactions", TRANSACTION_API_URL)
            .catch(err => console.error("Failed to fetch transactions:", err));
    }, [dispatch, ROLE_API_URL, TRANSACTION_API_URL]);

    // Initialize configs based on fetched transactions (or mock data if API fails/is empty)
    useEffect(() => {
        const sourceTransactions = dropdowns.transactions.length > 0 ? dropdowns.transactions : mockTransactionsData;
        const initialConfigs = sourceTransactions.map(t => ({
            TransactionId: t.Id || 0,
            TransactionName: t.Name || "",
            IsRequired: "Not Required" as const,
            MinAmount: "Any Amount",
            CheckerRoleId: "",
        }));

        // You could theoretically fetch existing configs here via Fn_DisplayData equivalents 
        // and merge them into initialConfigs.

        setConfigs(initialConfigs);
    }, [dropdowns.transactions]);

    const handleConfigChange = (transactionId: number, field: keyof MakerCheckerConfig, value: string) => {
        setConfigs(prev => prev.map(c => {
            if (c.TransactionId === transactionId) {
                return { ...c, [field]: value };
            }
            return c;
        }));
    };

    const handleSaveConfiguration = async () => {
        try {
            setIsSubmitting(true);

            // Validate all required fields
            const invalidConfig = configs.find(c => c.IsRequired === "Required" && (!c.CheckerRoleId || c.CheckerRoleId === ""));
            if (invalidConfig) {
                alert(`Please select a Checker Role Level for: ${invalidConfig.TransactionName}`);
                return;
            }

            console.log("Saving Maker-Checker Configuration:", configs);

            // In a real application, you'd send `configs` to the backend
            // await Fn_AddEditData(...) or a custom array batch save endpoint.
            alert("Configuration saved successfully! (Simulation)");

        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Maker-Checker Configuration" parent="Setup & Admin" />
            <Container fluid>
                <Row>
                    <Col sm="12">
                        <Card className="shadow-sm border-0">
                            <CardBody className="p-0">
                                <div className="table-responsive border rounded">
                                    <Table className="table-bordered mb-0 align-middle">
                                        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                            <tr style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                                <th className="py-3 px-3 shadow-none border-0 fw-semibold" style={{ backgroundColor: "#1e3d73", color: "white", width: "30%" }}>
                                                    Transaction Type
                                                </th>
                                                <th className="py-3 text-center border-0 fw-semibold" style={{ backgroundColor: "#1e3d73", color: "white", width: "20%" }}>
                                                    Maker-Checker Required?
                                                </th>
                                                <th className="py-3 text-center border-0 fw-semibold" style={{ backgroundColor: "#1e3d73", color: "white", width: "25%" }}>
                                                    Min Amount for Approval (₹)
                                                </th>
                                                <th className="py-3 text-center border-0 fw-semibold" style={{ backgroundColor: "#1e3d73", color: "white", width: "25%" }}>
                                                    Checker Role Level
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {configs.map((config, index) => (
                                                <tr key={config.TransactionId}>
                                                    <td className="px-3 text-dark bg-white py-2" style={{ fontSize: "0.9rem" }}>
                                                        {config.TransactionName}
                                                    </td>
                                                    <td className="text-center bg-white py-2">
                                                        <Input
                                                            type="select"
                                                            bsSize="sm"
                                                            className="w-75 mx-auto rounded-1 border-dark shadow-none"
                                                            value={config.IsRequired}
                                                            onChange={(e) => handleConfigChange(config.TransactionId, "IsRequired", e.target.value)}
                                                            style={{ fontWeight: 500 }}
                                                        >
                                                            <option value="Required">Required</option>
                                                            <option value="Not Required">Not Required</option>
                                                        </Input>
                                                    </td>
                                                    <td className="text-center bg-white py-2">
                                                        <Input
                                                            type="text"
                                                            bsSize="sm"
                                                            className="w-75 mx-auto rounded-1 text-muted"
                                                            value={config.MinAmount}
                                                            onChange={(e) => handleConfigChange(config.TransactionId, "MinAmount", e.target.value)}
                                                            placeholder="0 or Any Amount"
                                                        />
                                                    </td>
                                                    <td className="text-center bg-white py-2">
                                                        <Input
                                                            type="select"
                                                            bsSize="sm"
                                                            className="w-75 mx-auto rounded-1 border-dark shadow-none"
                                                            value={config.CheckerRoleId}
                                                            onChange={(e) => handleConfigChange(config.TransactionId, "CheckerRoleId", e.target.value)}
                                                            style={{ fontWeight: 500 }}
                                                        >
                                                            <option value="">-- Select Level --</option>
                                                            {dropdowns.roles.length === 0 && (
                                                                <>
                                                                    <option value="1">Branch Manager</option>
                                                                    <option value="2">HO Credit</option>
                                                                    <option value="3">HO Accountant</option>
                                                                </>
                                                            )}
                                                            {dropdowns.roles.map((role) => (
                                                                <option key={role.Id} value={String(role.Id)}>
                                                                    {role.Name || `Role ${role.Id}`}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </td>
                                                </tr>
                                            ))}
                                            {configs.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="text-center text-muted py-4 bg-white">
                                                        No transaction types available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                            <CardFooter className="bg-white border-top-0 pt-4 pb-4 px-3">
                                <Button
                                    color="primary"
                                    onClick={handleSaveConfiguration}
                                    disabled={isSubmitting}
                                    className="px-4"
                                >
                                    <i className="fa fa-save me-2"></i> Save Configuration
                                </Button>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default MakerCheckerConfiguration;
