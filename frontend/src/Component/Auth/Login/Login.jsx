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
import ChannelConfig from "../../../config/Channel/ChannelConfig";
import "../../../assets/auth/auth.css"

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? ""
      : "Please enter a valid email address.";
  };
  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push("Password must be at least 8 characters.");
    return errors;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(form.email);
    if (emailError) return showError(emailError);
    const pwdErrors = validatePassword(form.password);
    if (pwdErrors.length) return showError(pwdErrors.join(" "));
    setLoading(true);
    try {
      const { data } = await axios.post(authConfig.loginApi, form);
      await getToken(data.data.authCode);
    } catch (err) {
      showError("Invalid credentials");
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
    } catch {
      showError("Failed to retrieve token.");
    }
  };
  const handleFetchData = async () => {
    try {
      const response = await api.get(companyDetailsConfig.companyDetails);
      const data = response?.data?.data?.companyDetails || {};
      localStorage.setItem("role", encrypt(data?.role));
      handleFetchChannel();
      if (data?.role === "admin") navigate("/admin");
      else navigate("/");
    } catch {}
  };
  const handleFetchChannel = async () => {
    try {
      await api.post(ChannelConfig.channelFetchApi, {
        channel: "shopify",
      });
    } catch {}
  };
  return (
    <div className="auth-shell">
      <div className="left-panel">
        <div className="glow-bl"></div>
        <div className="glow-tr"></div>
        <div className="left-logo">
          <div className="logo-wordmark">
            vey<span className="go">go</span>
          </div>
        </div>
        <div className="left-centre">
          <div className="hero-display">
            BUILT FOR <br />
            <span className="blue">SHIPPERS.</span>
          </div>
          <div className="hero-accent">
            India's most reliable shipping platform
          </div>
        </div>
      </div>
      <div className="right-panel">
        <div className="form-wrap">
          <form onSubmit={handleSubmit}>
            <div className="form-title">
              Sign in to <span className="blue">your account</span>
            </div>
            <div className="field">
              <label className="field-label">Email</label>
              <div className="input-wrap">
                <input
                  type="email"
                  name="email"
                  className="field-input"
                  placeholder="you@yourbrand.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <div className="input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="field-input has-suffix"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                />
                <div
                  className="input-suffix"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.7} />
                </div>
              </div>
            </div>
            <div className="options-row">
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className={`btn-cta ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              <span className="btn-text">
                {loading ? "Signing in..." : "Sign In"}
              </span>
              <div className="btn-spinner"></div>
            </button>
            <div className="bottom-toggle">
              Don’t have an account?{" "}
              <Link to="/register">Create account →</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Login;