import AddEdit_AdminMaster from "../Pages/Masters/AddEdit_AdminMaster";
import PageList_AdminMaster from "../Pages/Masters/PageList_AdminMaster";
import ChangePassword from "../Pages/Tools/ChangePassword";
import HOCreation from "../Pages/Setup&Admin/HOCreation";
import RegionalOfficeCreation from "../Pages/Setup&Admin/RegionalOfficeCreation";
import BranchOfficeCreation from "../Pages/Setup&Admin/BranchOfficeCreation";
import UserRoleCreation from "../Pages/Setup&Admin/UserRoleCreation";
import PermissionMetrixs from "../Pages/Setup&Admin/PermissionMetrixs";
import UserCreationBranceMapping from "../Pages/Setup&Admin/UserCreation&BranceMapping";
import MakerCheckerConfiguration from "../Pages/Setup&Admin/Maker-Cheker-Configration";
import FinancialYearSetupControl from "../Pages/Setup&Admin/FinancialYearSetup&Control";
import LoanSchemeConfiguration from "../Pages/Customer&Loan/LoanSchemeConfrigration";

export const routes = [

  // Setup & Admin
  { path: `${process.env.PUBLIC_URL}/hoCreation`, Component: <HOCreation /> },
  { path: `${process.env.PUBLIC_URL}/regionalOfficeCreation`, Component: <RegionalOfficeCreation /> },
  { path: `${process.env.PUBLIC_URL}/branchOfficeCreation`, Component: <BranchOfficeCreation /> },
  { path: `${process.env.PUBLIC_URL}/userRoleCreation`, Component: <UserRoleCreation /> },
  { path: `${process.env.PUBLIC_URL}/permissionMetrixs`, Component: <PermissionMetrixs /> },
  { path: `${process.env.PUBLIC_URL}/userCreation`, Component: <UserCreationBranceMapping /> },
  { path: `${process.env.PUBLIC_URL}/makerCheckerConfig`, Component: <MakerCheckerConfiguration /> },
  { path: `${process.env.PUBLIC_URL}/financialYearSetup`, Component: <FinancialYearSetupControl /> },
  { path: `${process.env.PUBLIC_URL}/loanSchemeConfig`, Component: <LoanSchemeConfiguration /> },

  // Masters
  { path: `${process.env.PUBLIC_URL}/adminMaster`, Component: <PageList_AdminMaster /> },
  { path: `${process.env.PUBLIC_URL}/addEditAdminMaster`, Component: <AddEdit_AdminMaster /> },

  // Tools
  { path: `${process.env.PUBLIC_URL}/changePassword`, Component: <ChangePassword /> },
];
