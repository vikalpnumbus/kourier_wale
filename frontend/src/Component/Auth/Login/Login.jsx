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
          <div className="orbit orbit-1"></div>
          <div className="orbit orbit-2"></div>
          <div className="starfield" id="starfield"></div>
          <div className="left-logo">
            <svg viewBox="0 0 72 72" width="36" height="36" fill="none">
              <circle cx="36" cy="36" r="34" fill="rgba(61,107,255,0.13)"/>
              <path d="M25 18 Q25 10 36 10 Q47 10 47 18" stroke="#fff" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.4"/>
              <path d="M16 22 L36 52 L56 22" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <path d="M16 22 Q8 30 11 42" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.3"/>
              <path d="M56 22 Q64 30 61 42" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.3"/>
              <circle cx="36" cy="52" r="4" fill="#fff"/>
            </svg>
            <div className="logo-wordmark">vey<span className="go">go</span></div>
          </div>
          <div className="left-centre">
            <div className="hero-display">
              BUILT FOR
              <br/>
              <span className="blue">SHIPPERS.</span><br/>
              TRUSTED BY<br/>
              THOUSANDS.
            </div>
            <div className="hero-accent">
              India's most reliable shipping platform —<br/>
              so you can focus on growing your business.
            </div>
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-val">20<span className="u">+</span></div>
                <div className="stat-lbl">Courier partners</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">5<span className="u">L+</span></div>
                <div className="stat-lbl">Shipments/month</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">98<span className="u">%</span></div>
                <div className="stat-lbl">Delivery success</div>
              </div>
            </div>
            <div className="trust-promises">
              <div className="promise-item">
                <div className="promise-icon mercury-bg">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L11.5 3.5v4C11.5 10 9.5 12 7 13 4.5 12 2.5 10 2.5 7.5v-4L7 1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                    <path d="M4.5 7l2 2 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div className="promise-text">
                  <div className="promise-title">Your data is fully secured</div>
                  <div className="promise-sub">256-bit encryption. Your business information belongs only to you — always.</div>
                </div>
              </div>

              <div className="promise-item">
                <div className="promise-icon venus-bg">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1.5v11M4 5h5a2 2 0 010 4H4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div className="promise-text">
                  <div className="promise-title">100% transparent payments</div>
                  <div className="promise-sub">Every rupee tracked. No hidden charges. No surprises on your billing — ever.</div>
                </div>
              </div>

              <div className="promise-item">
                <div className="promise-icon gold-bg">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/>
                    <path d="M7 4v3.5l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                </div>
                <div className="promise-text">
                  <div className="promise-title">We are here 24 × 7 for you</div>
                  <div className="promise-sub">Real support, real people. Reach us anytime — we never close when you need help.</div>
                </div>
              </div>

            </div>
          </div>
          <div className="left-bottom">
            <div className="testimonial">
              <div className="testi-stars">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <div className="testi-quote">
                "Switched to Veygo six months ago. Shipping costs dropped by 31% and I haven't had a single unresolved issue. Their team genuinely cares."
              </div>
              <div className="testi-author">
                <div className="testi-avatar">AK</div>
                <div>
                  <div className="testi-name">Aryan Kapoor</div>
                  <div className="testi-co">FOUNDER · THREADMILL INDIA</div>
                </div>
              </div>
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