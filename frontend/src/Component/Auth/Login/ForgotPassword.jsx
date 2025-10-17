import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../../middleware/AlertContext";
import authConfig from "../../../config/Auth/AuthConfig";

function ForgotPassword() {
  const [phone, setPhone] = useState("+91");
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useAlert();

  const validatePhone = (num) => {
    return /^\+91\d{10}$/.test(num)
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
    setPhone(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone
    const phoneError = validatePhone(phone);
    if (phoneError) return showError(phoneError);

    setLoading(true);
    try {
      const { data } = await axios.post(authConfig.forgotPasswordApi, {
        phone,
      });

      showSuccess(
        data?.data?.message ||
          "The reset link has been sent to your registered email."
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
      <div className={`container-fluid page-body-wrapper full-page-wrapper`}>
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
                    <h5 className="text-center">Forgot Password</h5>

                    <form onSubmit={handleSubmit}>
                      <div className="form-group text-start mb-3">
                        <label>Phone</label>
                        {/* <input
                        className="form-control"
                        placeholder="+91XXXXXXXXXX"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      /> */}
                        <input
                          className="form-control"
                          placeholder="+91XXXXXXXXXX"
                          type="tel"
                          name="phone"
                          value={phone}
                          onChange={handleChange}
                          required
                          inputMode="numeric"
                          pattern="\+91\d{10}"
                          maxLength={13}
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn ripple btn-primary btn-block w-100"
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Send Reset Link"}
                      </button>
                    </form>
                    <div className="mt-3 text-center">
                      <p className="mb-1">
                        <Link to="/login" className="text-primary">
                          Back to Login
                        </Link>
                      </p>
                      <p className="mb-0">
                        Don’t have an account?{" "}
                        <Link to="/register" className="text-primary">
                          Create an Account
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
  );
}

export default ForgotPassword;
