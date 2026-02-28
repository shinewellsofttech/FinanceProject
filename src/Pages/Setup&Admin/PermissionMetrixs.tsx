import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, FormGroup, Input, Label, Row, Table, Button } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Fn_FillListData, Fn_AddEditData } from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";

interface DropdownState {
    roles: Array<{ Id?: number; Name?: string }>;
    modules: Array<{ Id?: number; Name?: string }>;
    branches: Array<{ Id?: number; Name?: string }>;
}

interface ModulePermission {
    ModuleId: number;
    ModuleName: string;
    CanView: boolean;
    CanAdd: boolean;
    CanEdit: boolean;
    CanDelete: boolean;
    CanApprove: boolean;
    CanExport: boolean;
}

const mockModulesData = [
    { Id: 1, Name: "Customer Onboarding" },
    { Id: 2, Name: "KYC Management" },
    { Id: 3, Name: "Loan Application" },
    { Id: 4, Name: "Loan Approval" },
    { Id: 5, Name: "Disbursement" },
    { Id: 6, Name: "EMI Collection" },
    { Id: 7, Name: "Receipt Management" },
    { Id: 8, Name: "Overdue / NPA" },
    { Id: 9, Name: "Accounting / GL" },
    { Id: 10, Name: "Reports & MIS" },
    { Id: 11, Name: "Loan Scheme Config" },
    { Id: 12, Name: "Loan Closure" },
    { Id: 13, Name: "Audit Trail" },
    { Id: 14, Name: "System Utilities" },
    { Id: 15, Name: "Gold Loan - Ornament" },
    { Id: 16, Name: "MFI / Group Lending" }
];

