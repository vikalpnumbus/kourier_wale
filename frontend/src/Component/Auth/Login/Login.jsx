import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Icon from "@mdi/react";
import { mdiEye, mdiEyeOff } from "@mdi/js";
import { useAlert } from "../../../middleware/AlertContext";
import authConfig from "../../../config/Auth/AuthConfig";
import api from "../../../utils/api";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import { encrypt } from "../../../middleware/Encryption";
import company_logo from "../../../../public/themes/assets/company_image/logo_company.png";

function Login() {
  const [form, setForm] = useState({ phone: "+91", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="container-scroller">
        <div className="container-fluid page-body-wrapper full-page-wrapper">
          <div className="content-wrapper d-flex align-items-stretch auth auth-img-bg">
            <div className="row flex-grow">
              <div className="col-lg-6 d-flex align-items-center justify-content-center">
                <div className="auth-form-transparent text-left p-3">
                  
                    <img className="mb-3" src={company_logo} alt="Kourier Wale" width={180}/>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="form-group text-start mb-3">
                      <label>Phone</label>
                      <div className="input-group">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <i className="ti-user text-primary"></i>
                          </span>
                        </div>
                        <input
                          className="form-control  border-left-0"
                          placeholder="+91XXXXXXXXXX"
                          type="text"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          inputMode="numeric"
                          pattern="\+91\d{10}"
                          maxLength={13}
                        />
                      </div>
                    </div>
                    <div className="form-group text-start mb-3">
                      <label>Password</label>
                      <div className="input-group">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <i className="ti-lock text-primary"></i>
                          </span>
                        </div>
                        <input
                          className="form-control"
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                        <div className="input-group-prepend bg-transparent">
                          <span
                            className="input-group-text bg-transparent border-right-0"
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
                    </div>

                    <button
                      type="submit"
                      className="btn ripple btn-primary btn-block w-100"
                      disabled={loading}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </button>
                  </form>
                  <div className="mt-3 text-end">
                    <p className="mb-1">
                      <Link to="/forgot-password" className="text-primary">
                        Forgot password?
                      </Link>
                    </p>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="mb-0">
                      Don't have an account?{" "}
                      <Link to="/register" className="text-primary">
                        Register
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 login-half-bg d-flex flex-row">
                <p className="text-white fw-medium text-center flex-grow align-self-end">Copyright © 2021 All rights
              reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
