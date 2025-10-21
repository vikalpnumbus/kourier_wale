import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Icon from "@mdi/react";
import { mdiEye, mdiEyeOff, mdiLockOutline } from "@mdi/js";
import { useAlert } from "../../../middleware/AlertContext";
import authConfig from "../../../config/Auth/AuthConfig";
import api from "../../../utils/api";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import { encrypt } from "../../../middleware/Encryption";
import backgroundLogisticsImage from "../../../assets/image/logisticsBackground.jpg";
import backgroundLogisticsIcons from "../../../assets/image/logisticsIcons.png";

function Login() {
  const [form, setForm] = useState({ phone: "+91", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [carouselStep, setCarouselStep] = useState(0);
  const { showError, showSuccess } = useAlert();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8 || pwd.length > 64)
      errors.push("Password must be between 8 and 64 characters.");
    if (!/[A-Z]/.test(pwd))
      errors.push("Password must contain at least one uppercase letter.");
    if (!/[a-z]/.test(pwd))
      errors.push("Password must contain at least one lowercase letter.");
    if (!/[0-9]/.test(pwd))
      errors.push("Password must contain at least one number.");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pwd))
      errors.push("Password must contain at least one special character.");
    return errors;
  };

  const validatePhone = (num) => {
    return /^\+91[6-9]\d{9}$/.test(num)
      ? ""
      : "Phone must be in the format +91XXXXXXXXXX (Indian number).";
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phone") {
      value = value.replace(/\D/g, "");
      if (!value.startsWith("91")) {
        value = "91" + value;
      }
      value = "+".concat(value);
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone
    const phoneError = validatePhone(form.phone);
    if (phoneError) return showError(phoneError);

    // Validate password
    const pwdErrors = validatePassword(form.password);
    if (pwdErrors.length) return showError(pwdErrors.join(" "));

    setLoading(true);
    try {
      const { data } = await axios.post(authConfig.loginApi, form);
      await getToken(data.data.authCode);
    } catch (err) {
      showError(
        err?.response?.data?.message || err?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const getToken = async (code) => {
    try {
      const { data } = await axios.get(authConfig.getTokenApi, {
        params: { authCode: code },
      });
      localStorage.setItem("token", data.data.token);
      handleFetchData();
      showSuccess("Logged in successfully!");
    } catch (err) {
      console.error(err);
      showError("Failed to retrieve token. Please try again.");
    }
  };

  const handleFetchData = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const response = await api.get(companyDetailsConfig.companyDetails);
      const data = response?.data?.data?.companyDetails || {};
      localStorage.setItem("role", encrypt(data?.role));
      if (data?.role === "admin") navigate("/admin");
      else if (data?.role === "user") navigate("/");
    } catch (error) {
      console.error("Company Details Fetch Error:", error);
    }
  };

  return (
    <>
      {2 == 0 ? (
        <div className="container-scroller">
          <div
            className={`container-fluid page-body-wrapper full-page-wrapper`}
          >
            <div className={"main-panel w-100"}>
              <div
                className={`content-wrapper p-4 d-flex align-items-center auth px-0 `}
              >
                <div className="row w-100 mx-0">
                  <div className="col-xl-3 col-lg-5 col-md-5 d-block mx-auto">
                    <div className="text-center mb-2">
                      {/* <a href="/" className="custom-logo">
                    <img
                      src="../assets/images/brand-logos/desktop-logo.png"
                      className="desktop-logo"
                      alt="logo"
                    />
                    <img
                      src="../assets/images/brand-logos/desktop-dark.png"
                      className="desktop-dark"
                      alt="logo"
                    />
                  </a> */}
                      LOGO
                    </div>
                    <div className="card custom-card">
                      <div className="card-body pd-45">
                        <h5 className="text-center">Sign in to Your Account</h5>
                        <form onSubmit={handleSubmit}>
                          <div className="form-group text-start mb-3">
                            <label>Phone</label>
                            <input
                              className="form-control"
                              placeholder="+91XXXXXXXXXX"
                              type="tel"
                              name="phone"
                              value={form.phone}
                              onChange={handleChange}
                              required
                              inputMode="numeric"
                              pattern="\+91\d{10}"
                              maxLength={13}
                            />
                          </div>
                          <div className="form-group text-start mb-3">
                            <label>Password</label>
                            <div className="input-group">
                              <input
                                className="form-control"
                                placeholder="Enter your password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                              />
                              <span
                                className="input-group-text"
                                style={{ cursor: "pointer" }}
                                onClick={() => setShowPassword((prev) => !prev)}
                              >
                                {showPassword ? (
                                  <Icon path={mdiEyeOff} size={0.7} />
                                ) : (
                                  <Icon path={mdiEye} size={0.7} />
                                )}
                              </span>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="btn ripple btn-primary btn-block w-100"
                            disabled={loading}
                          >
                            {loading ? "Signing In..." : "Sign In"}
                          </button>
                        </form>
                        <div className="mt-3 text-center">
                          <p className="mb-1">
                            <Link
                              to="/forgot-password"
                              className="text-primary"
                            >
                              Forgot password?
                            </Link>
                          </p>
                          <p className="mb-0">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary">
                              Register
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: `url(${backgroundLogisticsImage}) 0% 0% / cover no-repeat`,
            height: "100vh",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: "100vh",
              width: "100vw",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "auto",
              font: "400 16px/1.4 ManropeRegular",
              backdropFilter: "blur(30px)",
              backgroundColor: "#00000025",
              borderRadius: "10px",
              padding: "1em 10em",
              color: "white",
            }}
          >
            <div style={{ textAlign: "left", flex: "0 0 60%" }}>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "26px",
                  textTransform: "uppercase",
                }}
              >
                Welcome To
              </p>
              <h1>Kourier Waale</h1>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "26px",
                  textTransform: "uppercase",
                }}
              >
                REDEFINING THE WAY YOU SHIP
              </p>
              <button
                type="submit"
                style={{
                  backgroundColor: "orange",
                  padding: ".7rem 1rem",
                  borderRadius: "10px",
                  color: "#fff",
                  margin: 0,
                  fontSize: "15px",
                  transitionProperty: "all",
                  transitionDuration: ".2s",
                  transitionTimingFunction: "cubic-bezier(.215, .61, .355, 1)",
                  border: "1px solid orange",
                  fontFamily: "ManropeMed",
                  display: "inline-flex",
                  width: "fit-ontent",
                  gap: "12px",
                  alignItems: "center",
                  marginTop: "15px",
                  justifyContent: "center",
                  minWidth: "200px",
                }}
                onClick={() => setCarouselStep("login")}
              >
                Register Now →
              </button>
            </div>
            {carouselStep == 0 && (
              <div style={{ flex: "0 0 40%", textAlign: "center" }}>
                <h2>WHERE SHIPPING MEETS YOUR NEEDS</h2>
                <img
                  src={backgroundLogisticsIcons}
                  style={{ filter: "invert(1)" }}
                />
              </div>
            )}
            {carouselStep != 0 && (
              <div style={{ flex: "0 0 40%", textAlign: "center" }}>
                <center>
                  <div
                    style={{
                      height: "100px",
                      width: "100px",
                      background: "white",
                      borderRadius: "50%",
                      color: "black",
                      position: "relative",
                      zIndex: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <p>
                      <Icon path={mdiLockOutline} size={1.5} />
                    </p>
                  </div>

                  <div
                    style={{
                      width: "30vw",
                      background: "white",
                      borderRadius: "5%",
                      color: "black",
                      position: "relative",
                      zIndex: 1,
                      top: "-50px",
                      paddingTop: "40px",
                      paddingBottom: "50px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <button
                        type="submit"
                        style={{
                          ...(carouselStep === "login"
                            ? {
                                backgroundColor: "orange",
                                color: "#fff",
                                border: "1px solid orange",
                              }
                            : {
                                backgroundColor: "white",
                                color: "orange",
                                border: "1px solid orange",
                              }),
                          padding: ".7rem 1rem",
                          borderRadius: "10px",
                          margin: 0,
                          fontSize: "15px",
                          transitionProperty: "all",
                          transitionDuration: ".2s",
                          transitionTimingFunction:
                            "cubic-bezier(.215, .61, .355, 1)",
                          fontFamily: "ManropeMed",
                          display: "inline-flex",
                          width: "fit-ontent",
                          gap: "12px",
                          alignItems: "center",
                          marginTop: "15px",
                          justifyContent: "center",
                          minWidth: "200px",
                        }}
                        onClick={() => setCarouselStep("login")}
                      >
                        Login
                      </button>
                      <button
                        type="submit"
                        style={{
                          ...(carouselStep == "register"
                            ? {
                                backgroundColor: "orange",
                                color: "#fff",
                                border: "1px solid orange",
                              }
                            : {
                                backgroundColor: "white",
                                color: "orange",
                                border: "1px solid orange",
                              }),
                          padding: ".7rem 1rem",
                          borderRadius: "10px",
                          margin: 0,
                          fontSize: "15px",
                          transitionProperty: "all",
                          transitionDuration: ".2s",
                          transitionTimingFunction:
                            "cubic-bezier(.215, .61, .355, 1)",
                          fontFamily: "ManropeMed",
                          display: "inline-flex",
                          width: "fit-ontent",
                          gap: "12px",
                          alignItems: "center",
                          marginTop: "15px",
                          justifyContent: "center",
                          minWidth: "200px",
                        }}
                        onClick={() => setCarouselStep("register")}
                      >
                        SignUp
                      </button>
                    </div>
                    {carouselStep == "login" && (
                      <>
                        <div>
                          <div>
                            <div>
                              <div
                                className={`p-4 d-flex align-items-center auth px-0 `}
                              >
                                <div className="row w-100 mx-0">
                                  <div className="col-xl-12 col-lg-12 col-md-12 d-block mx-auto">
                                    <div className="card custom-card">
                                      <div className="card-body pd-45">
                                        <h5 className="text-center">
                                          Sign in to Your Account
                                        </h5>
                                        <form onSubmit={handleSubmit}>
                                          <div className="form-group text-start mb-3">
                                            <label>Phone</label>
                                            <input
                                              className="form-control"
                                              placeholder="+91XXXXXXXXXX"
                                              type="tel"
                                              name="phone"
                                              value={form.phone}
                                              onChange={handleChange}
                                              required
                                              inputMode="numeric"
                                              pattern="\+91\d{10}"
                                              maxLength={13}
                                            />
                                          </div>
                                          <div className="form-group text-start mb-3">
                                            <label>Password</label>
                                            <div className="input-group">
                                              <input
                                                className="form-control"
                                                placeholder="Enter your password"
                                                type={
                                                  showPassword
                                                    ? "text"
                                                    : "password"
                                                }
                                                name="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                required
                                              />
                                              <span
                                                className="input-group-text"
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>
                                                  setShowPassword(
                                                    (prev) => !prev
                                                  )
                                                }
                                              >
                                                {showPassword ? (
                                                  <Icon
                                                    path={mdiEyeOff}
                                                    size={0.7}
                                                  />
                                                ) : (
                                                  <Icon
                                                    path={mdiEye}
                                                    size={0.7}
                                                  />
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          <button
                                            type="submit"
                                            className="btn ripple btn-primary btn-block w-100"
                                            disabled={loading}
                                            style={{
                                              backgroundColor: "white",
                                              color: "orange",
                                              border: "1px solid orange",
                                              padding: ".7rem 1rem",
                                              borderRadius: "10px",
                                              margin: 0,
                                              fontSize: "15px",
                                              transitionProperty: "all",
                                              transitionDuration: ".2s",
                                              transitionTimingFunction:
                                                "cubic-bezier(.215, .61, .355, 1)",
                                              fontFamily: "ManropeMed",
                                              display: "inline-flex",
                                              width: "fit-ontent",
                                              gap: "12px",
                                              alignItems: "center",
                                              marginTop: "15px",
                                              justifyContent: "center",
                                              minWidth: "200px",
                                            }}
                                          >
                                            {loading
                                              ? "Logging In..."
                                              : "Login"}
                                          </button>
                                        </form>
                                        <div className="mt-3 text-center">
                                          <p className="mb-1">
                                            <Link
                                              to="/forgot-password"
                                              className="text-primary"
                                            >
                                              Forgot password?
                                            </Link>
                                          </p>
                                          <p className="mb-0">
                                            Don't have an account?{" "}
                                            <Link
                                              to="/register"
                                              className="text-primary"
                                            >
                                              Register
                                            </Link>
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {carouselStep == "register" && <p>SignUp Form</p>}
                  </div>
                </center>
              </div>
            )}
            <div></div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
