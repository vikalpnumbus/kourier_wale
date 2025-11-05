import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import bankDetailsConfig from "../../../config/BankDetails/BankDetailsConfig";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_NUMBER_REGEX = /^\d{10,18}$/;

export default function BankDetailsForm() {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const { id } = useParams();
  const { showError, showSuccess } = useAlert();
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    bankBranch: "",
    ifscCode: "",
    accountType: "",
    isPrimary: false,
    address: "",
    city: "",
    state: "",
  });

  const handleFetchData = async (bankId) => {
  try {
    const response = await api.get(`${bankDetailsConfig.bankDetails}/${bankId}`);
    const initialData = response?.data?.data?.result || {};
    return initialData;
  } catch (error) {
    console.error("Bank Details Fetch Error:", error);
    return {};
  }
};

  useEffect(() => {
    const fetchData = async () => {
      if (location.pathname.includes("/bank/edit")) {
        const data = await handleFetchData(id);
        setForm({
          accountHolderName: data?.accountHolderName || "",
          accountNumber: data?.accountNumber || "",
          bankName: data?.bankName || "",
          bankBranch: data?.bankBranch || "",
          ifscCode: data?.ifscCode || "",
          accountType: data?.accountType || "",
          isPrimary: data?.isPrimary || false,
          address: data?.address || "",
          city: data?.city || "",
          state: data?.state || "",
        });
      }
    };

    fetchData();
  }, [location.pathname, id, token]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    if (name === "ifscCode") newValue = newValue.toUpperCase();

    setForm((prev) => ({ ...prev, [name]: newValue }));

    if (name === "ifscCode") {
      if (IFSC_REGEX.test(newValue)) {
        setErrors((prev) => ({ ...prev, ifscCode: "" }));
        getIFSCData(newValue);
      } else {
        setErrors((prev) => ({ ...prev, ifscCode: "Enter a valid IFSC code" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
    setErrors((prev) => ({ ...prev, cancelledChequeImage: "" }));
  };

  const removePreview = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.accountHolderName.trim())
      newErrors.accountHolderName = "Account holder name is required";

    if (!form.accountNumber.trim())
      newErrors.accountNumber = "Account number is required";
    else if (!ACCOUNT_NUMBER_REGEX.test(form.accountNumber))
      newErrors.accountNumber = "Enter a valid account number (10–18 digits)";

    if (!form.bankName.trim()) newErrors.bankName = "Bank name is required";
    if (!form.bankBranch.trim())
      newErrors.bankBranch = "Bank branch is required";

    if (!form.ifscCode.trim()) newErrors.ifscCode = "IFSC code is required";
    else if (!IFSC_REGEX.test(form.ifscCode))
      newErrors.ifscCode = "Enter a valid IFSC code";

    if (!form.accountType) newErrors.accountType = "Please select account type";
    if (!file) newErrors.cancelledChequeImage = "Cancelled cheque is required";

    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";

    return newErrors;
  };

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = validate();
  setErrors(newErrors);
  if (Object.keys(newErrors).length) return;

  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => formData.append(key, value));
  if (file) formData.append("cancelledChequeImage", file);

  try {
    setLoading(true);

    const isEdit = location.pathname.includes("/bank/edit");
    const url = isEdit
      ? `${bankDetailsConfig.bankDetails}/${id}`
      : bankDetailsConfig.bankDetails;

    const method = isEdit ? "patch" : "post";

    const response = await api[method](url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response?.data?.status === 201) {
      showSuccess(response.data?.data?.message || response.data?.data);
      setTimeout(() => {
        navigate("/profile/bank");
      }, 3000);
    }
  } catch (error) {
    showError(
      error?.response?.data?.message ||
        error?.response?.data ||
        "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};

  const getIFSCData = async (code) => {
  try {
    const response = await api.get(`${bankDetailsConfig.getIfscApi}/${code}`);

    if (response?.data?.status === 200) {
      const { bankBranch, bankName, address, state, city } = response.data.data;

      setForm((prev) => ({
        ...prev,
        bankBranch,
        bankName,
        address,
        state,
        city,
      }));

      setErrors((prev) => ({
        ...prev,
        bankBranch: "",
        bankName: "",
        address: "",
        state: "",
        city: "",
      }));
    }
  } catch (error) {
    setErrors((prev) => ({
      ...prev,
      ifscCode: error?.response?.data?.message || "Enter a valid IFSC code",
    }));

    setForm((prev) => ({
      ...prev,
      bankBranch: "",
      bankName: "",
      address: "",
      city: "",
      state: "",
    }));
  }
};

  return (
    <div className="row text-center ">
      <div className="col-lg-10 col-md-10 mx-auto">
        <div className="card custom-card">
          <div className="card-body pd-45">
            <h5 className="text-center">
              {location.pathname.includes("/bank/edit")
                ? "Edit Bank Details"
                : "Add Bank Details"}
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <InputField
                  label="Account Holder Name"
                  name="accountHolderName"
                  value={form.accountHolderName}
                  onChange={handleChange}
                  error={errors.accountHolderName}
                />
                <InputField
                  label="Account Number"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                  error={errors.accountNumber}
                  maxLength={18}
                />
              </div>

              <div className="row">
                <InputField
                  label="IFSC Code"
                  name="ifscCode"
                  value={form.ifscCode}
                  onChange={handleChange}
                  error={errors.ifscCode}
                  maxLength={11}
                />
                <SelectField
                  label="Account Type"
                  name="accountType"
                  value={form.accountType}
                  onChange={handleChange}
                  error={errors.accountType}
                  options={[
                    { value: "savings", label: "Savings" },
                    { value: "current", label: "Current" },
                  ]}
                />
              </div>

              <div className="row">
                <InputField
                  label="Bank Branch"
                  name="bankBranch"
                  value={form.bankBranch}
                  disabled
                  error={errors.bankBranch}
                />
                <InputField
                  label="Bank Name"
                  name="bankName"
                  value={form.bankName}
                  disabled
                  error={errors.bankName}
                />
              </div>

              <InputField
                label="Address"
                name="address"
                value={form.address}
                disabled
                error={errors.address}
              />
              <div className="row">
                <InputField
                  label="City"
                  name="city"
                  value={form.city}
                  disabled
                  error={errors.city}
                />
                <InputField
                  label="State"
                  name="state"
                  value={form.state}
                  disabled
                  error={errors.state}
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Cancelled Cheque Image<span className="text-danger">*</span></label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                      accept="image/*"
                      ref={fileInputRef}
                    />
                    {errors.cancelledChequeImage && (
                      <small className="text-danger">
                        {errors.cancelledChequeImage}
                      </small>
                    )}
                  </div>
                </div>
                {preview && (
                  <div className="col-md-6 mb-2">
                    <div className="mt-2 position-relative d-inline-block">
                      <img
                        src={preview}
                        alt="Cheque Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: "200px", objectFit: "contain" }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                        onClick={removePreview}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group text-start mb-3">
                <input
                  type="checkbox"
                  name="isPrimary"
                  id="isPrimary"
                  checked={form.isPrimary}
                  onChange={handleChange}
                />
                <label htmlFor="isPrimary" className="ms-2">
                  Primary Account
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const InputField = ({ label, name, value, onChange, error, ...props }) => (
  <div className={`col-md-${name == "address" ? "12" : "6"} mb-2`}>
    <div className="form-group text-start mb-3">
      <label>{label}<span className="text-danger">*</span></label>
      {name === "address" ? (
        <textarea
          className="form-control form-textarea "
          name={name}
          value={value || ""}
          onChange={onChange}
          rows={3}
          {...props}
        />
      ) : (
        <input
          type="text"
          className="form-control"
          name={name}
          value={value || ""}
          onChange={onChange}
          {...props}
        />
      )}
      {error && <small className="text-danger">{error}</small>}
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, error, options }) => (
  <div className="col-md-6 mb-2">
    <div className="form-group text-start mb-3">
      <label>{label}<span className="text-danger">*</span></label>
      <select
        className="form-control lh-sm text-dark"
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <small className="text-danger">{error}</small>}
    </div>
  </div>
);