const PermissionMetrixs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = useState<string>("");
    const [selectedBranch, setSelectedBranch] = useState<string>("");
    const [permissions, setPermissions] = useState<ModulePermission[]>([]);
    const [isEditingOpen, setIsEditingOpen] = useState<boolean>(true);

    const [dropdowns, setDropdowns] = useState<DropdownState>({
        roles: [],
        modules: [],
        branches: [],
    });

    const ROLE_API_URL = `${API_WEB_URLS.MASTER}/0/token/UserRole/Id/0`;
    const MODULE_API_URL = `${API_WEB_URLS.MASTER}/0/token/ModuleMaster/Id/0`;
    const BRANCH_API_URL = `${API_WEB_URLS.MASTER}/0/token/BranchOffice/Id/0`;

    useEffect(() => {
        Fn_FillListData(dispatch, setDropdowns, "roles", ROLE_API_URL)
            .catch(err => console.error("Failed to fetch roles:", err));

        Fn_FillListData(dispatch, setDropdowns, "modules", MODULE_API_URL)
            .catch(err => console.error("Failed to fetch modules:", err));

        Fn_FillListData(dispatch, setDropdowns, "branches", BRANCH_API_URL)
            .catch(err => console.error("Failed to fetch branches:", err));
    }, [dispatch, ROLE_API_URL, MODULE_API_URL, BRANCH_API_URL]);

    // Initialize permissions based on fetched modules or API response
    useEffect(() => {
        const sourceModules = dropdowns.modules.length > 0 ? dropdowns.modules : mockModulesData;
        const initialPermissions = sourceModules.map(mod => ({
            ModuleId: mod.Id || 0,
            ModuleName: mod.Name || "",
            CanView: false,
            CanAdd: false,
            CanEdit: false,
            CanDelete: false,
            CanApprove: false,
            CanExport: false,
        }));

        if (!selectedRole) {
            setPermissions(initialPermissions);
            return;
        }

        const FETCH_URL = selectedBranch
            ? `${API_WEB_URLS.MASTER}/0/token/RoleWisePermissionByBranchRole/${selectedBranch}/${selectedRole}`
            : `${API_WEB_URLS.MASTER}/0/token/RoleWisePermission/Id/${selectedRole}`;

        Fn_FillListData(dispatch, () => { }, "tempData", FETCH_URL)
            .then((data: any) => {
                const list = Array.isArray(data) ? data : (data?.Data || []);

                if (list.length === 0) {
                    setPermissions(initialPermissions);
                    return;
                }

                const mappedPermissions = sourceModules.map(mod => {
                    const fetchedPerm = list.find((p: any) => p.F_ModuleMaster === mod.Id);
                    return {
                        ModuleId: mod.Id || 0,
                        ModuleName: mod.Name || "",
                        CanView: fetchedPerm ? !!fetchedPerm.IsView : false,
                        CanAdd: fetchedPerm ? !!fetchedPerm.IsAdd : false,
                        CanEdit: fetchedPerm ? !!fetchedPerm.IsEdit : false,
                        CanDelete: fetchedPerm ? !!fetchedPerm.IsDelete : false,
                        CanApprove: fetchedPerm ? !!fetchedPerm.IsApprove : false,
                        CanExport: fetchedPerm ? !!fetchedPerm.IsExport : false,
                    };
                });

                setPermissions(mappedPermissions);
            })
            .catch(err => {
                console.error("Failed to fetch role permissions:", err);
                setPermissions(initialPermissions);
            });

    }, [dispatch, selectedRole, selectedBranch, dropdowns.modules]);

    const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedRole(e.target.value);
    };

    const handleBranchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedBranch(e.target.value);
    };

    const handleCheckboxToggle = (moduleId: number, field: keyof ModulePermission) => {
        setPermissions(prev => prev.map(p => {
            if (p.ModuleId === moduleId) {
                return { ...p, [field]: !p[field] };
            }
            return p;
        }));
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) {
            alert("Please select a role first.");
            return;
        }

        const dataJsonArray = permissions.map(p => ({
            F_ModuleMaster: p.ModuleId,
            IsView: p.CanView,
            IsAdd: p.CanAdd,
            IsEdit: p.CanEdit,
            IsDelete: p.CanDelete,
            IsApprove: p.CanApprove,
            IsExport: p.CanExport
        }));

        const formData = new FormData();
        formData.append("F_RoleMaster", selectedRole);
        formData.append("F_BranchMaster", selectedBranch);
        formData.append("DataJSON", JSON.stringify(dataJsonArray));

        const storedUser = localStorage.getItem("user");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const userId = currentUser?.uid ?? currentUser?.id ?? "0";
        formData.append("UserId", userId);

        const apiSaveUrl = `RoleWisePermission/${userId}/token`;

        try {
            await Fn_AddEditData(
                dispatch,
                () => { }, // Placeholder for progress state setter 
                { arguList: { id: 0, formData } },
                apiSaveUrl,
                true,
                "memberid",
                navigate,
                null // null redirect url will stay on page
            );
        } catch (error) {
            console.error("Failed to save permissions", error);
        }
    };



    return (
        <div className="page-body">
            <Breadcrumbs mainTitle="Permission Matrix" parent="Setup & Admin" />
            <Container fluid>
                <Row>
                    <Col sm="12">
                        <Card className="shadow-sm border-0">
                            <CardBody>
                                <Row className="mb-4">
                                    <Col md="4">
                                        <FormGroup>
                                            <Label className="fw-bold">
                                                Select Role <span className="text-danger">*</span>
                                            </Label>
                                            <Input
                                                type="select"
                                                value={selectedRole}
                                                onChange={handleRoleChange}
                                                className="form-select"
                                            >
                                                <option value="">-- Select Role --</option>
                                                {dropdowns.roles.map(role => (
                                                    <option key={role.Id} value={role.Id}>{role.Name || `Role ${role.Id}`}</option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup>
                                            <Label className="fw-bold">
                                                Select Branch
                                            </Label>
                                            <Input
                                                type="select"
                                                value={selectedBranch}
                                                onChange={handleBranchChange}
                                                className="form-select"
                                            >
                                                <option value="">-- Select Branch --</option>
                                                {dropdowns.branches.map(branch => (
                                                    <option key={branch.Id} value={branch.Id}>{branch.Name || `Branch ${branch.Id}`}</option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <fieldset disabled={!isEditingOpen}>
                                    <div className="table-responsive border rounded" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                                        <Table className="table-bordered table-striped mb-0 table-hover align-middle">
                                            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                                <tr style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                                    <th className="py-3 px-3 shadow-none border-0" style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                                        Module Name
                                                    </th>
                                                    <th className="text-center py-3 border-0" style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                                        <i className="fa fa-eye text-white-50 me-1"></i> View
                                                    </th>
                                                    <th className="text-center py-3 border-0" style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                                        <i className="fa fa-plus text-primary-light me-1" style={{ color: "#8bb6ff" }}></i> Add
                                                    </th>
                                                    <th className="text-center py-3 border-0" style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                                        <i className="fa fa-pencil text-warning me-1"></i> Edit
                                                    </th>
                                                    <th className="text-center py-3 border-0" style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                                        <i className="fa fa-trash text-white-50 me-1"></i> Delete
                                                    </th>
                                                    <th className="text-center py-3 border-0" style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                                        <i className="fa fa-check-square text-success me-1"></i> Approve
                                                    </th>
                                                    <th className="text-center py-3 border-0" style={{ backgroundColor: "#1e3d73", color: "white" }}>
                                                        <i className="fa fa-file-text text-danger me-1"></i> Export
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {permissions.map((perm, index) => (
                                                    <tr key={perm.ModuleId}>
                                                        <td className="px-3 fw-medium text-dark bg-white">
                                                            {perm.ModuleName}
                                                        </td>
                                                        <td className="text-center bg-white">
                                                            <Input
                                                                type="checkbox"
                                                                className="checkbox_animated"
                                                                checked={perm.CanView}
                                                                onChange={() => handleCheckboxToggle(perm.ModuleId, "CanView")}
                                                            />
                                                        </td>
                                                        <td className="text-center bg-white">
                                                            <Input
                                                                type="checkbox"
                                                                className="checkbox_animated"
                                                                checked={perm.CanAdd}
                                                                onChange={() => handleCheckboxToggle(perm.ModuleId, "CanAdd")}
                                                            />
                                                        </td>
                                                        <td className="text-center bg-white">
                                                            <Input
                                                                type="checkbox"
                                                                className="checkbox_animated"
                                                                checked={perm.CanEdit}
                                                                onChange={() => handleCheckboxToggle(perm.ModuleId, "CanEdit")}
                                                            />
                                                        </td>
                                                        <td className="text-center bg-white">
                                                            <Input
                                                                type="checkbox"
                                                                className="checkbox_animated"
                                                                checked={perm.CanDelete}
                                                                onChange={() => handleCheckboxToggle(perm.ModuleId, "CanDelete")}
                                                            />
                                                        </td>
                                                        <td className="text-center bg-white">
                                                            <Input
                                                                type="checkbox"
                                                                className="checkbox_animated"
                                                                checked={perm.CanApprove}
                                                                onChange={() => handleCheckboxToggle(perm.ModuleId, "CanApprove")}
                                                            />
                                                        </td>
                                                        <td className="text-center bg-white">
                                                            <Input
                                                                type="checkbox"
                                                                className="checkbox_animated"
                                                                checked={perm.CanExport}
                                                                onChange={() => handleCheckboxToggle(perm.ModuleId, "CanExport")}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                                {permissions.length === 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="text-center text-muted py-4 bg-white">
                                                            No modules available.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </fieldset>

                                <div className="d-flex align-items-center gap-3 mt-4 pt-3 border-top">
                                    <Button color="primary" onClick={handleSavePermissions} disabled={!isEditingOpen}>
                                        <i className="fa fa-save me-2"></i> Save Permissions
                                    </Button>
                                    <Button
                                        color="light"
                                        className="text-dark border"
                                        onClick={() => setIsEditingOpen(!isEditingOpen)}
                                    >
                                        <i className={`fa ${isEditingOpen ? "fa-lock" : "fa-pencil"} me-2`}></i>
                                        {isEditingOpen ? "Lock" : "Edit"}
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PermissionMetrixs;
