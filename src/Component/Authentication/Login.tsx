import { Link, useNavigate } from "react-router-dom";
import { Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { Btn, H3, H4, Image, P } from "../../AbstractElements";
import { dynamicImage } from "../../Service";
import { CreateAccount, DoNotAccount, ForgotPassword, Href, Password, RememberPassword, SignIn, SignInAccount, SignInWith } from "../../utils/Constant";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import SocialApp from "./SocialApp";
import { API_HELPER } from "../../helpers/ApiHelper";
import { API_WEB_URLS } from "../../constants/constAPI";

const USER_MASTER_LIST_URL = `${API_WEB_URLS.BASE}${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.UserMaster}/Id/0`;
const GET_COMPANIES_BY_USER_URL = (userId: string | number) =>
  `${API_WEB_URLS.BASE}${API_WEB_URLS.MASTER}/0/token/GetCompaniesByUserId/Id/${userId}`;
const LOGIN_URL = `${API_WEB_URLS.BASE}UserLogin/0/token`;

const getDataList = (response: any) =>
  response?.data?.dataList ?? response?.data?.data?.dataList ?? (Array.isArray(response?.data) ? response.data : []);

const Login = () => {
  const [show, setShow] = useState(false);
  const [userList, setUserList] = useState<any[]>([]);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [f_UserMaster, setF_UserMaster] = useState("");
  const [f_CompanyMaster, setF_CompanyMaster] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoadingUsers(true);
    fetch(USER_MASTER_LIST_URL)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          const list = getDataList(data);
          setUserList(Array.isArray(list) ? list : []);
        }
      })
      .catch(() => {
        if (!cancelled) setUserList([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchCompaniesByUser = useCallback((userId: string) => {
    if (!userId || userId === "0") {
      setCompanyList([]);
      setF_CompanyMaster("");
      return;
    }
    setLoadingCompanies(true);
    setF_CompanyMaster("");
    fetch(GET_COMPANIES_BY_USER_URL(userId))
      .then((res) => res.json())
      .then((data) => {
        const list = getDataList(data);
        setCompanyList(Array.isArray(list) ? list : []);
      })
      .catch(() => setCompanyList([]))
      .finally(() => setLoadingCompanies(false));
  }, []);

  useEffect(() => {
    fetchCompaniesByUser(f_UserMaster);
  }, [f_UserMaster, fetchCompaniesByUser]);

  const SimpleLoginHandle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!f_UserMaster || f_UserMaster === "0") {
      toast.error("Please select User.");
      return;
    }
    if (!f_CompanyMaster || f_CompanyMaster === "0") {
      toast.error("Please select Company.");
      return;
    }
    if (!userName.trim()) {
      toast.error("User Name is required.");
      return;
    }
    if (!password) {
      toast.error("Password is required.");
      return;
    }
    const formData = new FormData();
    formData.append("F_UserMaster", String(f_UserMaster));
    formData.append("F_CompanyMaster", String(f_CompanyMaster));
    formData.append("UserName", userName.trim());
    formData.append("UserPassword", password);
    try {
      const response = await API_HELPER.apiPOST_Multipart(LOGIN_URL, formData);
      const userData = response?.data?.response?.[0];
      const isSuccess = response?.success === true && response?.status === 200 && userData?.Id;
      const loginMessage = userData?.Message;
      if (isSuccess && (loginMessage === "Login Successful" || userData?.LoginStatus === 1)) {
        localStorage.setItem("authUser", JSON.stringify(userData));
        localStorage.setItem("login", JSON.stringify(true));
        toast.success(loginMessage || "Login Successful");
        navigate(`${process.env.PUBLIC_URL}/voucherEntry`);
      } else {
        toast.error(response?.message || loginMessage || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to login. Please try again.");
    }
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
                  <P>{"Select user, company and enter credentials to login"}</P>
                  <FormGroup>
                    <Label className="col-form-label">User Master <span className="text-danger">*</span></Label>
                    <Input
                      type="select"
                      required
                      value={f_UserMaster}
                      onChange={(e) => setF_UserMaster(e.target.value)}
                      disabled={loadingUsers}
                    >
                      <option value="">Select User</option>
                      {userList.map((u: any) => (
                        <option key={u?.Id} value={u?.Id}>
                          {u?.UserName ?? u?.Name ?? u?.Email ?? `User ${u?.Id}`}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label className="col-form-label">Company <span className="text-danger">*</span></Label>
                    <Input
                      type="select"
                      required
                      value={f_CompanyMaster}
                      onChange={(e) => setF_CompanyMaster(e.target.value)}
                      disabled={!f_UserMaster || loadingCompanies}
                    >
                      <option value="">Select Company</option>
                      {companyList
                        .filter((c: any) => c?.F_CompanyMaster != null && c?.F_CompanyMaster !== "")
                        .map((c: any, idx: number) => (
                          <option key={c?.Id ?? idx} value={String(c.F_CompanyMaster)}>
                            {c?.CompanyName ?? c?.Name ?? `Company ${c.F_CompanyMaster}`}
                          </option>
                        ))}
                    </Input>
                  </FormGroup>
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
                    {/* <div className="checkbox p-0">
                      <Input id="checkbox1" type="checkbox" />
                      <Label className="text-muted" htmlFor="checkbox1">
                        {RememberPassword}
                      </Label>
                    </div>
                    <Link to={`${process.env.PUBLIC_URL}/pages/samplepage`}>{ForgotPassword}</Link> */}
                    <div className="text-end mt-3 login-submit-wrap">
                      <Btn color="primary" block className="w-100 login-submit-btn" type="submit">
                        {SignIn}
                      </Btn>
                    </div>
                  </FormGroup>
                  {/* <H4 className="text-muted mt-4 or">{SignInWith}</H4>
                  <SocialApp />
                  <P className="mt-4 mb-0 text-center">
                    {DoNotAccount}
                    <Link className="ms-2" to={`${process.env.PUBLIC_URL}/pages/samplepage`}>
                      {CreateAccount}
                    </Link>
                  </P> */}
                </Form>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;