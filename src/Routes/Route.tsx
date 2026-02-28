import PageList_CountryMaster from "../Pages/Masters/PageList_CountryMaster";
import AddEdit_CountryMaster from "../Pages/Masters/AddEdit_CountryMaster";
import PageList_StateMaster from "../Pages/Masters/PageList_StateMaster";
import AddEdit_StateMaster from "../Pages/Masters/AddEdit_StateMaster";
import PageList_CityMaster from "../Pages/Masters/PageList_CityMaster";
import AddEdit_CityMaster from "../Pages/Masters/AddEdit_CityMaster";
import ChangePassword from "../Pages/Tools/ChangePassword";
import HOCreation from "../Pages/Setup&Admin/HOCreation";
import PageList_RegionalOffice from "../Pages/Setup&Admin/PageList_RegionalOffice";
import RegionalOfficeCreation from "../Pages/Setup&Admin/RegionalOfficeCreation";
import PageList_BranchOffice from "../Pages/Setup&Admin/PageList_BranchOffice";
import BranchOfficeCreation from "../Pages/Setup&Admin/BranchOfficeCreation";
import PageList_UserRole from "../Pages/Setup&Admin/PageList_UserRole";
import UserRoleCreation from "../Pages/Setup&Admin/UserRoleCreation";
import PageList_UserCreation from "../Pages/Setup&Admin/PageList_UserCreation";
import UserCreationBranceMapping from "../Pages/Setup&Admin/UserCreation&BranceMapping";
import PermissionMetrixs from "../Pages/Setup&Admin/PermissionMetrixs";
import MakerCheckerConfiguration from "../Pages/Setup&Admin/Maker-Cheker-Configration";
import FinancialYearSetupControl from "../Pages/Setup&Admin/FinancialYearSetup&Control";
import PageList_LoanScheme from "../Pages/Customer&Loan/PageList_LoanScheme";
import LoanSchemeConfiguration from "../Pages/Customer&Loan/LoanSchemeConfrigration";
import PageList_CustomerRegistration from "../Pages/Customer&Loan/PageList_CustomerRegistration";
import CustomerRegistration from "../Pages/Customer&Loan/CustomerRegistration";
import PageList_LoanApplication from "../Pages/Customer&Loan/PageList_LoanApplication";
import LoanApplication from "../Pages/Customer&Loan/LoanApplication";
import EligibilityCheck from "../Pages/Customer&Loan/EligibilityCheck";
import EMISchedule from "../Pages/Operations/EMISchedule";
import EMICollection from "../Pages/Operations/EMICollection";
import LoanDisbursement from "../Pages/Operations/LoanDisbursement";
import OverdueTrackingNPAClassification from "../Pages/Operations/OverdueTracking&NPAClassification";
import PageList_ModuleMaster from "../Pages/Masters/PageList_ModuleMaster";
import AddEdit_ModuleMaster from "../Pages/Masters/AddEdit_ModuleMaster";

export const routes = [

  // Setup & Admin
  { path: `${process.env.PUBLIC_URL}/hoCreation`, Component: <HOCreation /> },
  { path: `${process.env.PUBLIC_URL}/regionalOfficeList`, Component: <PageList_RegionalOffice /> },
  { path: `${process.env.PUBLIC_URL}/regionalOfficeCreation`, Component: <RegionalOfficeCreation /> },
  { path: `${process.env.PUBLIC_URL}/branchOfficeList`, Component: <PageList_BranchOffice /> },
  { path: `${process.env.PUBLIC_URL}/branchOfficeCreation`, Component: <BranchOfficeCreation /> },
  { path: `${process.env.PUBLIC_URL}/userRoleList`, Component: <PageList_UserRole /> },
  { path: `${process.env.PUBLIC_URL}/userRoleCreation`, Component: <UserRoleCreation /> },
  { path: `${process.env.PUBLIC_URL}/userCreationList`, Component: <PageList_UserCreation /> },
  { path: `${process.env.PUBLIC_URL}/userCreation`, Component: <UserCreationBranceMapping /> },
  { path: `${process.env.PUBLIC_URL}/permissionMetrixs`, Component: <PermissionMetrixs /> },
  { path: `${process.env.PUBLIC_URL}/makerCheckerConfig`, Component: <MakerCheckerConfiguration /> },
  { path: `${process.env.PUBLIC_URL}/financialYearSetup`, Component: <FinancialYearSetupControl /> },
  { path: `${process.env.PUBLIC_URL}/loanSchemeList`, Component: <PageList_LoanScheme /> },
  { path: `${process.env.PUBLIC_URL}/loanSchemeConfig`, Component: <LoanSchemeConfiguration /> },
  { path: `${process.env.PUBLIC_URL}/customerList`, Component: <PageList_CustomerRegistration /> },
  { path: `${process.env.PUBLIC_URL}/customerRegistration`, Component: <CustomerRegistration /> },
  { path: `${process.env.PUBLIC_URL}/loanApplicationList`, Component: <PageList_LoanApplication /> },
  { path: `${process.env.PUBLIC_URL}/loanApplication`, Component: <LoanApplication /> },
  { path: `${process.env.PUBLIC_URL}/eligibilityCheck`, Component: <EligibilityCheck /> },

  // Operations
  { path: `${process.env.PUBLIC_URL}/emiSchedule`, Component: <EMISchedule /> },
  { path: `${process.env.PUBLIC_URL}/emiCollection`, Component: <EMICollection /> },
  { path: `${process.env.PUBLIC_URL}/loanDisbursement`, Component: <LoanDisbursement /> },
  { path: `${process.env.PUBLIC_URL}/overdueTrackingNPAClassification`, Component: <OverdueTrackingNPAClassification /> },

  // Masters
  { path: `${process.env.PUBLIC_URL}/countryMaster`, Component: <PageList_CountryMaster /> },
  { path: `${process.env.PUBLIC_URL}/addEditCountryMaster`, Component: <AddEdit_CountryMaster /> },
  { path: `${process.env.PUBLIC_URL}/stateMaster`, Component: <PageList_StateMaster /> },
  { path: `${process.env.PUBLIC_URL}/addEditStateMaster`, Component: <AddEdit_StateMaster /> },
  { path: `${process.env.PUBLIC_URL}/cityMaster`, Component: <PageList_CityMaster /> },
  { path: `${process.env.PUBLIC_URL}/addEditCityMaster`, Component: <AddEdit_CityMaster /> },
  { path: `${process.env.PUBLIC_URL}/moduleMaster`, Component: <PageList_ModuleMaster /> },
  { path: `${process.env.PUBLIC_URL}/addEditModuleMaster`, Component: <AddEdit_ModuleMaster /> },

  // Tools
  { path: `${process.env.PUBLIC_URL}/changePassword`, Component: <ChangePassword /> },
];
