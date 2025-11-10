import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Icon from "@mdi/react";
import { mdiEye, mdiEyeOff, mdiPencil } from "@mdi/js";
import { useAlert } from "../../../middleware/AlertContext";
import authConfig from "../../../config/Auth/AuthConfig";
import { encrypt } from "../../../middleware/Encryption";
import company_logo from "../../../../public/themes/assets/company_image/logo_company.png";

function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "+91",
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
      if (!value.startsWith("91")) {
        value = "91" + value;
      }
      value = "+".concat(value);
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep1 = async (e) => {
    e.preventDefault();
    showError("");

    for (const [key, value] of Object.entries(form)) {
      if (key === "phone") {
        if (value.length < 13)
          return showError("Please enter a valid phone number.");
      }
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

      await axios.post(authConfig.registerStep1Api, form);
      // setStep(2);
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
    <>
      <div className="container-scroller">
        <div className="container-fluid page-body-wrapper full-page-wrapper">
          <div className="content-wrapper d-flex align-items-stretch auth auth-img-bg">
            <div className="row flex-grow">
              <div className="col-lg-6 d-flex align-items-center justify-content-center">
                <div
                  className="auth-form-transparent text-left p-3"
                  style={{ width: "75%" }}
                >
                  <img
                    className="mb-3"
                    src={company_logo}
                    alt="Kourier Wale"
                    width={180}
                  />
                  {step === 1 && (
                    <>
                      <form onSubmit={handleNextStep1}>
                        {" "}
                        <div className="row">
                          {" "}
                          <div className="col-md-6 mb-2">
                            {" "}
                            <div className="form-group text-start mb-3">
                              {" "}
                              <label>First Name</label>{" "}
                              <input
                                type="text"
                                className="form-control"
                                name="fname"
                                value={form.fname}
                                onChange={handleChange}
                              />{" "}
                            </div>{" "}
                          </div>{" "}
                          <div className="col-md-6 mb-2">
                            {" "}
                            <div className="form-group text-start mb-3">
                              {" "}
                              <label>Last Name</label>{" "}
                              <input
                                type="text"
                                className="form-control"
                                name="lname"
                                value={form.lname}
                                onChange={handleChange}
                              />{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>{" "}
                        <div className="row">
                          {" "}
                          <div className="col-md-6 mb-2">
                            {" "}
                            <div className="form-group text-start mb-3">
                              {" "}
                              <label>Email</label>{" "}
                              <input
                                type="text"
                                className="form-control"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                              />{" "}
                            </div>{" "}
                          </div>{" "}
                          <div className="col-md-6 mb-2">
                            {" "}
                            <div className="form-group text-start mb-3">
                              {" "}
                              <label>Phone</label>{" "}
                              <input
                                type="text"
                                className="form-control"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                maxLength={13}
                              />{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>{" "}
                        <div className="row">
                          {" "}
                          <div className="col-md-6 mb-2">
                            {" "}
                            <div className="form-group text-start mb-3">
                              {" "}
                              <label>Company Name</label>{" "}
                              <input
                                type="text"
                                className="form-control"
                                name="companyName"
                                value={form.companyName}
                                onChange={handleChange}
                              />{" "}
                            </div>{" "}
                          </div>{" "}
                          <div className="col-md-6 mb-2">
                            {" "}
                            <div className="form-group text-start mb-3">
                              {" "}
                              <label>Shipping Volume</label>{" "}
                              <select
                                className="form-control "
                                name="shippingVolume"
                                value={form.shippingVolume}
                                onChange={handleChange}
                                style={{ lineHeight: "0.6" }}
                              >
                                {" "}
                                <option value="">Select</option>{" "}
                                {shippingOptions.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {" "}
                                    {opt}{" "}
                                  </option>
                                ))}{" "}
                              </select>{" "}
                            </div>{" "}
                          </div>
                        </div>{" "}
                        <div className="row">
                          {" "}
                          <div className="col-md-6 mb-2">
                            {" "}
                            <div className="form-group text-start mb-3">
                              {" "}
                              <label>Password</label>{" "}
                              <div className="input-group">
                                {" "}
                                <input
                                  type={showPassword ? "text" : "password"}
                                  className="form-control"
                                  name="password"
                                  value={form.password}
                                  onChange={handleChange}
                                />{" "}
                                <div className="input-group-prepend bg-transparent">
                                  <span
                                    className="input-group-text bg-transparent border-right-0"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      setShowPassword((prev) => !prev)
                                    }
                                  >
                                    {showPassword ? (
                                      <Icon path={mdiEyeOff} size={0.7} />
                                    ) : (
                                      <Icon path={mdiEye} size={0.7} />
                                    )}
                                  </span>
                                </div>
                              </div>{" "}
                            </div>{" "}
                          </div>{" "}
                          <div className="col-md-6 mb-2">
                            {" "}
                            <div className="form-group text-start mb-3">
                              {" "}
                              <label>Confirm Password</label>{" "}
                              <div className="input-group">
                                {" "}
                                <input
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  className="form-control"
                                  name="confirmPassword"
                                  value={form.confirmPassword}
                                  onChange={handleChange}
                                />{" "}
                                <div className="input-group-prepend bg-transparent">
                                  <span
                                    className="input-group-text bg-transparent border-right-0"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      setShowConfirmPassword((prev) => !prev)
                                    }
                                  >
                                    {showConfirmPassword ? (
                                      <Icon path={mdiEyeOff} size={0.7} />
                                    ) : (
                                      <Icon path={mdiEye} size={0.7} />
                                    )}
                                  </span>
                                </div>
                              </div>{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>{" "}
                        <button
                          type="submit"
                          className="btn ripple btn-primary btn-block w-100"
                          disabled={loading}
                        >
                          {" "}
                          {loading ? "Processing..." : "Next"}{" "}
                        </button>{" "}
                      </form>
                      <div className="mt-3 text-center">
                        <p className="mb-0">
                          Already have an account?{" "}
                          <Link to="/login" className="text-primary">
                            Sign In
                          </Link>
                        </p>
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <form onSubmit={handlePhoneOtpVerify}>
                        <div className="form-group text-start mb-3">
                          <div className="row align-items-end my-2">
                            <p>
                              Enter the 6 digit OTP sent to mobile number <br />
                              <span className="text-primary">{form.phone}</span>
                              <span
                                className="ms-2 text-primary"
                                onClick={() => setStep(1)}
                                style={{ cursor: "pointer" }}
                              >
                                <Icon path={mdiPencil} size={0.6} />
                              </span>
                            </p>
                          </div>
                          <input
                            type="text"
                            className="form-control otp-input"
                            style={{
                              letterSpacing: "8px",
                              transition: "all 0.2s ease-in-out",
                            }}
                            value={phoneOtp}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 6) {
                                setPhoneOtp(value);
                              }
                            }}
                            maxLength={6}
                            placeholder="••••••"
                          />

                          <p
                            className="text-primary my-2"
                            onClick={() => handleResendOTP("phone")}
                            style={{ cursor: "pointer" }}
                          >
                            Re-send OTP?
                          </p>
                          <button
                            type="submit"
                            className="btn w-100 ripple btn-primary btn-block mt-2"
                            disabled={loading}
                          >
                            {loading ? "Verifying..." : "Verify"}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <form onSubmit={handleEmailOtpVerify}>
                        <div className="form-group text-start mb-3">
                          <div className="row align-items-end my-2">
                            <p>
                              Enter the 6 digit OTP sent to E-mail <br />
                              <span className="text-primary">{form.email}</span>
                              <span
                                className="ms-2 text-primary"
                                onClick={() => setStep(1)}
                                style={{ cursor: "pointer" }}
                              >
                                <Icon path={mdiPencil} size={0.6} />
                              </span>
                            </p>
                          </div>
                          <input
                            type="text"
                            className="form-control otp-input"
                            style={{
                              letterSpacing: "8px",
                              transition: "all 0.2s ease-in-out",
                            }}
                            value={emailOtp}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 6) {
                                setEmailOtp(value);
                              }
                            }}
                            maxLength={6}
                            placeholder="••••••"
                          />
                          <p
                            className="text-primary my-2"
                            onClick={() => handleResendOTP("email")}
                            style={{ cursor: "pointer" }}
                          >
                            Re-send OTP?
                          </p>
                          <button
                            type="submit"
                            className="btn w-100 ripple btn-primary btn-block "
                            disabled={loading}
                          >
                            {loading ? "Verifying..." : "Submit"}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
              <div className="col-lg-6 register-half-bg d-flex flex-row">
                <p className="text-white fw-medium text-center flex-grow align-self-end">
                  Copyright © 2021 All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
     
    </>
  );
}

export default Register;
