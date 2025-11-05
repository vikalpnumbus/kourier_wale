import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";

const defaultForm = {
  companyAddress: "",
  companyCity: "",
  companyState: "",
  companyPincode: "",
  companyLogo: null,
};

export default function CompanyDetails() {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [companyData, setCompanyData] = useState({});
  const fileInputRef = useRef(null);
  const [loadingPincode, setLoadingPincode] = useState(false);
  const { showError, showSuccess } = useAlert();


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, companyLogo: file }));
      setErrors((prev) => ({ ...prev, companyLogo: "" }));
    }
  }, []);

  const removePreview = useCallback(() => {
    setPreview(null);
    setForm((prev) => ({ ...prev, companyLogo: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.companyAddress.trim())
      newErrors.companyAddress = "Company address is required";
    if (!form.companyCity.trim()) newErrors.companyCity = "City is required";
    if (!form.companyState.trim()) newErrors.companyState = "State is required";

    if (!form.companyPincode.trim()) {
      newErrors.companyPincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.companyPincode)) {
      newErrors.companyPincode = "Pincode must be 6 digits";
    }

    if (!form.companyLogo) {
      newErrors.companyLogo = "Company logo is required";
    } else if (!form.companyLogo.type.startsWith("image/")) {
      newErrors.companyLogo = "File must be an image";
    } else if (form.companyLogo.size > 2 * 1024 * 1024) {
      newErrors.companyLogo = "Image size must be ≤ 2 MB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const body = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key]) body.append(key, form[key]);
      });

      const response = await api.post(
        companyDetailsConfig.companyDetails,
        body,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data?.status === 201) {
        showSuccess(
          response.data?.data?.message ||
            "Company details submitted successfully!"
        );
      }
    } catch (err) {
      showError(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = async () => {
    try {
      const response = await api.get(companyDetailsConfig.companyDetails);
      setCompanyData(response?.data?.data?.companyDetails || {});
    } catch (error) {
      console.error("Company Details Fetch Error:", error);
      setCompanyData({});
    }
  };

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      companyPincode: companyData.companyPincode || "",
      companyAddress: companyData.companyAddress || "",
      companyState: companyData.companyState || "",
      companyCity: companyData.companyCity || "",
      companyLogo: companyData.companyLogo || "",
    }));
    if (companyData?.companyLogo) {
      setPreview(
        `${import.meta.env.VITE_API_URL}${companyData.companyLogo[1]}`
      );
    }
  }, [companyData]);

  const handleFetchPincode = async (pincode) => {
    setLoadingPincode(true);
    try {
      const response = await api.get(
        `${warehouseConfig.pincodeApi}/${pincode}`
      );

      if (response?.data?.status === 200) {
        if (!response.data?.data || response.data.data.length === 0) {
          return setErrors((prev) => ({
            ...prev,
            companyPincode: "Enter correct pincode",
          }));
        }

        const { city, state } = response.data.data;
        setForm((prev) => ({
          ...prev,
          companyCity: city,
          companyState: state,
        }));

        setErrors((prev) => ({
          ...prev,
          companyPincode: "",
        }));
      }
    } catch (error) {
      console.error("Pincode Fetch Error:", error);
      setErrors((prev) => ({
        ...prev,
        companyPincode: "Enter correct pincode",
      }));
    } finally {
      setLoadingPincode(false);
    }
  };

  useEffect(() => {
    if (/^\d{6}$/.test(form.companyPincode)) {
      handleFetchPincode(form.companyPincode);
    }
  }, [form.companyPincode]);

  useEffect(() => {
    handleFetchData();
  }, []);

  const inputFields = useMemo(
    () => [
      { label: "Pincode", name: "companyPincode" },
      { label: "Company Address", name: "companyAddress" },
      { label: "City", name: "companyCity" },
      { label: "State", name: "companyState" },
    ],
    []
  );

  return (
    <div className="row text-center">
      <div className="col-lg-10 col-md-10 mx-auto">
        <div className="card custom-card">
          <div className="card-body pd-45">
            <h5 className="text-center">
              Add Company Details
            </h5>
            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Static Fields */}
                {[
                  { label: "First Name", value: companyData?.fname },
                  { label: "Last Name", value: companyData?.lname },
                  { label: "Email", value: companyData?.email },
                  { label: "Contact No.", value: companyData?.phone },
                  { label: "Company Name", value: companyData?.companyName },
                ].map(({ label, value }) => (
                  <StaticField key={label} label={label} value={value} />
                ))}

                {/* Dynamic Fields */}
                {inputFields.map(({ label, name }) => (
                  <InputField
                    key={name}
                    label={label}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    error={errors[name]}
                    loadingPincode={loadingPincode}
                  />
                ))}

                {/* Logo Upload */}
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Company Logo<span className="text-danger">*</span></label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                      accept="image/*"
                      ref={fileInputRef}
                    />
                    {errors.companyLogo && (
                      <small className="text-danger">
                        {errors.companyLogo}
                      </small>
                    )}
                  </div>
                </div>
                {preview && (
                  <div className="col-md-6 mb-2">
                    <div className="mt-2 position-relative d-inline-block">
                      <img
                        src={preview}
                        alt="Logo Preview"
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

const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  loadingPincode,
}) => (
  <div className={`col-md-${name === "companyAddress" ? "12" : "6"} mb-2`}>
    <div className="form-group text-start mb-3">
      <label>{label}<span className="text-danger">*</span></label>
      {name === "companyAddress" ? (
        <textarea
          className="form-control form-textarea "
          name={name}
          value={value || ""}
          onChange={onChange}
          rows={3}
        />
      ) : (
        <input
          type="text"
          className="form-control"
          name={name}
          value={value}
          onChange={onChange}
          disabled={name === "companyCity" || name === "companyState"}
          maxLength={name === "companyPincode" ? 6 : undefined}
        />
      )}
      {name === "companyPincode" && loadingPincode && (
        <small className="text-muted">Fetching city & state...</small>
      )}
      {error && <small className="text-danger">{error}</small>}
    </div>
  </div>
);

const StaticField = ({ label, value }) => (
  <div className="col-md-6 mb-2">
    <div className="form-group text-start mb-3">
      <label>{label}<span className="text-danger">*</span></label>
      <input
        type="text"
        className="form-control"
        value={value || ""}
        disabled
      />
    </div>
  </div>
);
