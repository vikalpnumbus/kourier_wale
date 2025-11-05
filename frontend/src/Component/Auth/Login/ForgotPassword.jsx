import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../../middleware/AlertContext";
import authConfig from "../../../config/Auth/AuthConfig";
import company_logo from "../../../../public/themes/assets/company_image/logo_company.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useAlert();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? "" : "Please enter a valid email address.";
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) return showError(emailError);

    setLoading(true);
    try {
      const { data } = await axios.post(authConfig.forgotPasswordApi, {
        email,
      });

      showSuccess(
        data?.data?.message ||
          "A password reset link has been sent to your registered email."
      );
    } catch (err) {
      showError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong, please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-scroller">
      <div className="container-fluid page-body-wrapper full-page-wrapper">
        <div className="content-wrapper d-flex align-items-stretch auth auth-img-bg">
          <div className="row flex-grow">
            {/* Left Section */}
            <div className="col-lg-6 d-flex align-items-center justify-content-center">
              <div className="auth-form-transparent text-left p-3">
                <img
                  className="mb-3"
                  src={company_logo}
                  alt="Kourier Wale"
                  width={180}
                />
                <form onSubmit={handleSubmit}>
                  <div className="form-group text-start mb-3">
                    <div className="input-group">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <i className="ti-email text-primary"></i>
                        </span>
                      </div>
                      <input
                        className="form-control"
                        placeholder="Enter your email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn ripple btn-primary btn-block w-100"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <div className="mt-3 text-end">
                  <p className="mb-1">
                    <Link to="/login" className="text-primary">
                      Back to Login
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

            {/* Right Section */}
            <div className="col-lg-6 login-half-bg d-flex flex-row">
              <p className="text-white fw-medium text-center flex-grow align-self-end">
                Copyright © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
