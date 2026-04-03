import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Icon from "@mdi/react";
import { mdiEye, mdiEyeOff, mdiPencil } from "@mdi/js";
import { useAlert } from "../../../middleware/AlertContext";
import authConfig from "../../../config/Auth/AuthConfig";
import { encrypt } from "../../../middleware/Encryption";
import company_logo from "../../../../public/themes/assets/company_image/veygo-logo.svg";
import "../../../assets/auth/auth.css"

function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
    confirmPassword: "",
    shippingVolume: "",
  });
  const { showError, showSuccess } = useAlert();

  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const shippingOptions = ["0-100", "100-1000", "1000 or above"];

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Invalid email address.";

  const validateCompanyName = (name) => {
    const pattern = /^[A-Za-z\s'-]+$/;
    return pattern.test(name);
  };

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

  const handleChange = (e) => {
  let { name, value } = e.target;
  if (name === "phone") {
    value = value.replace(/\D/g, "");
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
  }
  setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep1 = async (e) => {
    e.preventDefault();
    showError("");

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      return showError("Please enter a valid 10-digit mobile number.");
    }

    const emailError = validateEmail(form.email);
    if (emailError) return showError(emailError);

    const companyError = validateCompanyName(form.companyName);
    if (!companyError)
      return showError(
        "Company name should only contain alphabets, spaces, apostrophes, or hyphens."
      );

    const pwdErrors = validatePassword(form.password);
    if (pwdErrors.length) return showError(pwdErrors.join(" "));

    if (form.password !== form.confirmPassword) {
      return showError("Passwords do not match.");
    }

    if (!shippingOptions.includes(form.shippingVolume)) {
      return showError("Invalid shipping volume option.");
    }

    try {
      setLoading(true);
      await axios.post(authConfig.registerStep1Api, {
        ...form,
        phone: `+91${form.phone}`,
      });
      setStep(3);
    } catch (err) {
      showError(
        err?.response?.data?.message[0]?.message ||
          err?.response?.data?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtpVerify = async (e) => {
    e.preventDefault();
    showError("");

    if (!phoneOtp.trim())
      return showError("Please enter the OTP sent to your phone number.");
    if (!form.phone.trim()) return showError("Please enter the phone number.");

    try {
      setLoading(true);
      await axios.post(authConfig.registerStep2Api, {
        to: form.phone,
        otp: phoneOtp,
        type: "phone",
      });
      setStep(3);
    } catch (err) {
      if (Array.isArray(err?.response?.data?.message)) {
        showError(err?.response?.data?.message[0].message);
      } else {
        const errorMsg =
          typeof err?.response?.data?.message === "string"
            ? err.response.data.message
            : typeof err?.response?.data === "string"
            ? err.response.data
            : "Something went wrong";

        showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpVerify = async (e) => {
    e.preventDefault();
    showError("");

    if (!emailOtp.trim()) return showError("Email OTP is required.");
    if (!form.email.trim()) return showError("Please enter the email.");

    try {
      setLoading(true);
      const { data } = await axios.post(authConfig.registerStep2Api, {
        to: form.email,
        otp: emailOtp,
        type: "email",
      });
      await getToken(data.data.authCode);
    } catch (err) {
      if (Array.isArray(err?.response?.data?.message)) {
        showError(err?.response?.data?.message[0].message);
      } else {
        const errorMsg =
          typeof err?.response?.data?.message === "string"
            ? err.response.data.message
            : typeof err?.response?.data === "string"
            ? err.response.data
            : "Something went wrong";

        showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (type) => {
    if (type === "phone" && !form.phone.trim())
      return showError("Please enter the phone number.");
    if (type === "email" && !form.email.trim())
      return showError("Please enter the email.");
    try {
      await axios.post(authConfig.resendOtpApi, {
        to: type === "phone" ? form.phone : form.email,
        type: type,
      });
      alert(`OTP send to ${type}.`);
    } catch (err) {
      console.log("err: ", err);
      showError(err?.response?.data?.message || "Invalid OTP.");
    }
  };

  const getToken = async (code) => {
    try {
      const { data } = await axios.get(authConfig.getTokenApi, {
        params: { authCode: code },
      });
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("role", encrypt("user"));
      showSuccess("You're registered successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Error fetching token:", err);
      showError("Failed to retrieve token. Please try again.");
    }
  };

  useEffect(() => {
    showError("");
  }, [step]);
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
            <path d="M25 18 Q25 10 36 10 Q47 10 47 18" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.4"/>
            <path d="M16 22 L36 52 L56 22" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M16 22 Q8 30 11 42" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.3"/>
            <path d="M56 22 Q64 30 61 42" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.3"/>
            <circle cx="36" cy="52" r="4" fill="#fff"/>
          </svg>
          <div className="logo-wordmark">vey<span className="go">go</span></div>
        </div>
        <div className="left-centre">
          <div className="hero-display">
            BUILT FOR<br/>
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
                  <path d="M7 1L11.5 3.5v4C11.5 10 9.5 12 7 13 4.5 12 2.5 10 2.5 7.5v-4L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <path d="M7 1.5v11M4 5h5a2 2 0 010 4H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
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

    {/* RIGHT PANEL */}
    <div className="right-panel">
      <div className="form-wrap">

        {/* REGISTER FORM */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="form-page active">

            <div className="form-eyebrow">Start for free</div>
            <div className="form-title">
              Create your <span className="blue">account</span>
            </div>

            <div className="field-group">

              {/* NAME */}
              <div className="field-row">
                <div className="field">
                  <label className="field-label">First Name</label>
                  <div class="input-wrap">
                    <svg class="input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1.5 13c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    <input type="text" name="fname" className="field-input" value={form.fname} onChange={handleChange} placeholder="Rajan" autocomplete="given-name"/>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Last Name</label>
                  <div class="input-wrap">
                    <svg class="input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1.5 13c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  <input type="text" name="lname" className="field-input" value={form.lname} onChange={handleChange} placeholder="Kumar" autocomplete="family-name"/>
                  </div>
                </div>
              </div>

              {/* COMPANY */}
              <div className="field">
                <label className="field-label">Business / Brand Name</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="2" y="4" width="11" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5 4V3a2.5 2.5 0 015 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M2 7.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <input type="text" name="companyName" className="field-input" value={form.companyName} onChange={handleChange} placeholder="Your Brand Pvt. Ltd." autocomplete="organization"/>
                </div>
              </div>

              {/* EMAIL */}
              <div className="field">
                <label className="field-label">Business Email</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="1.5" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1.5 5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                <input type="email" name="email" className="field-input" value={form.email} onChange={handleChange} placeholder="you@yourbrand.com" autocomplete="email"/>
                </div>
              </div>

              {/* PHONE */}
              <div className="field">
                <label className="field-label">Mobile Number</label>
                <div className="input-wrap">
                  <svg class="input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="3.5" y="1.5" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="7.5" cy="11.5" r="0.7" fill="currentColor"/>
                  </svg>
                  <span class="phone-prefix">+91</span>
                  <input type="text" name="phone" className="field-input phone" value={form.phone} onChange={handleChange} placeholder="98765 43210" autocomplete="tel"/>
                </div>
              </div>

              {/* SHIPPING */}
              <div className="field">
                <label className="field-label">Shipping Volume</label>
                <div className="input-wrap">
                  <svg class="input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M2 5.5L7.5 2.5L13 5.5L7.5 8.5L2 5.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M2 5.5V10L7.5 13L13 10V5.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M7.5 8.5V13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <select name="shippingVolume" className="field-input" value={form.shippingVolume} onChange={handleChange}>
                    <option value="">Select</option>
                    {shippingOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                  </div>
              </div>

              {/* PASSWORD */}
              <div className="field">
                <label className="field-label">Password</label>
                <div className="input-wrap">
                  <svg class="input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="3" y="6.5" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5 6.5V4.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="7.5" cy="10" r="1" fill="currentColor"/>
                  </svg>
                  <input type={showPassword ? "text" : "password"} name="password" className="field-input" placeholder="Minimum 8 characters"  value={form.password} onChange={handleChange}/>
                  <div
                    className="input-suffix"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.7} />
                  </div>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="field">
                <label className="field-label">Confirm Password</label>
                <div className="input-wrap">
                  <svg class="input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="3" y="6.5" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5 6.5V4.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="7.5" cy="10" r="1" fill="currentColor"/>
                  </svg>
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm The Password" className="field-input" value={form.confirmPassword} onChange={handleChange}/>
                  <div
                    className="input-suffix"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    <Icon path={showConfirmPassword ? mdiEyeOff : mdiEye} size={0.7} />
                  </div>
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="btn-cta"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <div className="bottom-toggle">
              Already have an account? <Link to="/login">Sign in →</Link>
            </div>

          </form>
        )}

        {/* EMAIL OTP */}
        {step === 3 && (
          <form onSubmit={handleEmailOtpVerify} className="form-page active">
            <div className="form-title">Verify Email</div>

            <input
              type="text"
              className="field-input"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              placeholder="Enter OTP"
            />

            <button className="btn-cta">
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}

      </div>
    </div>
  </div>
);
}

export default Register;
