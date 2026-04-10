import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage, FieldArray } from "formik";
import type { FormikProps, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import {
  Fn_AddEditData,
  Fn_DisplayData,
  Fn_FillListData,
  Fn_GetReportAPI,
} from "../../store/Functions";
import { API_WEB_URLS } from "../../constants/constAPI";
import { handleEnterToNextField } from "../../utils/formUtils";
import * as Yup from "yup";
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
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn } from "../../AbstractElements";

interface BankAccount {
  BankName: string;
  AccountNumber: string;
  IFSCCode: string;
  F_AccountTypeMaster: string;
  IsPrimary: boolean;
  IsVerified: boolean;
}

interface CustomerFormValues {
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  Gender: string;
  MobileNo: string;
  AlternateMobile: string;
  Email: string;
  AadhaarNo: string;
  PAN: string;
  CurrentAddress: string;
  F_CityMaster: string;
  F_StateMaster: string;
  Pincode: string;
  F_OccupationTypeMaster: string;
  YearsInBusinessOrJob: string;
  MonthlyIncome: string;
  BusinessAddress: string;
  CustomerPhoto: any;
  IsITRAvailable: string;
  F_FieldUnitCentre: string;
  F_MemberGroup: string;
  F_Branch: string;
  BankAccounts: BankAccount[];
}

const initialValues: CustomerFormValues = {
  FirstName: "",
  LastName: "",
  DateOfBirth: "",
  Gender: "",
  MobileNo: "",
  AlternateMobile: "",
  Email: "",
  AadhaarNo: "",
  PAN: "",
  CurrentAddress: "",
  F_CityMaster: "",
  F_StateMaster: "",
  Pincode: "",
  F_OccupationTypeMaster: "",
  YearsInBusinessOrJob: "",
  MonthlyIncome: "",
  BusinessAddress: "",
  CustomerPhoto: null,
  IsITRAvailable: "false",
  F_FieldUnitCentre: "",
  F_MemberGroup: "",
  F_Branch: "",
  BankAccounts: [
    {
      BankName: "",
      AccountNumber: "",
      IFSCCode: "",
      F_AccountTypeMaster: "",
      IsPrimary: false,
      IsVerified: false,
    },
  ],
};

interface KYCFormValues {
  PANNumber: string;
  AadhaarNumber: string;
  F_ProofTypeMaster: string;
  IDProofFront: any;
  IDProofBack: any;
  F_AddressProofTypeMaster: string;
  AddressProofFile: any;
  Photograph: any;
  SignatureFile: any;
  ITRProofFile: any;
  CKYCStatus: string;
  InternalRiskGrade: string;
  FingerprintAuth: string;
  AadhaarESign: string;
}

const initialKYCValues: KYCFormValues = {
  PANNumber: "",
  AadhaarNumber: "",
  F_ProofTypeMaster: "",
  IDProofFront: null,
  IDProofBack: null,
  F_AddressProofTypeMaster: "",
  AddressProofFile: null,
  Photograph: null,
  SignatureFile: null,
  ITRProofFile: null,
  CKYCStatus: "Not Checked",
  InternalRiskGrade: "",
  FingerprintAuth: "Not Required",
  AadhaarESign: "Pending",
};

interface DropdownState {
  genders: Array<{ Id?: number; Name?: string }>;
  states: Array<{ Id?: number; Name?: string }>;
  cities: Array<{ Id?: number; Name?: string }>;
  occupations: Array<{ Id?: number; Name?: string }>;
  fieldUnits: Array<{ Id?: number; Name?: string }>;
  memberGroups: Array<{ Id?: number; Name?: string }>;
  branches: Array<{ Id?: number; Name?: string }>;
  accountTypes: Array<{ Id?: number; Name?: string }>;
  idProofTypes: Array<{ Id?: number; Name?: string }>;
  addressProofTypes: Array<{ Id?: number; Name?: string }>;
}

const CustomerRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const nameRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState("1");
  const [customerId, setCustomerId] = useState<number>(0);
  const [isMapped, setIsMapped] = useState(false);
  const [unifiedTransactionId, setUnifiedTransactionId] = useState<string>("");
  const [kycVerificationData, setKycVerificationData] = useState<any>(null);
  const [showDigitalVerificationButton, setShowDigitalVerificationButton] = useState<boolean>(true);
  
  // New state variables for verification data
  const [downloadXml, setDownloadXml] = useState<string>("");
  const [verificationSource, setVerificationSource] = useState<string>("digilocker");
  const [referenceId, setReferenceId] = useState<string>("");
  const [uniqueId, setUniqueId] = useState<string>("");
  const [aadhaarPhoto, setAadhaarPhoto] = useState<string>("");
  const [isAadhaarVerified, setIsAadhaarVerified] = useState<boolean>(false);
  const [isPanVerified, setIsPanVerified] = useState<boolean>(false);
  const [panVerificationData, setPanVerificationData] = useState<any>(null);
  
  // State to hold any fetched form data later for edit support
  const [savedData, setSavedData] = useState<Partial<CustomerFormValues>>({});
  const [savedKYCData, setSavedKYCData] = useState<Partial<KYCFormValues>>({});
  const [existingFiles, setExistingFiles] = useState<any>({});
  // State for Fn_DisplayData - it needs a setter that accepts prevState => ({ ...prevState, formData: record })
  const [customerState, setCustomerState] = useState<{
    id: number;
    formData: any;
  }>({ id: 0, formData: {} });

  const [dropdowns, setDropdowns] = useState<DropdownState>({
    genders: [],
    states: [],
    cities: [],
    occupations: [],
    fieldUnits: [],
    memberGroups: [],
    branches: [],
    accountTypes: [],
    idProofTypes: [],
    addressProofTypes: [],
  });

  const API_URL_SAVE = `${API_WEB_URLS.BASE}Masters/0/token/CustomerMaster/Id/0`;
  const API_URL_EDIT = `${API_WEB_URLS.MASTER}/0/token/CustomerMaster/Id`;

  const validationSchema = useMemo(
    () =>
      Yup.object({
        FirstName: Yup.string().trim().required("First Name is required"),
        LastName: Yup.string().trim().required("Last Name is required"),
        DateOfBirth: Yup.date()
          .required("Date of Birth is required")
          .nullable(),
        Gender: Yup.string().required("Gender is required"),
        MobileNo: Yup.string()
          .matches(/^[0-9]{10}$/, "Must be a 10-digit number")
          .required("Mobile Number is required"),
        AadhaarNo: Yup.string()
          .matches(/^[0-9]{12}$/, "Must be a 12-digit number")
          .required("Aadhaar Number is required"),
        PAN: Yup.string().required("PAN Number is required"),
        CurrentAddress: Yup.string().required("Current Address is required"),
        F_CityMaster: Yup.string().required("City is required"),
        F_StateMaster: Yup.string().required("State is required"),
        Pincode: Yup.string()
          .matches(/^[0-9]{6}$/, "Must be a 6-digit number")
          .required("PIN Code is required"),
        F_OccupationTypeMaster: Yup.string().required("Occupation is required"),
        MonthlyIncome: Yup.number()
          .typeError("Must be a number")
          .required("Monthly Income is required"),
        BankAccounts: Yup.array()
          .of(
            Yup.object().shape({
              BankName: Yup.string().required("Bank Name is required"),
              AccountNumber: Yup.string().required(
                "Account Number is required",
              ),
              IFSCCode: Yup.string().required("IFSC Code is required"),
              F_AccountTypeMaster: Yup.string().required(
                "Account Type is required",
              ),
            }),
          )
          .min(1, "At least one bank account is required"),
      }),
    [],
  );

  const kycValidationSchema = useMemo(
    () =>
      Yup.object({
        PANNumber: Yup.string()
          .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)")
          .required("PAN Number is required"),
        AadhaarNumber: Yup.string()
          .matches(/^\d{4}-\d{4}-\d{4}$/, "Invalid Aadhaar format (XXXX-XXXX-XXXX)")
          .required("Aadhaar Number is required"),
        F_ProofTypeMaster: Yup.string().required("ID Proof Type is required"),
        IDProofFront: Yup.mixed().required("ID Proof Front is required"),
        F_AddressProofTypeMaster: Yup.string().required(
          "Address Proof Type is required",
        ),
        AddressProofFile: Yup.mixed().required("Address Proof is required"),
        Photograph: Yup.mixed().required("Photograph is required"),
        SignatureFile: Yup.mixed().required("Signature is required"),
      }),
    [],
  );

  useEffect(() => {
    nameRef.current?.focus();

    Fn_FillListData(
      dispatch,
      setDropdowns,
      "states",
      `Masters/0/token/StateMaster/Id/0`,
    );
    Fn_FillListData(
      dispatch,
      setDropdowns,
      "occupations",
      `Masters/0/token/OccupationTypeMaster/Id/0`,
    );
    Fn_FillListData(
      dispatch,
      setDropdowns,
      "fieldUnits",
      `Masters/0/token/FieldUnitCentre/Id/0`,
    );
    Fn_FillListData(
      dispatch,
      setDropdowns,
      "memberGroups",
      `Masters/0/token/MemberGroup/Id/0`,
    );
    Fn_FillListData(
      dispatch,
      setDropdowns,
      "branches",
      `Masters/0/token/BranchOffice/Id/0`,
    );
    Fn_FillListData(
      dispatch,
      setDropdowns,
      "accountTypes",
      `Masters/0/token/AccountTypeMaster/Id/0`,
    );
    Fn_FillListData(
      dispatch,
      setDropdowns,
      "idProofTypes",
      `Masters/0/token/ProofTypeMaster/Id/0`,
    );
    Fn_FillListData(
      dispatch,
      setDropdowns,
      "addressProofTypes",
      `Masters/0/token/AddressProofTypeMaster/Id/0`,
    );

    // Cleanup function to clear session data when component unmounts
    return () => {
      // Clear session storage when navigating away from this component
      const isVerificationInProgress = localStorage.getItem('unifiedTransactionId');
      if (!isVerificationInProgress) {
        sessionStorage.removeItem('currentCustomerId');
        console.log('SessionStorage cleared on component unmount');
      }
    };
  }, [dispatch]);

  // Handle Edit Mode - Load customer data from list page
  useEffect(() => {
    const locationState = location.state as { Id?: number } | undefined;
    const recordId =
      locationState?.Id && locationState.Id > 0 ? locationState.Id : 0;

    if (recordId > 0) {
      setCustomerId(recordId);
      setCustomerState((prev) => ({ ...prev, id: recordId }));
      // Fn_DisplayData expects a setState function, it will call setState(prev => ({ ...prev, formData: data }))
      Fn_DisplayData(dispatch, setCustomerState, recordId, API_URL_EDIT);
    } else {
      // New customer - reset states
      setCustomerId(0);
      setCustomerState({ id: 0, formData: {} });
      setSavedData({});
      setSavedKYCData({});
      setIsMapped(false);
    }
  }, [dispatch, location.state, API_URL_EDIT]);

  // Handle DigiLocker redirect - Check URL parameters for verification return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectCustomerId = urlParams.get('customerId');
    const redirectTransactionId = urlParams.get('transactionId');
    const verificationStatus = urlParams.get('status');
    
    // Check for stored customer ID in sessionStorage (for page reloads)
    const storedCustomerId = sessionStorage.getItem('currentCustomerId');
    
    if (redirectCustomerId && redirectTransactionId) {
      console.log('DigiLocker Verification Return Detected:');
      console.log('Customer ID from URL:', redirectCustomerId);
      console.log('Transaction ID from URL:', redirectTransactionId);
      console.log('Verification Status:', verificationStatus);
      
      // Get transaction ID from localStorage
      const storedTransactionId = localStorage.getItem('unifiedTransactionId');
      console.log('Transaction ID from localStorage:', storedTransactionId);
      
      // Set the states and save customer ID to sessionStorage
      const customerIdNum = parseInt(redirectCustomerId);
      setCustomerId(customerIdNum);
      setCustomerState(prev => ({ ...prev, id: customerIdNum }));
      
      // Save customer ID to sessionStorage for reload persistence
      sessionStorage.setItem('currentCustomerId', redirectCustomerId);
      console.log('Customer ID saved to sessionStorage:', redirectCustomerId);
      
      // Automatically open Tab 3 (Digital Verification) when returning from verification
      setActiveTab("3");
      console.log('🎯 Auto-opening Tab 3 (Digital Verification) after verification redirect');
      
      if (storedTransactionId) {
        setUnifiedTransactionId(storedTransactionId);
        console.log('Transaction ID set to state:', storedTransactionId);
        
        // Hide digital verification button and fetch KYC data
        setShowDigitalVerificationButton(false);
        
        // Call FetchDataUsingTransactionId to get verification status
        const fetchVerificationData = async () => {
          try {
            await FetchDataUsingTransactionId(storedTransactionId);
          } catch (error: any) {
            console.error('Error fetching verification data:', error);
          }
        };
        fetchVerificationData();
      }
      
      // Load customer data similar to edit mode
      if (customerIdNum > 0) {
        Fn_DisplayData(dispatch, setCustomerState, customerIdNum, API_URL_EDIT);
        console.log('Loading customer data for ID:', customerIdNum);
      }
      
      // Clean up URL parameters
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (storedCustomerId && !redirectCustomerId) {
      // Handle page reload case - restore customer data from sessionStorage
      console.log('Page reload detected, restoring customer data from sessionStorage');
      const customerIdFromStorage = parseInt(storedCustomerId);
      
      if (customerIdFromStorage > 0) {
        console.log('Restoring customer ID from sessionStorage:', customerIdFromStorage);
        setCustomerId(customerIdFromStorage);
        setCustomerState(prev => ({ ...prev, id: customerIdFromStorage }));
        
        // Check if there's a stored transaction ID and restore verification state
        const storedTransactionId = localStorage.getItem('unifiedTransactionId');
        if (storedTransactionId) {
          setUnifiedTransactionId(storedTransactionId);
          setShowDigitalVerificationButton(false);
          console.log('Restoring transaction ID from localStorage:', storedTransactionId);
          
          // Restore verification data
          const fetchVerificationData = async () => {
            try {
              await FetchDataUsingTransactionId(storedTransactionId);
            } catch (error: any) {
              console.error('Error fetching verification data on reload:', error);
            }
          };
          fetchVerificationData();
        }
        
        // Load customer data for edit mode
        Fn_DisplayData(dispatch, setCustomerState, customerIdFromStorage, API_URL_EDIT);
        console.log('Customer data loaded for ID:', customerIdFromStorage);
      }
    }
  }, [dispatch, API_URL_EDIT]);
  const FetchDataUsingTransactionId = async (transactionId: string) => {
    const formData = new FormData();
    formData.append("UnifiedTransactionId", transactionId);
    const response = await Fn_GetReportAPI(
      dispatch,
      () => {},
      "verificationData",
      `DigiVerification/GetStatus`,
      { arguList: { id: 0, formData: formData } },
      true,
    );
    console.log("DigiLocker Verification Status Response:", response);
    
    // Store the verification data if successful
    if (response && response.success && response.data && response.data.data) {
      const verificationData = response.data.data;
      setKycVerificationData(verificationData);
      
      // Store additional verification details
      if (verificationData.downloadXml) {
        setDownloadXml(verificationData.downloadXml);
        console.log("✅ Download XML set:", verificationData.downloadXml);
      }
      
      // Set sample reference and unique IDs as requested
      setReferenceId("a8950a3f-f085-4560-9b7e-50ec556a71b1");
      setUniqueId("IMVRS2604102820653552051921157");
      
      // Store Aadhaar photo if available - check multiple possible field names
      if (verificationData.aadhaarPhoto || verificationData.photo || verificationData.image) {
        const photoData = verificationData.aadhaarPhoto || verificationData.photo || verificationData.image;
        setAadhaarPhoto(photoData);
        console.log("✅ Aadhaar Photo set from field:", verificationData.aadhaarPhoto ? 'aadhaarPhoto' : verificationData.photo ? 'photo' : 'image');
      }
      
      // Mark Aadhaar as verified
      setIsAadhaarVerified(true);
    }
  };
  // Map the fetched formData to savedData when Fn_DisplayData completes
  useEffect(() => {
    // Handle nested response format: data.dataList[0]
    let fetchedData = customerState.formData;
    if (
      fetchedData?.dataList &&
      Array.isArray(fetchedData.dataList) &&
      fetchedData.dataList.length > 0
    ) {
      fetchedData = fetchedData.dataList[0];
    }

    // Check if formData has data (at least has Id)
    if (!fetchedData || !fetchedData.Id) {
      return;
    }

    console.log("Mapping fetched customer data:", fetchedData);

    // Parse BankJson if it's a string
    let bankAccounts: BankAccount[] = [];
    if (fetchedData.BankJson) {
      try {
        bankAccounts =
          typeof fetchedData.BankJson === "string"
            ? JSON.parse(fetchedData.BankJson)
            : fetchedData.BankJson;

        // Map to match our interface
        bankAccounts = bankAccounts.map((acc: any) => ({
          BankName: acc.BankName || "",
          AccountNumber: acc.AccountNumber || "",
          IFSCCode: acc.IFSCCode || "",
          F_AccountTypeMaster: String(
            acc.F_BankAccountTypeMaster || acc.F_AccountTypeMaster || "",
          ),
          IsPrimary: acc.IsPrimary || false,
          IsVerified: acc.IsVerified || false,
        }));
      } catch (e) {
        console.error("Failed to parse BankJson:", e);
        bankAccounts = [
          {
            BankName: "",
            AccountNumber: "",
            IFSCCode: "",
            F_AccountTypeMaster: "",
            IsPrimary: false,
            IsVerified: false,
          },
        ];
      }
    }

    if (bankAccounts.length === 0) {
      bankAccounts = [
        {
          BankName: "",
          AccountNumber: "",
          IFSCCode: "",
          F_AccountTypeMaster: "",
          IsPrimary: false,
          IsVerified: false,
        },
      ];
    }

    // Handle FirstName and LastName from response
    // Prioritize separate FirstName/LastName fields, fallback to splitting Name if available
    let firstName = fetchedData.FirstName || "";
    let lastName = fetchedData.LastName || "";

    // If both are empty/null and there's a Name field, split it
    if (!firstName && !lastName && fetchedData.Name) {
      const nameArray = (fetchedData.Name || "").trim().split(" ");
      firstName = nameArray[0] || "";
      lastName = nameArray.slice(1).join(" ") || "";
    }

    const mappedData: Partial<CustomerFormValues> = {
      FirstName: firstName,
      LastName: lastName,
      DateOfBirth: fetchedData.DateOfBirth
        ? String(fetchedData.DateOfBirth).split("T")[0]
        : "",
      Gender: fetchedData.Gender || "",
      MobileNo: fetchedData.MobileNo || "",
      AlternateMobile: fetchedData.AlternateMobile || "",
      Email: fetchedData.Email || "",
      AadhaarNo: fetchedData.AadhaarNo || "",
      PAN: fetchedData.PAN || "",
      CurrentAddress: fetchedData.CurrentAddress || "",
      F_CityMaster: String(fetchedData.F_CityMaster || ""),
      F_StateMaster: String(fetchedData.F_StateMaster || ""),
      Pincode: fetchedData.Pincode || "",
      F_OccupationTypeMaster: String(fetchedData.F_OccupationTypeMaster || ""),
      YearsInBusinessOrJob: String(fetchedData.YearsInBusinessOrJob || ""),
      MonthlyIncome: String(fetchedData.MonthlyIncome || ""),
      BusinessAddress: fetchedData.BusinessAddress || "",
      IsITRAvailable: fetchedData.IsITRAvailable === true ? "true" : "false",
      F_FieldUnitCentre: String(fetchedData.F_FieldUnitCentre || ""),
      F_MemberGroup: String(fetchedData.F_MemberGroup || ""),
      F_Branch: String(
        fetchedData.F_Branch || fetchedData.F_BranchOffice || "",
      ),
      BankAccounts: bankAccounts,
    };

    // Also map KYC fields if present
    const mappedKYCData: Partial<KYCFormValues> = {
      PANNumber: fetchedData.PAN || "",
      AadhaarNumber: fetchedData.AadhaarNo || "",
      F_ProofTypeMaster: String(fetchedData.F_ProofTypeMaster || ""),
      F_AddressProofTypeMaster: String(
        fetchedData.F_AddressProofTypeMaster || "",
      ),
    };

    // Store existing filenames for display (they'll be shown but not pre-filled in file input)
    const existingFiles = {
      IDProofFront: fetchedData.IDProofFront || null,
      IDProofBack: fetchedData.IDProofBack || null,
      AddressProofFile: fetchedData.AddressProofFile || null,
      Photograph: fetchedData.Photograph || null,
      SignatureFile: fetchedData.SignatureFile || null,
      ITRProofFile: fetchedData.ITRProofFile || null,
      CustomerPhoto: fetchedData.CustomerPhoto || null,
    };

    setSavedData(mappedData);
    setSavedKYCData(mappedKYCData);

    // Store existing file names for display purposes
    setExistingFiles(existingFiles);

    // Set verification status if already verified in the fetched data
    if (fetchedData.IsAadhaarVerified === true) {
      setIsAadhaarVerified(true);
      console.log("✅ Aadhaar verification status loaded from existing data: VERIFIED");
    }
    
    if (fetchedData.IsPanVerified === true) {
      setIsPanVerified(true);
      console.log("✅ PAN verification status loaded from existing data: VERIFIED");
    }

    // Load cities based on state
    if (fetchedData.F_StateMaster && !isMapped) {
      Fn_FillListData(
        dispatch,
        setDropdowns,
        "cities",
        `Masters/0/token/CityMasterByState/Id/${fetchedData.F_StateMaster}`,
      ).catch((err) => console.error("Failed to fetch cities for edit:", err));
      setIsMapped(true);
    }
  }, [customerState.formData, dispatch, isMapped]);

  const initialFormValues: CustomerFormValues = {
    ...initialValues,
    ...savedData,
  };

  const initialKYCSavedValues: KYCFormValues = {
    ...initialKYCValues,
    ...savedKYCData,
  };

  const handleStateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleChange: FormikProps<CustomerFormValues>["handleChange"],
    setFieldValue: FormikProps<CustomerFormValues>["setFieldValue"],
  ) => {
    handleChange(e);
    const selectedState = e.target.value;
    if (selectedState) {
      Fn_FillListData(
        dispatch,
        setDropdowns,
        "cities",
        `Masters/0/token/CityMasterByState/Id/${selectedState}`,
      ).catch((err) => console.error("Failed to fetch cities by state:", err));
    } else {
      setDropdowns((prev) => ({ ...prev, cities: [] }));
    }
    setFieldValue("F_CityMaster", "");
  };

  // Simple function to move to next tab without full validation
  const handleMoveToNextTab = (values: CustomerFormValues) => {
    // Save current form data without validation
    setSavedData(values);
    console.log("Basic Info saved locally:", values);
    
    // Move to next tab
    setActiveTab("2");
  };

  const handleBasicInfoSubmit = async (
    values: CustomerFormValues,
    { setSubmitting }: FormikHelpers<CustomerFormValues>,
  ) => {
    try {
      // Format BankJson according to required structure
      const bankJson = values.BankAccounts.map((account) => ({
        BankName: account.BankName,
        AccountNumber: account.AccountNumber,
        IFSCCode: account.IFSCCode,
        F_BankAccountTypeMaster: parseInt(account.F_AccountTypeMaster) || 0,
        IsPrimary: account.IsPrimary || false,
        IsVerified: account.IsVerified || false,
      }));

      const formData = new FormData();

      // Add ID for edit mode
      formData.append("Id", String(customerId || 0));

      // Append FirstName and LastName as separate parameters
      formData.append("FirstName", values.FirstName);
      formData.append("LastName", values.LastName);

      // Append all other fields individually
      formData.append("DateOfBirth", values.DateOfBirth || "");
      formData.append("Gender", values.Gender || "");
      formData.append("MobileNo", values.MobileNo || "");
      formData.append("AlternateMobile", values.AlternateMobile || "");
      formData.append("Email", values.Email || "");
      formData.append("AadhaarNo", values.AadhaarNo || "");
      formData.append("PAN", values.PAN || "");
      formData.append("CurrentAddress", values.CurrentAddress || "");
      formData.append("F_CityMaster", values.F_CityMaster || "");
      formData.append("F_StateMaster", values.F_StateMaster || "");
      formData.append("Pincode", values.Pincode || "");
      formData.append("F_OccupationTypeMaster", values.F_OccupationTypeMaster || "");
      formData.append("YearsInBusinessOrJob", values.YearsInBusinessOrJob || "");
      formData.append("MonthlyIncome", values.MonthlyIncome || "");
      formData.append("BusinessAddress", values.BusinessAddress || "");
      formData.append("IsITRAvailable", values.IsITRAvailable || "false");
      formData.append("F_FieldUnitCentre", values.F_FieldUnitCentre || "");
      formData.append("F_MemberGroup", values.F_MemberGroup || "");
      formData.append("F_Branch", values.F_Branch || "");

      // Append file if present
      if (values.CustomerPhoto instanceof File) {
        formData.append("CustomerPhoto", values.CustomerPhoto);
      }

      // Append BankJson as JSON string
      formData.append("BankJson", JSON.stringify(bankJson));

      // Get current user info
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userId = currentUser?.uid ?? currentUser?.id ?? "0";

      formData.append("UserId", userId);
      formData.append(
        "F_BranchOffice",
        localStorage.getItem("F_BranchOffice") || "",
      );

      const API_URL_BASIC_SAVE = `${API_WEB_URLS.BASE}${API_WEB_URLS.CUSTOMER}/${userId}/token`;

      console.log("Submitting Basic Info to API:", API_URL_BASIC_SAVE);
      console.log("Customer ID:", customerId);
      console.log("Formatted BankJson:", JSON.stringify(bankJson, null, 2));

      // Make the actual API call for basic info
      const response = await Fn_AddEditData(
        dispatch,
        () => undefined,
        { arguList: { id: customerId || 0, formData } },
        API_URL_BASIC_SAVE,
        true, // Set isMultiPart to true for FormData
        "memberid",
      );

      // If response contains customer ID, update it
      if (response && response.Id) {
        setCustomerId(response.Id);
        sessionStorage.setItem('currentCustomerId', String(response.Id));
      }

      setSavedData(values); // Saving states into memory locally
      // After saving successfully, proceed to next tab:
      setActiveTab("2");
    } catch (error: any) {
      console.error("Basic Info Submission failed:", error);
      alert("Failed to save basic information!");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Aadhaar Digital Verification
  const handleAadhaarDigitalVerification = async(formAadhaarNumber?: string) => {
    console.log("Initiating Aadhaar Digital Verification");
    
    // Use parameter if provided, otherwise get from saved data
    const aadhaarNumber = formAadhaarNumber || savedData.AadhaarNo;
    
    if (!aadhaarNumber) {
      alert("⚠️ Aadhaar Number Required\n\nPlease enter Aadhaar Number above for verification.");
      return;
    }
    
    console.log("Verifying Aadhaar Number:", aadhaarNumber);
    
    // Create redirect URL to return to this same page with customer ID and transaction ID placeholder
    const redirectUrl = `${window.location.origin}/customerRegistration?customerId=${customerId}&transactionId=TRANSACTION_ID_PLACEHOLDER&status=completed&aadhaar=${aadhaarNumber}`;
    
    const formData = new FormData();
    formData.append("RedirectUrl", redirectUrl);
    formData.append("AadhaarNumber", aadhaarNumber);
    
    try {
      const response = await Fn_GetReportAPI(
        dispatch,
        () => {},
        "verificationData",
        `DigiVerification/GetUrl`,
        { arguList: { id: 0, formData: formData } },
        true,
      );
      
      console.log("Aadhaar Digital Verification Response:", response);
      
      // Check if response is successful and contains verification URL
      if (response && response.success && response.data && response.data.data && response.data.data.url) {
        const verificationUrl = response.data.data.url;
        
        // Extract unified_transaction_id from the URL for state storage
        const urlParams = new URLSearchParams(new URL(verificationUrl).search);
        const transactionId = urlParams.get('unified_transaction_id');
        
        if (transactionId) {
          // Save transaction ID in state and localStorage
          setUnifiedTransactionId(transactionId);
          localStorage.setItem('unifiedTransactionId', transactionId);
          console.log('Transaction ID extracted and saved to localStorage:', transactionId);
        }
        
        console.log('Opening Aadhaar verification URL:', verificationUrl);
        
        // Open the response URL directly without any modifications
        window.open(verificationUrl, '_blank');
        
      } else {
        console.error('Failed to get Aadhaar verification URL:', response);
        alert('Failed to initiate Aadhaar digital verification');
      }
      
    } catch (error: any) {
      console.error("Aadhaar digital verification error:", error);
      alert("Error occurred during Aadhaar digital verification");
    }
  };

  // Handle PAN Verification
  const panVerification = async (PanNumber: string) => {
    console.log("Initiating PAN Verification for:", PanNumber);
    
    const formData = new FormData();
    formData.append("PAN", PanNumber);
    
    try {
      const response = await Fn_GetReportAPI(
        dispatch,
        () => {},
        "verificationData",
        `PanVerification/VerifyPan`,
        { arguList: { id: 0, formData: formData } },
        true,
      );
      
      console.log("PAN Verification Response:", response);
      
      // Check if verification was successful according to actual response structure
      if (response && response.success && response.data && response.data.status === "success" && response.data.data && response.data.data.result) {
        // Store PAN verification data
        setPanVerificationData(response.data);
        
        // Mark PAN as verified
        setIsPanVerified(true);
        
        const result = response.data.data.result;
        const charges = response.data.charges || 0;
        const requestID = response.data.requestID || "";
        
        console.log("PAN Verification Successful:", {
          fullname: result.fullname,
          pan: result.pan,
          aadhaar_linked: result.aadhaar_linked,
          dob: result.dob,
          address: result.address,
          charges: charges,
          requestID: requestID
        });
        
        // No alert - just update status which will be shown in button
        
      } else {
        console.error('PAN Verification Failed:', response);
        const errorMessage = response?.data?.msg || response?.message || 'PAN verification failed';
        alert(`❌ PAN Verification Failed\n\n${errorMessage}`);
      }
      
    } catch (error: any) {
      console.error("PAN verification error:", error);
      alert("Error occurred during PAN verification");
    }
  };

  // Handle Bank Account Verification
  const handleBankVerification = async (
    account: BankAccount,
    index: number,
    setFieldValue: any,
  ) => {
    console.log("Bank Account Verification Details:", {
      index: index,
      accountData: account,
      bankName: account.BankName,
      accountNumber: account.AccountNumber,
      ifscCode: account.IFSCCode,
      accountType: account.F_AccountTypeMaster,
      isPrimary: account.IsPrimary,
      isVerified: account.IsVerified,
    });

    try {
      const formData = new FormData();
      formData.append("AccountNumber", account.AccountNumber);
      formData.append("IFSC", account.IFSCCode);

      const response = await Fn_GetReportAPI(
        dispatch,
        () => {},
        "verificationData",
        `PennyDrop/VerifyAccount`,
        { arguList: { id: 0, formData: formData } },
        true,
      );

      console.log("Bank Verification Response:", response);

      // Check if verification was successful
      if (
        response &&
        response.success === true &&
        response.status === 200 &&
        response.data &&
        response.data.status === "success" &&
        response.data.data &&
        response.data.data.status === "SUCCESS"
      ) {
        // Extract verified name from response
        const verifiedName = response.data.data.nameAtBank || "";
        const charges = response.data.charges || 0;
        const refId = response.data.data.refId || "";

        // Update the bank account's IsVerified status to true
        setFieldValue(`BankAccounts[${index}].IsVerified`, true);

        console.log("Bank account marked as verified:", {
          accountNumber: account.AccountNumber,
          nameAtBank: verifiedName,
          charges: charges,
          referenceId: refId,
        });
      } else {
        // Verification failed
        const errorMessage =
          response?.data?.message ||
          response?.message ||
          "Bank verification failed";
        console.log("Bank verification failed:", response);
      }
    } catch (error: any) {
      console.error("Bank verification error:", error);
      alert(
        `❌ Bank Verification Error\n\nFailed to verify account: ${account.AccountNumber}`,
      );
    }
  };

  // Handle KYC Docs submission - save data locally and move to Digital Verification tab
  const handleKYCSubmit = async (
    values: KYCFormValues,
    { setSubmitting }: FormikHelpers<KYCFormValues>,
  ) => {
    try {
      console.log("KYC Docs saved locally:", values);
      setSavedKYCData(values);
      setActiveTab("3"); // Move to Digital Verification tab
    } catch (error: any) {
      console.error("KYC Submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Verification Data submission - submit only verification status and details
  const handleVerificationSubmit = async () => {
    try {
      console.log("🔍 Verification Submit - Current State:");
      console.log("DownloadXml:", downloadXml);
      console.log("AadhaarPhoto:", aadhaarPhoto ? 'Available (length: ' + aadhaarPhoto.length + ')' : 'Not Available');
      console.log("ReferenceId:", referenceId);
      console.log("UniqueId:", uniqueId);
      
      const formData = new FormData();

      // Add only verification status and details (not PAN/Aadhaar numbers)
      formData.append("Id", String(customerId || 0));
      formData.append("IsAadhaarVerified", String(isAadhaarVerified));
      formData.append("IsPanVerified", String(isPanVerified));
      formData.append("DownloadXml", downloadXml || "");
      formData.append("VerificationSource", verificationSource);
      formData.append("ReferenceId", referenceId);
      formData.append("UniqueId", uniqueId);
      formData.append("AadhaarPhoto", aadhaarPhoto || "");

      // Add current user info
   
     
   

   

      // Submit verification status only
      await Fn_AddEditData(
        dispatch,
        () => undefined,
        { arguList: { id: customerId || 0, formData } },
        'CustomerVerification/updateVerification/0/token',
        true, // Set isMultiPart to true for FormData
        "memberid",
        navigate,
        "/pageList_CustomerRegistration",
      );

      console.log("Verification status submitted successfully");
      alert("Verification status submitted successfully! Redirecting to customer list.");

      // Clear session storage after successful save
      sessionStorage.removeItem('currentCustomerId');
      localStorage.removeItem('unifiedTransactionId');
      console.log('Session data cleared after successful verification submit');

    } catch (error: any) {
      console.error("Verification submission failed:", error);
      alert("Failed to submit verification status!");
    }
  };

  const handleSubmit = async (kycValues: KYCFormValues) => {
    try {
      // Combine Basic Info + KYC data + PAN/Aadhaar numbers
      const formData = new FormData();

      // Add ID for edit mode
      formData.append("Id", String(customerId || 0));

      // --- Basic Info fields from Tab 1 ---
      formData.append("FirstName", String(savedData.FirstName || ""));
      formData.append("LastName", String(savedData.LastName || ""));
      formData.append("DateOfBirth", String(savedData.DateOfBirth || ""));
      formData.append("Gender", String(savedData.Gender || ""));
      formData.append("MobileNo", String(savedData.MobileNo || ""));
      formData.append(
        "AlternateMobile",
        String(savedData.AlternateMobile || ""),
      );
      formData.append("Email", String(savedData.Email || ""));
      // Use Aadhaar and PAN from KYC form if available, otherwise from savedData
      formData.append("AadhaarNo", String(kycValues.AadhaarNumber || savedData.AadhaarNo || ""));
      formData.append("PAN", String(kycValues.PANNumber || savedData.PAN || ""));
      formData.append("CurrentAddress", String(savedData.CurrentAddress || ""));
      formData.append("F_CityMaster", String(savedData.F_CityMaster || "0"));
      formData.append("F_StateMaster", String(savedData.F_StateMaster || "0"));
      formData.append("Pincode", String(savedData.Pincode || ""));
      formData.append(
        "F_OccupationTypeMaster",
        String(savedData.F_OccupationTypeMaster || "0"),
      );
      formData.append(
        "YearsInBusinessOrJob",
        String(savedData.YearsInBusinessOrJob || "0"),
      );
      formData.append("MonthlyIncome", String(savedData.MonthlyIncome || "0"));
      formData.append(
        "BusinessAddress",
        String(savedData.BusinessAddress || ""),
      );
      formData.append(
        "IsITRAvailable",
        String(savedData.IsITRAvailable || "false"),
      );
      formData.append(
        "F_FieldUnitCentre",
        String(savedData.F_FieldUnitCentre || "0"),
      );
      formData.append("F_MemberGroup", String(savedData.F_MemberGroup || "0"));
      formData.append("F_Branch", String(savedData.F_Branch || "0"));

      // CustomerPhoto (file from Tab 1)
      if (savedData.CustomerPhoto instanceof File) {
        formData.append("CustomerPhoto", savedData.CustomerPhoto);
      }

      // BankJson
      const bankJson = (savedData.BankAccounts || []).map((account) => ({
        BankName: account.BankName,
        AccountNumber: account.AccountNumber,
        IFSCCode: account.IFSCCode,
        F_BankAccountTypeMaster: parseInt(account.F_AccountTypeMaster) || 0,
        IsPrimary: account.IsPrimary || false,
        IsVerified: account.IsVerified || false,
      }));
      formData.append("BankJson", JSON.stringify(bankJson));

      // --- KYC fields from Tab 2 ---
      formData.append(
        "F_ProofTypeMaster",
        String(kycValues.F_ProofTypeMaster || "0"),
      );
      formData.append(
        "F_AddressProofTypeMaster",
        String(kycValues.F_AddressProofTypeMaster || "0"),
      );

      // File uploads from KYC
      if (kycValues.IDProofFront instanceof File) {
        formData.append("IDProofFront", kycValues.IDProofFront);
      }
      if (kycValues.IDProofBack instanceof File) {
        formData.append("IDProofBack", kycValues.IDProofBack);
      }
      if (kycValues.AddressProofFile instanceof File) {
        formData.append("AddressProofFile", kycValues.AddressProofFile);
      }
      if (kycValues.Photograph instanceof File) {
        formData.append("Photograph", kycValues.Photograph);
      }
      if (kycValues.SignatureFile instanceof File) {
        formData.append("SignatureFile", kycValues.SignatureFile);
      }
      if (kycValues.ITRProofFile instanceof File) {
        formData.append("ITRProofFile", kycValues.ITRProofFile);
      }

      // Add PAN and Aadhaar numbers from KYC form
      formData.append("PANNumber", kycValues.PANNumber || "");
      formData.append("AadhaarNumber", kycValues.AadhaarNumber || "");



      // Get current user info
      const storedUser = localStorage.getItem("user");
      console.log("Raw stored user from localStorage:", storedUser);
      
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      console.log("Parsed current user:", currentUser);
      
      // Try multiple possible ID fields
      const userId = currentUser?.uid ?? currentUser?.id ?? currentUser?.userId ?? currentUser?.UserId ?? "1";
      
      console.log("All localStorage items:");
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          console.log(`${key}:`, localStorage.getItem(key));
        }
      }
      
      console.log("Final extracted userId:", userId);

      formData.append("UserId", userId);
      formData.append(
        "F_BranchOffice",
        localStorage.getItem("F_BranchOffice") || "",
      );

  
      
  
      console.log("Customer ID:", customerId);
      console.log("User ID:", userId);
      console.log("BankJson:", JSON.stringify(bankJson, null, 2));
      
      // Log FormData contents for debugging
      console.log("FormData contents:");
      const formDataEntries = Array.from(formData.entries());
      formDataEntries.forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(key + ': [FILE]', value.name);
        } else {
          console.log(key + ':', value);
        }
      });

      // Submit basic customer and KYC data to API
      console.log("Making API call...");
      
      try {
        const response = await Fn_AddEditData(
          dispatch,
          () => undefined,
          { arguList: { id: customerId || 0, formData } },
          'CustomerMaster/0/token',
          true, // Set isMultiPart to true for FormData
          "memberid",
        );

        console.log("API Response received:", response);

        // If response contains customer ID, update it
        if (response && response.Id) {
          setCustomerId(response.Id);
          sessionStorage.setItem('currentCustomerId', String(response.Id));
          console.log("Customer ID updated to:", response.Id);
        }
        
        setSavedKYCData(kycValues);
        
        console.log('Customer and KYC data submitted successfully');
        alert('Customer and KYC data saved successfully! Please proceed to verification.');
        
        // Move to Digital Verification tab for verification status submission
        setActiveTab("3");
        
      } catch (apiError) {
        console.error("API call failed:", apiError);
        throw apiError; // Re-throw to be caught by outer catch
      }
      
    } catch (error: any) {
      console.error("KYC Save failed with error:", error);
      console.error("Error details:", {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        name: error?.name || 'Unknown error type'
      });
      
      // Show detailed error message
      const errorMessage = error?.response?.data?.message || error?.message || "Unknown error occurred";
      alert(`Failed to save KYC data!\n\nError: ${errorMessage}\n\nPlease check the console for more details.`);
    }
  };

  return (
    <div className="page-body">
      <Breadcrumbs mainTitle="Customer Registration" parent="Customer & Loan" />
      <Container fluid>
        <Row>
          <Col xs="12">
            <Card>
              <CardBody className="p-0">
                <Nav
                  tabs
                  className="border-tab nav-primary mb-0 p-3 pb-0"
                  id="bottom-tab"
                >
                  <NavItem>
                    <NavLink
                      className={activeTab === "1" ? "active" : ""}
                      onClick={() => setActiveTab("1")}
                    >
                      <i className="fa fa-user me-2"></i>Basic Info
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === "2" ? "active" : ""}
                      onClick={() => setActiveTab("2")}
                    >
                      <i className="fa fa-id-card-o me-2"></i>KYC Docs
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === "3" ? "active" : ""}
                      onClick={() => setActiveTab("3")}
                    >
                      <i className="fa fa-shield me-2"></i>Digital Verification
                    </NavLink>
                  </NavItem>
                </Nav>
                <hr className="mt-0" />
                <TabContent activeTab={activeTab} className="p-3 pt-0">
                  <TabPane tabId="1">
                    <Formik<CustomerFormValues>
                      initialValues={initialFormValues}
                      validationSchema={validationSchema}
                      onSubmit={handleBasicInfoSubmit}
                      enableReinitialize
                    >
                      {({
                        values,
                        handleChange,
                        handleBlur,
                        errors,
                        touched,
                        setFieldValue,
                        isSubmitting,
                      }: FormikProps<CustomerFormValues>) => (
                        <Form
                          className="theme-form"
                          onKeyDown={handleEnterToNextField}
                        >
                          <Row className="gy-0">
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  First Name{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="FirstName"
                                  placeholder="As per Aadhaar/PAN"
                                  value={values.FirstName}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.FirstName && !!errors.FirstName
                                  }
                                  innerRef={nameRef}
                                />
                                <ErrorMessage
                                  name="FirstName"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Last Name{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="LastName"
                                  placeholder="As per Aadhaar/PAN"
                                  value={values.LastName}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.LastName && !!errors.LastName
                                  }
                                />
                                <ErrorMessage
                                  name="LastName"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Date of Birth{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="date"
                                  name="DateOfBirth"
                                  value={values.DateOfBirth}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.DateOfBirth && !!errors.DateOfBirth
                                  }
                                />
                                <ErrorMessage
                                  name="DateOfBirth"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Gender <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="select"
                                  name="Gender"
                                  value={values.Gender}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={touched.Gender && !!errors.Gender}
                                >
                                  <option value="">-- Select --</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </Input>
                                <ErrorMessage
                                  name="Gender"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Mobile Number{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="MobileNo"
                                  placeholder="10-digit mobile"
                                  value={values.MobileNo}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.MobileNo && !!errors.MobileNo
                                  }
                                />
                                <ErrorMessage
                                  name="MobileNo"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>Alternate Mobile</Label>
                                <Input
                                  type="text"
                                  name="AlternateMobile"
                                  placeholder="Optional"
                                  value={values.AlternateMobile}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.AlternateMobile &&
                                    !!errors.AlternateMobile
                                  }
                                />
                                <ErrorMessage
                                  name="AlternateMobile"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>Email Address</Label>
                                <Input
                                  type="email"
                                  name="Email"
                                  placeholder="customer@email.com"
                                  value={values.Email}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={touched.Email && !!errors.Email}
                                />
                                <ErrorMessage
                                  name="Email"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Aadhaar Number{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="AadhaarNo"
                                  placeholder="XXXX-XXXX-XXXX"
                                  value={values.AadhaarNo}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.AadhaarNo && !!errors.AadhaarNo
                                  }
                                />
                                <ErrorMessage
                                  name="AadhaarNo"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  PAN Number{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="PAN"
                                  placeholder="ABCDE1234F"
                                  value={values.PAN}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={touched.PAN && !!errors.PAN}
                                />
                                <ErrorMessage
                                  name="PAN"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="12">
                              <FormGroup className="mb-0">
                                <Label>
                                  Current Address{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="CurrentAddress"
                                  placeholder="House No, Street, Area"
                                  value={values.CurrentAddress}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.CurrentAddress &&
                                    !!errors.CurrentAddress
                                  }
                                />
                                <ErrorMessage
                                  name="CurrentAddress"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  State <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="select"
                                  name="F_StateMaster"
                                  value={values.F_StateMaster}
                                  onChange={(e) =>
                                    handleStateChange(
                                      e,
                                      handleChange,
                                      setFieldValue,
                                    )
                                  }
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.F_StateMaster &&
                                    !!errors.F_StateMaster
                                  }
                                >
                                  <option value="">-- Select --</option>
                                  {dropdowns.states.length === 0 && (
                                    <option value="1">Mock State</option>
                                  )}
                                  {dropdowns.states.map((opt) => (
                                    <option key={opt.Id} value={String(opt.Id)}>
                                      {opt.Name}
                                    </option>
                                  ))}
                                </Input>
                                <ErrorMessage
                                  name="F_StateMaster"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  City <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="select"
                                  name="F_CityMaster"
                                  value={values.F_CityMaster}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.F_CityMaster &&
                                    !!errors.F_CityMaster
                                  }
                                  disabled={!values.F_StateMaster}
                                >
                                  <option value="">-- Select City --</option>
                                  {dropdowns.cities.map((opt) => (
                                    <option key={opt.Id} value={String(opt.Id)}>
                                      {opt.Name}
                                    </option>
                                  ))}
                                </Input>
                                <ErrorMessage
                                  name="F_CityMaster"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  PIN Code{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="Pincode"
                                  value={values.Pincode}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={touched.Pincode && !!errors.Pincode}
                                />
                                <ErrorMessage
                                  name="Pincode"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Occupation / Business Type{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="select"
                                  name="F_OccupationTypeMaster"
                                  value={values.F_OccupationTypeMaster}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.F_OccupationTypeMaster &&
                                    !!errors.F_OccupationTypeMaster
                                  }
                                >
                                  <option value="">-- Select --</option>
                                  {dropdowns.occupations.length === 0 && (
                                    <option value="1">Salaried</option>
                                  )}
                                  {dropdowns.occupations.length === 0 && (
                                    <option value="2">Self-Employed</option>
                                  )}
                                  {dropdowns.occupations.map((opt) => (
                                    <option key={opt.Id} value={String(opt.Id)}>
                                      {opt.Name}
                                    </option>
                                  ))}
                                </Input>
                                <ErrorMessage
                                  name="F_OccupationTypeMaster"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>Years in Business / Employed</Label>
                                <Input
                                  type="text"
                                  name="YearsInBusinessOrJob"
                                  placeholder="e.g. 5"
                                  value={values.YearsInBusinessOrJob}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.YearsInBusinessOrJob &&
                                    !!errors.YearsInBusinessOrJob
                                  }
                                />
                                <ErrorMessage
                                  name="YearsInBusinessOrJob"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Monthly Income (₹){" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="number"
                                  name="MonthlyIncome"
                                  placeholder="e.g. 25000"
                                  value={values.MonthlyIncome}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.MonthlyIncome &&
                                    !!errors.MonthlyIncome
                                  }
                                />
                                <ErrorMessage
                                  name="MonthlyIncome"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>Business Address</Label>
                                <Input
                                  type="text"
                                  name="BusinessAddress"
                                  placeholder="Business / workplace address"
                                  value={values.BusinessAddress}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.BusinessAddress &&
                                    !!errors.BusinessAddress
                                  }
                                />
                                <ErrorMessage
                                  name="BusinessAddress"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Customer Photo{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                {existingFiles.CustomerPhoto && (
                                  <div
                                    className="alert alert-info alert-sm small mb-2"
                                    style={{ padding: "6px 10px" }}
                                  >
                                    <i className="fa fa-check-circle text-success me-2"></i>
                                    Already uploaded:{" "}
                                    <strong>
                                      {existingFiles.CustomerPhoto}
                                    </strong>
                                  </div>
                                )}
                                <Input
                                  type="file"
                                  name="CustomerPhoto"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "CustomerPhoto",
                                      e.currentTarget.files?.[0],
                                    )
                                  }
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.CustomerPhoto &&
                                    !!errors.CustomerPhoto
                                  }
                                />
                                <small className="text-muted">
                                  Choose new file to replace existing one
                                </small>
                                <ErrorMessage
                                  name="CustomerPhoto"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>ITR Available?</Label>
                                <Input
                                  type="select"
                                  name="IsITRAvailable"
                                  value={values.IsITRAvailable}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.IsITRAvailable &&
                                    !!errors.IsITRAvailable
                                  }
                                >
                                  <option value="false">No</option>
                                  <option value="true">Yes</option>
                                </Input>
                                <ErrorMessage
                                  name="IsITRAvailable"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4" style={{ 
                              display: localStorage.getItem("selectedBranch") || localStorage.getItem("F_BranchOffice") ? "none" : "block" 
                            }}>
                              <FormGroup className="mb-0">
                                <Label>Branch</Label>
                                <Input
                                  type="select"
                                  name="F_Branch"
                                  value={values.F_Branch}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                >
                                  <option value="">-- Select Branch --</option>
                                  {dropdowns.branches.map((opt) => (
                                    <option key={opt.Id} value={String(opt.Id)}>
                                      {opt.Name}
                                    </option>
                                  ))}
                                </Input>
                                <ErrorMessage
                                  name="F_Branch"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4" style={{ display: "none" }}>
                              <FormGroup className="mb-0">
                                <Label>Field Unit / Centre (MFI only)</Label>
                                <Input
                                  type="select"
                                  name="F_FieldUnitCentre"
                                  value={values.F_FieldUnitCentre}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.F_FieldUnitCentre &&
                                    !!errors.F_FieldUnitCentre
                                  }
                                >
                                  <option value="">-- Select Centre --</option>
                                  {dropdowns.fieldUnits.map((opt) => (
                                    <option key={opt.Id} value={String(opt.Id)}>
                                      {opt.Name}
                                    </option>
                                  ))}
                                </Input>
                                <ErrorMessage
                                  name="F_FieldUnitCentre"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4" style={{ display: "none" }}>
                              <FormGroup className="mb-0">
                                <Label>Member Group (MFI only)</Label>
                                <Input
                                  type="select"
                                  name="F_MemberGroup"
                                  value={values.F_MemberGroup}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.F_MemberGroup &&
                                    !!errors.F_MemberGroup
                                  }
                                >
                                  <option value="">-- Select Group --</option>
                                  {dropdowns.memberGroups.map((opt) => (
                                    <option key={opt.Id} value={String(opt.Id)}>
                                      {opt.Name}
                                    </option>
                                  ))}
                                </Input>
                                <ErrorMessage
                                  name="F_MemberGroup"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            {/* Dynamic Bank Accounts Array */}
                            <Col md="12" className="mt-3">
                              <Card className="border border-primary bg-light-primary mb-0 shadow-sm">
                                <CardBody>
                                  <h6 className="mb-3 text-primary">
                                    <i className="fa fa-bank me-2"></i> Bank
                                    Account Detail (Multiple Allowed)
                                  </h6>
                                  <FieldArray name="BankAccounts">
                                    {({ push, remove }: any) => (
                                      <>
                                        {values.BankAccounts.map(
                                          (account, index) => {
                                            const rowErrors = (
                                              errors.BankAccounts as any
                                            )?.[index];
                                            const rowTouched = (
                                              touched.BankAccounts as any
                                            )?.[index];
                                            return (
                                              <Row
                                                className="gy-2 mb-3 align-items-end"
                                                key={index}
                                              >
                                                <Col md="2">
                                                  <FormGroup className="mb-0">
                                                    <Label>
                                                      Bank Name{" "}
                                                      <span className="text-danger">
                                                        *
                                                      </span>
                                                    </Label>
                                                    <Input
                                                      type="text"
                                                      name={`BankAccounts[${index}].BankName`}
                                                      placeholder="e.g. State Bank of India"
                                                      value={account.BankName}
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      invalid={
                                                        rowTouched?.BankName &&
                                                        !!rowErrors?.BankName
                                                      }
                                                    />
                                                    <ErrorMessage
                                                      name={`BankAccounts[${index}].BankName`}
                                                      component="div"
                                                      className="text-danger small mt-1"
                                                    />
                                                  </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                  <FormGroup className="mb-0">
                                                    <Label>
                                                      Account Number{" "}
                                                      <span className="text-danger">
                                                        *
                                                      </span>
                                                    </Label>
                                                    <Input
                                                      type="text"
                                                      name={`BankAccounts[${index}].AccountNumber`}
                                                      placeholder="Enter account number"
                                                      value={
                                                        account.AccountNumber
                                                      }
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      invalid={
                                                        rowTouched?.AccountNumber &&
                                                        !!rowErrors?.AccountNumber
                                                      }
                                                    />
                                                    <ErrorMessage
                                                      name={`BankAccounts[${index}].AccountNumber`}
                                                      component="div"
                                                      className="text-danger small mt-1"
                                                    />
                                                  </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                  <FormGroup className="mb-0">
                                                    <Label>
                                                      IFSC Code{" "}
                                                      <span className="text-danger">
                                                        *
                                                      </span>
                                                    </Label>
                                                    <Input
                                                      type="text"
                                                      name={`BankAccounts[${index}].IFSCCode`}
                                                      placeholder="SBIN0001234"
                                                      value={account.IFSCCode}
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      invalid={
                                                        rowTouched?.IFSCCode &&
                                                        !!rowErrors?.IFSCCode
                                                      }
                                                    />
                                                    <ErrorMessage
                                                      name={`BankAccounts[${index}].IFSCCode`}
                                                      component="div"
                                                      className="text-danger small mt-1"
                                                    />
                                                  </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                  <FormGroup className="mb-0">
                                                    <Label>Account Type</Label>
                                                    <Input
                                                      type="select"
                                                      name={`BankAccounts[${index}].F_AccountTypeMaster`}
                                                      value={
                                                        account.F_AccountTypeMaster
                                                      }
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      invalid={
                                                        rowTouched?.F_AccountTypeMaster &&
                                                        !!rowErrors?.F_AccountTypeMaster
                                                      }
                                                    >
                                                      <option value="">
                                                        -- Select --
                                                      </option>
                                                      {dropdowns.accountTypes
                                                        .length === 0 && (
                                                        <>
                                                          <option value="1">
                                                            Savings
                                                          </option>
                                                          <option value="2">
                                                            Current
                                                          </option>
                                                          <option value="3">
                                                            CC/OD
                                                          </option>
                                                        </>
                                                      )}
                                                      {dropdowns.accountTypes.map(
                                                        (opt) => (
                                                          <option
                                                            key={opt.Id}
                                                            value={String(
                                                              opt.Id,
                                                            )}
                                                          >
                                                            {opt.Name}
                                                          </option>
                                                        ),
                                                      )}
                                                    </Input>
                                                    <ErrorMessage
                                                      name={`BankAccounts[${index}].F_AccountTypeMaster`}
                                                      component="div"
                                                      className="text-danger small mt-1"
                                                    />
                                                  </FormGroup>
                                                </Col>
                                                <Col md="1">
                                                  <FormGroup className="mb-0">
                                                    <div className="form-check">
                                                      <Input
                                                        type="checkbox"
                                                        name={`BankAccounts[${index}].IsPrimary`}
                                                        checked={
                                                          account.IsPrimary
                                                        }
                                                        onChange={handleChange}
                                                        className="form-check-input"
                                                      />
                                                      <Label className="form-check-label small">
                                                        Primary
                                                      </Label>
                                                    </div>
                                                  </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                  <FormGroup className="mb-0">
                                                    {account.IsVerified ? (
                                                      <div className="d-flex align-items-center">
                                                        <i className="fa fa-check-circle text-success me-2"></i>
                                                        <span className="text-success small">
                                                          Verified
                                                        </span>
                                                      </div>
                                                    ) : (
                                                      <Btn
                                                        color="warning"
                                                        size="sm"
                                                        type="button"
                                                        onClick={() =>
                                                          handleBankVerification(
                                                            account,
                                                            index,
                                                            setFieldValue,
                                                          )
                                                        }
                                                        className="px-3"
                                                      >
                                                        <i className="fa fa-shield me-1"></i>
                                                        Verify
                                                      </Btn>
                                                    )}
                                                  </FormGroup>
                                                </Col>
                                                <Col
                                                  md="1"
                                                  className="text-end"
                                                >
                                                  {values.BankAccounts.length >
                                                    1 && (
                                                    <Btn
                                                      color="danger"
                                                      outline
                                                      type="button"
                                                      onClick={() =>
                                                        remove(index)
                                                      }
                                                      className="px-2 py-1"
                                                    >
                                                      <i className="fa fa-trash"></i>
                                                    </Btn>
                                                  )}
                                                </Col>
                                              </Row>
                                            );
                                          },
                                        )}
                                        <Row>
                                          <Col xs="12">
                                            <Btn
                                              color="primary"
                                              outline
                                              type="button"
                                              onClick={() =>
                                                push({
                                                  BankName: "",
                                                  AccountNumber: "",
                                                  IFSCCode: "",
                                                  F_AccountTypeMaster: "",
                                                  IsPrimary: false,
                                                  IsVerified: false,
                                                })
                                              }
                                              className="d-flex align-items-center gap-2"
                                            >
                                              <i className="fa fa-plus"></i> Add
                                              Another Bank Account
                                            </Btn>
                                          </Col>
                                        </Row>
                                      </>
                                    )}
                                  </FieldArray>
                                </CardBody>
                              </Card>
                            </Col>
                          </Row>
                          <div className="d-flex align-items-center gap-2 mt-4 pt-3 border-top">
                            <Btn
                              color="primary"
                              type="button"
                              onClick={() => handleMoveToNextTab(values)}
                              className="d-flex align-items-center gap-2 px-4 shadow-sm"
                            >
                              <i className="fa fa-arrow-right"></i> Move to next
                              tab
                            </Btn>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </TabPane>
                  <TabPane tabId="2">
                    <Formik<KYCFormValues>
                      initialValues={initialKYCSavedValues}
                      validationSchema={kycValidationSchema}
                      onSubmit={handleKYCSubmit}
                      enableReinitialize
                    >
                      {({
                        values,
                        handleChange,
                        handleBlur,
                        errors,
                        touched,
                        setFieldValue,
                        isSubmitting,
                      }: FormikProps<KYCFormValues>) => (
                        <Form
                          className="theme-form"
                          onKeyDown={handleEnterToNextField}
                        >
                          <Row className="g-2">
                            {/* PAN and Aadhaar Input Fields */}
                            <Col md="6">
                              <FormGroup className="mb-0">
                                <Label>
                                  PAN Number{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="PANNumber"
                                  placeholder="ABCDE1234F"
                                  value={values.PANNumber || savedData.PAN || ""}
                                  onChange={(e) => {
                                    handleChange(e);
                                    setFieldValue("PANNumber", e.target.value.toUpperCase());
                                  }}
                                  onBlur={handleBlur}
                                  invalid={touched.PANNumber && !!errors.PANNumber}
                                  style={{ fontFamily: 'monospace' }}
                                />
                                <small className="text-muted">
                                  Enter PAN for verification
                                </small>
                                <ErrorMessage
                                  name="PANNumber"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup className="mb-0">
                                <Label>
                                  Aadhaar Number{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="AadhaarNumber"
                                  placeholder="XXXX-XXXX-XXXX"
                                  value={values.AadhaarNumber || savedData.AadhaarNo || ""}
                                  onChange={(e) => {
                                    handleChange(e);
                                    // Format Aadhaar number with hyphens
                                    let value = e.target.value.replace(/\D/g, '');
                                    value = value.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
                                    setFieldValue("AadhaarNumber", value);
                                  }}
                                  onBlur={handleBlur}
                                  invalid={touched.AadhaarNumber && !!errors.AadhaarNumber}
                                  maxLength={14}
                                  style={{ fontFamily: 'monospace' }}
                                />
                                <small className="text-muted">
                                  Enter Aadhaar for verification
                                </small>
                                <ErrorMessage
                                  name="AadhaarNumber"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  ID Proof Type{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="select"
                                  name="F_ProofTypeMaster"
                                  value={values.F_ProofTypeMaster}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.F_ProofTypeMaster &&
                                    !!errors.F_ProofTypeMaster
                                  }
                                >
                                  <option value="">-- Select --</option>
                                  {dropdowns.idProofTypes.length === 0 && (
                                    <option value="1">Aadhaar Card</option>
                                  )}
                                  {dropdowns.idProofTypes.length === 0 && (
                                    <option value="2">Voter ID</option>
                                  )}
                                  {dropdowns.idProofTypes.map((opt) => (
                                    <option key={opt.Id} value={String(opt.Id)}>
                                      {opt.Name}
                                    </option>
                                  ))}
                                </Input>
                                <ErrorMessage
                                  name="F_ProofTypeMaster"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  ID Proof Front{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                {existingFiles.IDProofFront && (
                                  <div
                                    className="alert alert-info alert-sm small mb-2"
                                    style={{ padding: "6px 10px" }}
                                  >
                                    <i className="fa fa-check-circle text-success me-2"></i>
                                    Already uploaded:{" "}
                                    <strong>
                                      {existingFiles.IDProofFront}
                                    </strong>
                                  </div>
                                )}
                                <Input
                                  type="file"
                                  name="IDProofFront"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "IDProofFront",
                                      e.currentTarget.files?.[0],
                                    )
                                  }
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.IDProofFront &&
                                    !!errors.IDProofFront
                                  }
                                />
                                <small className="text-muted">
                                  Choose new file to replace existing one
                                </small>
                                <ErrorMessage
                                  name="IDProofFront"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>ID Proof Back Side</Label>
                                {existingFiles.IDProofBack && (
                                  <div
                                    className="alert alert-info alert-sm small mb-2"
                                    style={{ padding: "6px 10px" }}
                                  >
                                    <i className="fa fa-check-circle text-success me-2"></i>
                                    Already uploaded:{" "}
                                    <strong>{existingFiles.IDProofBack}</strong>
                                  </div>
                                )}
                                <Input
                                  type="file"
                                  name="IDProofBack"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "IDProofBack",
                                      e.currentTarget.files?.[0],
                                    )
                                  }
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.IDProofBack && !!errors.IDProofBack
                                  }
                                />
                                <small className="text-muted">
                                  Choose new file to replace existing one
                                </small>
                                <ErrorMessage
                                  name="IDProofBack"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Address Proof Type{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  type="select"
                                  name="F_AddressProofTypeMaster"
                                  value={values.F_AddressProofTypeMaster}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.F_AddressProofTypeMaster &&
                                    !!errors.F_AddressProofTypeMaster
                                  }
                                >
                                  <option value="">-- Select --</option>
                                  {dropdowns.addressProofTypes.length === 0 && (
                                    <option value="1">Utility Bill</option>
                                  )}
                                  {dropdowns.addressProofTypes.length === 0 && (
                                    <option value="2">Ration Card</option>
                                  )}
                                  {dropdowns.addressProofTypes.map((opt) => (
                                    <option key={opt.Id} value={String(opt.Id)}>
                                      {opt.Name}
                                    </option>
                                  ))}
                                </Input>
                                <ErrorMessage
                                  name="F_AddressProofTypeMaster"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Address Proof Upload{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                {existingFiles.AddressProofFile && (
                                  <div
                                    className="alert alert-info alert-sm small mb-2"
                                    style={{ padding: "6px 10px" }}
                                  >
                                    <i className="fa fa-check-circle text-success me-2"></i>
                                    Already uploaded:{" "}
                                    <strong>
                                      {existingFiles.AddressProofFile}
                                    </strong>
                                  </div>
                                )}
                                <Input
                                  type="file"
                                  name="AddressProofFile"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "AddressProofFile",
                                      e.currentTarget.files?.[0],
                                    )
                                  }
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.AddressProofFile &&
                                    !!errors.AddressProofFile
                                  }
                                />
                                <small className="text-muted">
                                  Choose new file to replace existing one
                                </small>
                                <ErrorMessage
                                  name="AddressProofFile"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Photograph{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                {existingFiles.Photograph && (
                                  <div
                                    className="alert alert-info alert-sm small mb-2"
                                    style={{ padding: "6px 10px" }}
                                  >
                                    <i className="fa fa-check-circle text-success me-2"></i>
                                    Already uploaded:{" "}
                                    <strong>{existingFiles.Photograph}</strong>
                                  </div>
                                )}
                                <Input
                                  type="file"
                                  name="Photograph"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "Photograph",
                                      e.currentTarget.files?.[0],
                                    )
                                  }
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.Photograph && !!errors.Photograph
                                  }
                                />
                                <small className="text-muted">
                                  Choose new file to replace existing one
                                </small>
                                <ErrorMessage
                                  name="Photograph"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>
                                  Signature Upload{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                {existingFiles.SignatureFile && (
                                  <div
                                    className="alert alert-info alert-sm small mb-2"
                                    style={{ padding: "6px 10px" }}
                                  >
                                    <i className="fa fa-check-circle text-success me-2"></i>
                                    Already uploaded:{" "}
                                    <strong>
                                      {existingFiles.SignatureFile}
                                    </strong>
                                  </div>
                                )}
                                <Input
                                  type="file"
                                  name="SignatureFile"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "SignatureFile",
                                      e.currentTarget.files?.[0],
                                    )
                                  }
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.SignatureFile &&
                                    !!errors.SignatureFile
                                  }
                                />
                                <small className="text-muted">
                                  Choose new file to replace existing one
                                </small>
                                <ErrorMessage
                                  name="SignatureFile"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-0">
                                <Label>ITR / Income Proof</Label>
                                {existingFiles.ITRProofFile && (
                                  <div
                                    className="alert alert-info alert-sm small mb-2"
                                    style={{ padding: "6px 10px" }}
                                  >
                                    <i className="fa fa-check-circle text-success me-2"></i>
                                    Already uploaded:{" "}
                                    <strong>
                                      {existingFiles.ITRProofFile}
                                    </strong>
                                  </div>
                                )}
                                <Input
                                  type="file"
                                  name="ITRProofFile"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "ITRProofFile",
                                      e.currentTarget.files?.[0],
                                    )
                                  }
                                  onBlur={handleBlur}
                                  invalid={
                                    touched.ITRProofFile &&
                                    !!errors.ITRProofFile
                                  }
                                />
                                <small className="text-muted">
                                  Choose new file to replace existing one
                                </small>
                                <ErrorMessage
                                  name="ITRProofFile"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </FormGroup>
                            </Col>

                            {/* Simple message for KYC completion */}
                            <Col md="12" className="mt-4">
                              <div className="text-center text-muted">
                                <small>
                                  <i className="fa fa-info-circle me-2"></i>
                                  Upload required KYC documents and proceed to Digital Verification
                                </small>
                              </div>
                            </Col>
                          </Row>
                          
                          <Row>
                            <Col md="12"
                              ></Col>
                          </Row>

                          <Row className="g-2">
                            <Col md="12">
                              <div className="text-center text-muted">
                                <small>
                                  <i className="fa fa-info-circle me-2"></i>
                                  Complete digital verification to enable KYC submission
                                </small>
                              </div>
                            </Col>
                          </Row>
                          <div className="d-flex align-items-center justify-content-center gap-3 mt-4 pt-3 border-top">
                            <Btn
                              color="primary"
                              type="button"
                              onClick={() => handleSubmit(values)}
                              disabled={isSubmitting}
                              className="d-flex align-items-center gap-2 px-5 py-2 shadow-sm"
                              size="lg"
                            >
                              <i className="fa fa-paper-plane"></i> Submit
                            </Btn>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </TabPane>
                  <TabPane tabId="3">
                    <div>
                      <h5 className="mb-4">
                        <i className="fa fa-shield me-2"></i>Digital Verification
                      </h5>

                      {/* PAN and Aadhaar Numbers Display */}
                      <Row className="g-3 mb-4">
                        <Col md="6">
                          <Card className="border border-primary">
                            <CardBody className="text-center">
                              <h6 className="text-primary mb-2">
                                <i className="fa fa-credit-card me-2"></i>PAN Number
                              </h6>
                              <p className="mb-0 h5 text-dark">
                                {savedKYCData.PANNumber || savedData.PAN || 'Not Provided'}
                              </p>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md="6">
                          <Card className="border border-info">
                            <CardBody className="text-center">
                              <h6 className="text-info mb-2">
                                <i className="fa fa-id-card me-2"></i>Aadhaar Number
                              </h6>
                              <p className="mb-0 h5 text-dark">
                                {savedKYCData.AadhaarNumber || savedData.AadhaarNo || 'Not Provided'}
                              </p>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>

                      {/* Verification Status Display */}
                      {(isAadhaarVerified || isPanVerified) && (
                        <Row className="mb-4">
                          <Col md="12">
                            <Card className="border border-success bg-light-success">
                              <CardBody>
                                <h6 className="text-success mb-3">
                                  <i className="fa fa-check-circle me-2"></i>Verification Status
                                </h6>
                                <Row className="g-2">
                                  {isAadhaarVerified && (
                                    <Col md="6">
                                      <div className="alert alert-success alert-sm mb-0">
                                        <strong>✅ Aadhaar Verified</strong>
                                        {referenceId && (
                                          <div className="small mt-1">
                                            Reference: {referenceId}
                                          </div>
                                        )}
                                        {uniqueId && (
                                          <div className="small">
                                            Unique ID: {uniqueId}
                                          </div>
                                        )}
                                      </div>
                                    </Col>
                                  )}
                                  {isPanVerified && (
                                    <Col md="6">
                                      <div className="alert alert-success alert-sm mb-0">
                                        <strong>✅ PAN Verified</strong>
                                        {panVerificationData && panVerificationData.data && panVerificationData.data.result && (
                                          <div className="small mt-1">
                                            Name: {panVerificationData.data.result.fullname}
                                          </div>
                                        )}
                                      </div>
                                    </Col>
                                  )}
                                </Row>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>
                      )}

                      {/* KYC Verification Data Display - Moved from Tab 2 */}
                      {kycVerificationData && (
                        <Row className="mb-4">
                          <Col md="12">
                            <Card className="border border-success bg-light-success mb-3 shadow-sm">
                              <CardBody>
                                <h5 className="mb-3 text-success">
                                  <i className="fa fa-check-circle me-2"></i>
                                  KYC Verification Completed Successfully
                                </h5>
                                
                                <Row className="g-3">
                                  {/* Personal Information */}
                                  <Col md="6">
                                    <div className="border rounded p-3 bg-white">
                                      <h6 className="text-primary mb-3">
                                        <i className="fa fa-user me-2"></i>Personal Information
                                      </h6>
                                      <p><strong>Name:</strong> {kycVerificationData.name || 'N/A'}</p>
                                      <p><strong>Date of Birth:</strong> {kycVerificationData.dob || 'N/A'}</p>
                                      <p><strong>Gender:</strong> {kycVerificationData.gender === 'M' ? 'Male' : kycVerificationData.gender === 'F' ? 'Female' : 'N/A'}</p>
                                      <p><strong>Care Of:</strong> {kycVerificationData.careOf || 'N/A'}</p>
                                      <p><strong>Masked Aadhaar:</strong> {kycVerificationData.maskedAdharNumber || 'N/A'}</p>
                                    </div>
                                  </Col>

                                  {/* Address Information */}
                                  <Col md="6">
                                    <div className="border rounded p-3 bg-white">
                                      <h6 className="text-primary mb-3">
                                        <i className="fa fa-map-marker me-2"></i>Address Information
                                      </h6>
                                      {kycVerificationData.address && (
                                        <>
                                          <p><strong>House:</strong> {kycVerificationData.address.house || 'N/A'}</p>
                                          <p><strong>Street:</strong> {kycVerificationData.address.street || 'N/A'}</p>
                                          <p><strong>Landmark:</strong> {kycVerificationData.address.landmark || 'N/A'}</p>
                                          <p><strong>Village/Town/City:</strong> {kycVerificationData.address.vtc || 'N/A'}</p>
                                          <p><strong>Sub District:</strong> {kycVerificationData.address.subdist || 'N/A'}</p>
                                          <p><strong>District:</strong> {kycVerificationData.address.dist || 'N/A'}</p>
                                          <p><strong>State:</strong> {kycVerificationData.address.state || 'N/A'}</p>
                                          <p><strong>PIN Code:</strong> {kycVerificationData.address.pc || 'N/A'}</p>
                                          <p><strong>Post Office:</strong> {kycVerificationData.address.po || 'N/A'}</p>
                                          <p><strong>Country:</strong> {kycVerificationData.address.country || 'N/A'}</p>
                                        </>
                                      )}
                                    </div>
                                  </Col>

                                  {/* Verification Details */}
                                  <Col md="12">
                                    <div className="border rounded p-3 bg-white">
                                      <h6 className="text-primary mb-3">
                                        <i className="fa fa-info-circle me-2"></i>Verification Details
                                      </h6>
                                      <Row>
                                        <Col md="6">
                                          <p><strong>Source:</strong> {verificationSource}</p>
                                          <p><strong>Reference ID:</strong> {referenceId}</p>
                                          <p><strong>Unique ID:</strong> {uniqueId}</p>
                                        </Col>
                                        <Col md="6">
                                          {kycVerificationData.pdfLink && (
                                            <p>
                                              <strong>Document:</strong> 
                                              <a 
                                                href={kycVerificationData.pdfLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary ms-2"
                                              >
                                                <i className="fa fa-download me-1"></i>Download PDF
                                              </a>
                                            </p>
                                          )}
                                          {downloadXml && (
                                            <p>
                                              <strong>XML Link:</strong> 
                                              <a 
                                                href={downloadXml} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-info ms-2"
                                              >
                                                <i className="fa fa-file-code-o me-1"></i>Download XML
                                              </a>
                                            </p>
                                          )}
                                        </Col>
                                      </Row>
                                    </div>
                                  </Col>

                                  {/* Photo Display from verification data */}
                                  {kycVerificationData.image && (
                                    <Col md="12">
                                      <div className="border rounded p-3 bg-white text-center">
                                        <h6 className="text-primary mb-3">
                                          <i className="fa fa-camera me-2"></i>Aadhaar Photo from Verification
                                        </h6>
                                        <img 
                                          src={`data:image/jpeg;base64,${kycVerificationData.image}`}
                                          alt="Aadhaar Photo from Verification"
                                          className="img-fluid rounded"
                                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                                        />
                                      </div>
                                    </Col>
                                  )}
                                </Row>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>
                      )}

                      {/* Digital Verification Buttons */}
                      <Row className="g-3 mb-4">
                        <Col md={isAadhaarVerified ? "6" : "12"}>
                          {!isAadhaarVerified ? (
                            <Btn
                              color="primary"
                              onClick={() => handleAadhaarDigitalVerification(savedKYCData.AadhaarNumber || savedData.AadhaarNo)}
                              className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                              disabled={!savedKYCData.AadhaarNumber && !savedData.AadhaarNo}
                              size="lg"
                            >
                              <i className="fa fa-id-card"></i>
                              Digital Verification Of Aadhaar
                              {(savedKYCData.AadhaarNumber || savedData.AadhaarNo) && (
                                <span className="small">({savedKYCData.AadhaarNumber || savedData.AadhaarNo})</span>
                              )}
                            </Btn>
                          ) : (
                            <Btn
                              color="success"
                              disabled
                              className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                              size="lg"
                            >
                              <i className="fa fa-check"></i>
                              Aadhaar Verified ✓
                              {(savedKYCData.AadhaarNumber || savedData.AadhaarNo) && (
                                <span className="small">({savedKYCData.AadhaarNumber || savedData.AadhaarNo})</span>
                              )}
                            </Btn>
                          )}
                        </Col>
                        
                        {/* PAN Verification - Only show after Aadhaar is verified */}
                        {isAadhaarVerified && (
                          <Col md="6">
                            {!isPanVerified ? (
                              <Btn
                                color="info"
                                onClick={() => {
                                  const panNumber = savedKYCData.PANNumber || savedData.PAN;
                                  if (panNumber && panNumber.trim()) {
                                    console.log("PAN Number to verify:", panNumber);
                                    panVerification(panNumber.trim());
                                  } else {
                                    alert("⚠️ PAN Number Required\n\nPlease enter PAN Number in previous tab for verification.");
                                  }
                                }}
                                className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                                disabled={!savedKYCData.PANNumber && !savedData.PAN}
                                size="lg"
                              >
                                <i className="fa fa-credit-card"></i>
                                Verify PAN
                                {(savedKYCData.PANNumber || savedData.PAN) && (
                                  <span className="small">({savedKYCData.PANNumber || savedData.PAN})</span>
                                )}
                              </Btn>
                            ) : (
                              <Btn
                                color="success"
                                disabled
                                className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                                size="lg"
                              >
                                <i className="fa fa-check"></i>
                                PAN Verified ✓
                                {(savedKYCData.PANNumber || savedData.PAN) && (
                                  <span className="small">({savedKYCData.PANNumber || savedData.PAN})</span>
                                )}
                              </Btn>
                            )}
                          </Col>
                        )}
                        
                        {/* Message when Aadhaar is not verified */}
                        {!isAadhaarVerified && (
                          <Col md="12" className="mt-3">
                            <div className="text-center">
                              <div className="alert alert-info mb-0">
                                <i className="fa fa-info-circle me-2"></i>
                                <strong>Step 1:</strong> Please complete Aadhaar verification first to proceed with PAN verification
                              </div>
                            </div>
                          </Col>
                        )}
                      </Row>

                      {/* Display Aadhaar Photo */}
                      {aadhaarPhoto && (
                        <Row className="mb-4">
                          <Col md="12">
                            <Card className="border border-info">
                              <CardBody className="text-center">
                                <h6 className="text-info mb-3">
                                  <i className="fa fa-image me-2"></i>Aadhaar Photo
                                </h6>
                                <img 
                                  src={`data:image/jpeg;base64,${aadhaarPhoto}`} 
                                  alt="Aadhaar Photo" 
                                  className="img-thumbnail"
                                  style={{ maxWidth: '250px', maxHeight: '250px' }}
                                />
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>
                      )}

                      {/* Submit Verification Data Button */}
                      <div className="d-flex align-items-center justify-content-center gap-3 mt-4 pt-3 border-top">
                        <Btn
                          color="success"
                          type="button"
                          onClick={handleVerificationSubmit}
                          disabled={!isAadhaarVerified || !isPanVerified}
                          className="d-flex align-items-center gap-2 px-5 py-2 shadow-sm"
                          size="lg"
                        >
                          <i className="fa fa-check-circle"></i> Submit Verification Status
                        </Btn>
                        {(!isAadhaarVerified || !isPanVerified) && (
                          <small className="text-warning">
                            <i className="fa fa-exclamation-triangle me-1"></i>
                            Complete both Aadhaar and PAN verification to enable submission
                          </small>
                        )}
                      </div>
                    </div>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CustomerRegistration;
