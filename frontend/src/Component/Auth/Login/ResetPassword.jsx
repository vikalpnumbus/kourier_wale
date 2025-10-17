import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../../middleware/AlertContext";
import authConfig from "../../../config/Auth/AuthConfig";

function ResetPassword() {
  const { token } = useParams(); // token from URL
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useAlert();

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
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return showError("Passwords do not match.");
    }

    const pwdErrors = validatePassword(form.password);
    if (pwdErrors.length) return showError(pwdErrors.join(" "));

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${authConfig.resetPasswordApi}/${token}`,
        { password: form.password }
      );

      showSuccess(data?.message || "Password reset successful!");
      navigate("/login")
    } catch (err) {
      console.error("Reset password error:", err);
      showError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page main-signin-wrapper">
      <div className="row text-center ps-0 pe-0 ms-0 me-0">
        <div className="col-xl-3 col-lg-5 col-md-5 d-block mx-auto">
          <div className="text-center mb-2">
            <a href="/" className="custom-logo">
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
            </a>
          </div>
          <div className="card custom-card">
            <div className="card-body pd-45">
              <h5 className="text-center">Reset Your Password</h5>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group text-start mb-3">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group text-start mb-3">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm new password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn ripple btn-primary btn-block w-100"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
              <div className="mt-3 text-center">
                <p className="mb-1">
                  <Link to="/login" className="text-primary">
                    Back to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
