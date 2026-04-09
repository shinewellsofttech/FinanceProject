import { MenuItem } from "../../Types/Layout/SidebarType";

export const MenuList: MenuItem[] = [
  {
    title: "Setup & Admin",
    Items: [
      {
        id: 1,
        moduleId: 1, // HOCreation
        title: "Head Office",
        path: `${process.env.PUBLIC_URL}/hoCreation`,
        icon: "Home",
        type: "link",
        bookmark: true,
      },
      {
        id: 2,
        moduleId: 2, // RegionalOfficeList
        title: "Regional Office",
        path: `${process.env.PUBLIC_URL}/regionalOfficeList`,
        icon: "Home",
        type: "link",
        bookmark: true,
      },
      {
        id: 3,
        moduleId: 4, // BranchOfficeList
        title: "Branch Office",
        path: `${process.env.PUBLIC_URL}/branchOfficeList`,
        icon: "Home",
        type: "link",
        bookmark: true,
      },
      {
        id: 4,
        moduleId: 6, // UserRoleList
        title: "User Role",
        path: `${process.env.PUBLIC_URL}/userRoleList`,
        icon: "User",
        type: "link",
        bookmark: true,
      },
      {
        id: 5,
        moduleId: 10, // PermissionMetrixs
        title: "Permission Matrix",
        path: `${process.env.PUBLIC_URL}/permissionMetrixs`,
        icon: "Unlock",
        type: "link",
        bookmark: true,
      },
      {
        id: 6,
        moduleId: 8, // UserCreationList
        title: "User Creation",
        path: `${process.env.PUBLIC_URL}/userCreationList`,
        icon: "Users",
        type: "link",
        bookmark: true,
      },
      // {
      //   id: 7,
      //   moduleId: 11, // MakerCheckerConfig
      //   title: "Maker-Checker",
      //   path: `${process.env.PUBLIC_URL}/makerCheckerConfig`,
      //   icon: "CheckSquare",
      //   type: "link",
      //   bookmark: true,
      // },
      // {
      //   id: 8,
      //   moduleId: 12, // FinancialYearSetup
      //   title: "Financial Year Setup",
      //   path: `${process.env.PUBLIC_URL}/financialYearSetup`,
      //   icon: "Calendar",
      //   type: "link",
      //   bookmark: true,
      // },
    ],
  },
  {
    title: "Masters",
    Items: [
      // {
      //   id: 1,
      //   moduleId: 37, // CountryMaster
      //   title: "Country Master",
      //   path: `${process.env.PUBLIC_URL}/countryMaster`,
      //   icon: "Map",
      //   type: "link",
      //   bookmark: true,
      // },
      // {
      //   id: 2,
      //   moduleId: 39, // StateMaster
      //   title: "State Master",
      //   path: `${process.env.PUBLIC_URL}/stateMaster`,
      //   icon: "MapPin",
      //   type: "link",
      //   bookmark: true,
      // },
      // {
      //   id: 3,
      //   moduleId: 41, // CityMaster
      //   title: "City Master",
      //   path: `${process.env.PUBLIC_URL}/cityMaster`,
      //   icon: "MapPin",
      //   type: "link",
      //   bookmark: true,
      // },
      {
        id: 4,
        moduleId: 43, // ModuleMaster
        title: "Module Master",
        path: `${process.env.PUBLIC_URL}/moduleMaster`,
        icon: "MapPin",
        type: "link",
        bookmark: true,
      },
      {
        id: 5,
        moduleId: 45, // MemberAccountList
        title: "Member Account",
        path: `${process.env.PUBLIC_URL}/memberAccountList`,
        icon: "MapPin",
        type: "link",
        bookmark: true,
      },
      {
        id: 6,
        moduleId: 47, // LedgerMasterList
        title: "Ledger Master",
        path: `${process.env.PUBLIC_URL}/ledgerMasterList`,
        icon: "Book",
        type: "link",
        bookmark: true,
      }
    ],
  },
  {
    title: "Transactions",
    Items: [
      {
        id: 1,
        moduleId: 34, // ReceiptList
        title: "Receipt",
        path: `${process.env.PUBLIC_URL}/receiptList`,
        icon: "FileText",
        type: "link",
        bookmark: true,
      },
      {
        id: 2,
        moduleId: 35, // PaymentList
        title: "Payment",
        path: `${process.env.PUBLIC_URL}/paymentList`,
        icon: "CreditCard",
        type: "link",
        bookmark: true,
      },
      // {
      //   id: 3,
      //   moduleId: 36, // Payment
      //   title: "Payment",
      //   path: `${process.env.PUBLIC_URL}/payment`,
      //   icon: "CreditCard",
      //   type: "link",
      //   bookmark: true,
      // },
    ],
  },
  {
    title: "Customer & Loan",
    Items: [
      {
        id: 1,
        moduleId: 13, // LoanSchemeList
        title: "Account Type Scheme",
        path: `${process.env.PUBLIC_URL}/loanSchemeList`,
        icon: "FileText",
        type: "link",
        bookmark: true,
      },
      {
        id: 2,
        moduleId: 15, // CustomerList
        title: "Customer Registration",
        path: `${process.env.PUBLIC_URL}/customerList`,
        icon: "UserPlus",
        type: "link",
        bookmark: true,
      },
      // {
      //   id: 3,
      //   moduleId: 17, // LoanApplicationList
      //   title: "Loan Application",
      //   path: `${process.env.PUBLIC_URL}/loanApplicationList`,
      //   icon: "FilePlus",
      //   type: "link",
      //   bookmark: true,
      // },
      {
        id: 4,
        moduleId: 20, // LoanApproval
        title: "Loan Approval",
        path: `${process.env.PUBLIC_URL}/loanApproval`,
        icon: "CheckCircle",
        type: "link",
        bookmark: true,
      },
      {
        id: 5,
        moduleId: 32, // LoanCloser
        title: "Loan Closer",
        path: `${process.env.PUBLIC_URL}/loanCloser`,
        icon: "CheckCircle",
        type: "link",
        bookmark: true,
      },
      {
        id: 6,
        moduleId: 21, // ForCloser
        title: "For Closer",
        path: `${process.env.PUBLIC_URL}/forCloser`,
        icon: "CheckCircle",
        type: "link",
        bookmark: true,
      }
      // {
      //   id: 5,
      //   moduleId: 19, // EligibilityCheck
      //   title: "Eligibility Check",
      //   path: `${process.env.PUBLIC_URL}/eligibilityCheck`,
      //   icon: "CheckSquare",
      //   type: "link",
      //   bookmark: true,
      // },
    ],
  },
  // {
  //   title: "Operations",
  //   Items: [
  //     {
  //       id: 1,
  //       moduleId: 22, // EMISchedule
  //       title: "EMI Schedule",
  //       path: `${process.env.PUBLIC_URL}/emiSchedule`,
  //       icon: "Calendar",
  //       type: "link",
  //       bookmark: true,
  //     },
  //     {
  //       id: 2,
  //       moduleId: 23, // EMICollection
  //       title: "EMI Collection",
  //       path: `${process.env.PUBLIC_URL}/emiCollection`,
  //       icon: "DollarSign",
  //       type: "link",
  //       bookmark: true,
  //     },
  //     {
  //       id: 3,
  //       moduleId: 24, // LoanDisbursement
  //       title: "Loan Disbursement",
  //       path: `${process.env.PUBLIC_URL}/loanDisbursement`,
  //       icon: "CreditCard",
  //       type: "link",
  //       bookmark: true,
  //     },
  //     {
  //       id: 4,
  //       moduleId: 25, // OverdueTrackingNPAClassification
  //       title: "Overdue Tracking & NPA",
  //       path: `${process.env.PUBLIC_URL}/overdueTrackingNPAClassification`,
  //       icon: "AlertTriangle",
  //       type: "link",
  //       bookmark: true,
  //     },
  //     {
  //       id: 5,
  //       moduleId: 26, // COAManualGLEntry
  //       title: "COA & Manual GL Entry",
  //       path: `${process.env.PUBLIC_URL}/coaManualGLEntry`,
  //       icon: "BookOpen",
  //       type: "link",
  //       bookmark: true,
  //     },
  //     {
  //       id: 6,
  //       moduleId: 27, // DayClosing
  //       title: "Day Closing",
  //       path: `${process.env.PUBLIC_URL}/dayClosing`,
  //       icon: "Moon",
  //       type: "link",
  //       bookmark: true,
  //     },
  //     {
  //       id: 7,
  //       moduleId: 28, // LoanClosing
  //       title: "Loan Closing",
  //       path: `${process.env.PUBLIC_URL}/loanClosing`,
  //       icon: "XCircle",
  //       type: "link",
  //       bookmark: true,
  //     },
  //     {
  //       id: 8,
  //       moduleId: 29, // Foreclosure
  //       title: "Foreclosure",
  //       path: `${process.env.PUBLIC_URL}/foreclosure`,
  //       icon: "Flag",
  //       type: "link",
  //       bookmark: true,
  //     },
  //     {
  //       id: 9,
  //       moduleId: 30, // AuctionManagement
  //       title: "Auction Management",
  //       path: `${process.env.PUBLIC_URL}/auctionManagement`,
  //       icon: "ShoppingCart",
  //       type: "link",
  //       bookmark: true,
  //     },
  //     {
  //       id: 10,
  //       moduleId: 31, // RepaymentForm
  //       title: "Repayment Form",
  //       path: `${process.env.PUBLIC_URL}/repaymentForm`,
  //       icon: "DollarSign",
  //       type: "link",
  //       bookmark: true,
  //     }
  //   ],
  // },
  {
    title: "Reporting",
    Items: [
      {
        id: 1,
        moduleId: 49, // LedgerReport
        title: "Ledger Report",
        path: `${process.env.PUBLIC_URL}/ledgerReport`,
        icon: "BarChart2",
        type: "link",
        bookmark: true,
      },
    ],
  },
  {
    title: "Tools",
    Items: [
      {
        id: 1,
        moduleId: 0, // User Rights - special permission
        title: "User Rights",
        path: `${process.env.PUBLIC_URL}/userRights`,
        icon: "Shield",
        type: "link",
        bookmark: true,
      },
      {
        id: 2,
        moduleId: 50, // ChangePassword
        title: "Change Password",
        path: `${process.env.PUBLIC_URL}/changePassword`,
        icon: "Lock",
        type: "link",
        bookmark: true,
      },
    ],
  },
];
