import { Link, useNavigate } from "react-router-dom";
import { Col, Container, Form, FormGroup, Input, Label, Row, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Btn, H3, H4, Image, P } from "../../AbstractElements";
import { dynamicImage } from "../../Service";
import { CreateAccount, DoNotAccount, ForgotPassword, Href, Password, RememberPassword, SignIn, SignInAccount, SignInWith } from "../../utils/Constant";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import SocialApp from "./SocialApp";
import { API_HELPER } from "../../helpers/ApiHelper";
import { API_WEB_URLS } from "../../constants/constAPI";

const LOGIN_URL = `${API_WEB_URLS.BASE}AdminLogin/0/token`;

const Login = () => {
  const [show, setShow] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchList, setBranchList] = useState<{ id: string; name: string }[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [tempUserData, setTempUserData] = useState<any>(null);
  const navigate = useNavigate();

  const SimpleLoginHandle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userName.trim()) {
      toast.error("User Name is required.");
      return;
    }
    if (!password) {
      toast.error("Password is required.");
      return;
    }
    const formData = new FormData();
    formData.append("UserName", userName.trim());
    formData.append("UserPassword", password);

    try {
      const response = await API_HELPER.apiPOST_Multipart(LOGIN_URL, formData);
      const userData = response?.data?.response?.[0] || response?.data?.dataList?.[0] || response?.data?.[0] || response?.data;
      const isSuccess = response?.success === true && response?.status === 200 && (userData?.Id || userData?.UserId || userData?.LoginStatus === 1);
      const loginMessage = userData?.Message || response?.message;
      if (isSuccess && (loginMessage === "Login Successful" || userData?.LoginStatus === 1 || userData?.Id)) {
        const branchIds = userData?.F_BranchOffice ? String(userData.F_BranchOffice).split(",").map(s => s.trim()).filter(Boolean) : [];
        const branchNames = userData?.BranchOfficeNames ? String(userData.BranchOfficeNames).split(",").map(s => s.trim()).filter(Boolean) : [];
        
        let branches = [];
        for (let i = 0; i < Math.max(branchIds.length, branchNames.length); i++) {
          if (branchIds[i] || branchNames[i]) {
            branches.push({
              id: branchIds[i] || "",
              name: branchNames[i] || `Branch ${branchIds[i] || i}`
            });
          }
        }

        if (branches.length > 1) {
          setBranchList(branches);
          setTempUserData(userData);
          setShowBranchModal(true);
          toast.success("Please select a branch to continue.");
        } else {
          localStorage.setItem("authUser", JSON.stringify(userData));
          if (branches.length === 1) {
            localStorage.setItem("selectedBranch", JSON.stringify(branches[0]));
            localStorage.setItem("F_BranchOffice", branches[0].id);
          } else {
            localStorage.setItem("selectedBranch", JSON.stringify({ id: "", name: "Default Branch" }));
            localStorage.setItem("F_BranchOffice", "");
          }
          localStorage.setItem("login", JSON.stringify(true));
          toast.success(loginMessage || "Login Successful");
          navigate(`${process.env.PUBLIC_URL}/voucherEntry`);
        }
      } else {
        toast.error(response?.message || loginMessage || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to login. Please try again.");
    }
  };

  const handleBranchSelect = () => {
    if (!selectedBranchId) {
      toast.error("Please select a branch.");
      return;
    }
    const selectedBranch = branchList.find(b => b.id === selectedBranchId);
    if (!selectedBranch) return;

    localStorage.setItem("authUser", JSON.stringify(tempUserData));
    localStorage.setItem("selectedBranch", JSON.stringify(selectedBranch));
    localStorage.setItem("F_BranchOffice", selectedBranch.id);
    localStorage.setItem("login", JSON.stringify(true));
    setShowBranchModal(false);
    toast.success("Login Successful");
    navigate(`${process.env.PUBLIC_URL}/voucherEntry`);
  };

  return (
    <Container fluid className="p-0">
      <style>{`
        @media (max-width: 991.98px) {
          .login-card {
            align-items: flex-start !important;
            overflow-y: auto !important;
            padding-top: 24px !important;
            padding-bottom: 24px !important;
            min-height: 100vh !important;
          }
          .login-card .login-main {
            margin-top: 0 !important;
          }
          .login-card .theme-form .btn,
          .login-card .theme-form button[type="submit"],
          .login-card .theme-form .btn-primary,
          .login-card .login-submit-btn,
          .login-card .login-submit-wrap .btn {
            display: block !important;
            width: 100% !important;
            visibility: visible !important;
            opacity: 1 !important;
            max-width: 100% !important;
          }
          .login-card .login-submit-wrap {
            display: block !important;
            width: 100% !important;
            margin-top: 1rem !important;
          }
        }
      `}</style>
      <Row className="m-0">
        <Col xs="12" className="p-0">
          <div className="login-card login-dark">
            <div>
              <div>
                <Link className="logo text-center" to={Href}>
                  {/* <Image className="img-fluid for-light" src={dynamicImage("logo/logo-1.png")} alt="looginpage" /> */}
                  {/* <Image className="img-fluid for-dark" src={dynamicImage("logo/logo.png")} alt="looginpage" /> */}
                  <h1>Task Management</h1>
                  
                </Link>
              </div>
              <div className="login-main">
                <Form className="theme-form" onSubmit={(e) => SimpleLoginHandle(e)}>
                  <H3>{SignInAccount}</H3>
                  <P>{"Enter your credentials to login"}</P>
                  <FormGroup>
                    <Label className="col-form-label">User Name <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      required
                      placeholder="User Name"
                      value={userName}
                      name="userName"
                      onChange={(e) => setUserName(e.target.value)}
                    />  
                  </FormGroup>
                  <FormGroup>
                    <Label className="col-form-label">{Password} <span className="text-danger">*</span></Label>
                    <div className="form-input position-relative">
                      <Input
                        type={show ? "text" : "password"}
                        required
                        placeholder="*********"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        name="password"
                      />
                      <div className="show-hide" onClick={() => setShow(!show)}>
                        <span className="show"> </span>
                      </div>
                    </div>
                  </FormGroup>
                  <FormGroup className="mb-0 form-sub-title">
                    <div className="text-end mt-3 login-submit-wrap">
                      <Btn color="primary" block className="w-100 login-submit-btn" type="submit">
                        {SignIn}
                      </Btn>
                    </div>
                  </FormGroup>
                </Form>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Modal isOpen={showBranchModal} toggle={() => setShowBranchModal(false)} backdrop="static" keyboard={false}>
        <ModalHeader>Select Branch</ModalHeader>
        <ModalBody>
          <FormGroup className="mb-0">
            <Label>Available Branches <span className="text-danger">*</span></Label>
            <Input
              type="select"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              <option value="">-- Select Branch --</option>
              {branchList.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Btn color="primary" onClick={handleBranchSelect}>Continue to Login</Btn>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default Login;