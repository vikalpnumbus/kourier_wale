import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";

const defaultForm = {
  name: "",
  contactName: "",
  contactPhone: "+91",
  address: "",
  city: "",
  state: "",
  pincode: "",
  support_email: "",
  support_phone: "+91",
  hide_end_customer_contact_number: false,
  hide_warehouse_mobile_number: false,
  hide_warehouse_address: false,
  hide_product_details: false,
};

function WarehouseForm() {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingPincode, setLoadingPincode] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const { showError, showSuccess } = useAlert();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value: rawValue, type, checked } = e.target;
    let value = type === "checkbox" ? checked : rawValue;
    if (name === "support_phone" || name === "contactPhone") {
      let digits = rawValue.replace(/\D/g, "");
      if (!digits.startsWith("91")) {
        digits = "91" + digits;
      }
      value = "+" + digits;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const validatePhone = (num) => {
    return /^\+91[6-9]\d{9}$/.test(num)
      ? ""
      : "Phone must be in the format +91XXXXXXXXXX (Indian number).";
  };

  const validate = useCallback(() => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Warehouse name is required";
    if (!form.contactName.trim())
      newErrors.contactName = "Contact name is required";

    if (!form.contactPhone.trim()) {
      newErrors.contactPhone = "Contact phone is required";
    } else {
      const phoneError = validatePhone(form.contactPhone);
      if (phoneError) newErrors.contactPhone = phoneError;
    }

    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";

    if (!form.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (!form.support_email.trim()) {
      newErrors.support_email = "Support email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.support_email)) {
      newErrors.support_email = "Invalid email format";
    }

    if (!form.support_phone.trim()) {
      newErrors.support_phone = "Support phone is required";
    } else {
      const phoneError = validatePhone(form.support_phone);
      if (phoneError) newErrors.support_phone = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const isEdit = location.pathname.includes("/warehouse/edit");
      const url = isEdit
        ? `${warehouseConfig.warehouseApi}/${id}`
        : warehouseConfig.warehouseApi;
      const method = isEdit ? "patch" : "post";

      const response = await api[method](url, form);

      if (response.status === 201 || response?.data?.status === 201) {
        showSuccess(
          response.data?.data?.message || "Warehouse saved successfully!"
        );
        navigate("/warehouse");
      }
    } catch (err) {
      if (Array.isArray(err?.response?.data?.message)) {
        const newErrors = err.response.data.message.reduce((acc, data) => {
          acc[data.field] = data.message;
          return acc;
        }, {});
        setErrors((prev) => ({ ...prev, ...newErrors }));
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

  const handleFetchData = async (warehouseId) => {
    try {
      const response = await api.get(
        `${warehouseConfig.warehouseApi}/${warehouseId}`
      );
      const initialData = response?.data?.data?.result?.[0] || {};
      return initialData;
    } catch (error) {
      console.error("Error fetching warehouse:", error);
      return {};
    }
  };

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
            pincode: "Enter correct pincode",
          }));
        }

        const { city, state } = response.data.data;
        setForm((prev) => ({
          ...prev,
          city,
          state,
        }));
        setErrors((prev) => ({
          ...prev,
          city: "",
          state: "",
          pincode: "",
        }));
      }
    } catch (error) {
      console.error("Pincode Fetch Error:", error);
      setErrors((prev) => ({
        ...prev,
        pincode: "Enter correct pincode",
      }));
    } finally {
      setLoadingPincode(false);
    }
  };

  useEffect(() => {
    if (/^\d{6}$/.test(form.pincode)) {
      handleFetchPincode(form.pincode);
    }
  }, [form.pincode]);

  useEffect(() => {
    const fetchData = async () => {
      if (location.pathname.includes("/warehouse/edit")) {
        const data = await handleFetchData(id);
        setForm({
          name: data?.name || "",
          contactName: data?.contactName || "",
          contactPhone: data?.contactPhone || "",
          address: data?.address || "",
          city: data?.city || "",
          state: data?.state || "",
          pincode: data?.pincode || "",
          support_email: data?.labelDetails?.support_email || "",
          support_phone: data?.labelDetails?.support_phone || "",
          hide_end_customer_contact_number:
            data?.labelDetails?.hide_end_customer_contact_number || false,
          hide_warehouse_mobile_number:
            data?.labelDetails?.hide_warehouse_mobile_number || false,
          hide_warehouse_address:
            data?.labelDetails?.hide_warehouse_address || false,
          hide_product_details:
            data?.labelDetails?.hide_product_details || false,
        });
      }
    };

    fetchData();
  }, [location.pathname, id]);

  const inputFields = useMemo(
    () => [
      { label: "Warehouse Name", name: "name" },
      { label: "Contact Name", name: "contactName" },
      { label: "Contact Phone", name: "contactPhone" },
      { label: "Address", name: "address" },
      { label: "Pincode", name: "pincode" },
      { label: "City", name: "city", disabled: true },
      { label: "State", name: "state", disabled: true },
      { label: "Support Email", name: "support_email" },
      { label: "Support Phone", name: "support_phone" },
    ],
    []
  );

  const checkboxFields = useMemo(
    () => [
      {
        label: "Hide End Customer Contact Number",
        name: "hide_end_customer_contact_number",
      },
      {
        label: "Hide Warehouse Mobile Number",
        name: "hide_warehouse_mobile_number",
      },
      { label: "Hide Warehouse Address", name: "hide_warehouse_address" },
      { label: "Hide Product Details", name: "hide_product_details" },
    ],
    []
  );
  return (
    <>
      <div className="row text-center">
        <div className="col-lg-10 col-md-10 mx-auto">
          <div className="card custom-card">
            <div className="card-body pd-45">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {inputFields.map(({ label, name, disabled }) => (
                    <InputField
                      key={name}
                      label={label}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      error={errors[name]}
                      loadingPincode={loadingPincode}
                      disabled={disabled}
                    />
                  ))}

                  {checkboxFields.map(({ label, name }) => (
                    <CheckboxField
                      key={name}
                      label={label}
                      name={name}
                      checked={form[name]}
                      onChange={handleChange}
                    />
                  ))}
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
    </>
  );
}

const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  loadingPincode,
  disabled,
}) => (
  <div
    className={`col-md-${
      name === "pincode" ||
      name === "city" ||
      name === "state" ||
      name === "name" ||
      name === "contactName" ||
      name === "contactPhone"
        ? "4"
        : name === "address"
        ? "12"
        : "6"
    } mb-2`}
  >
    <div className="form-group text-start mb-3">
      <label>{label}<span className="text-danger">*</span></label>

      {name === "address" ? (
        <textarea
          className="form-control form-textarea "
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          rows={3}
        />
      ) : (
        <input
          type="text"
          className="form-control"
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          maxLength={
            name === "pincode"
              ? 6
              : name === "contactPhone" || name === "support_phone"
              ? 13
              : undefined
          }
        />
      )}

      {name === "pincode" && loadingPincode && (
        <small className="text-muted">Fetching city & state...</small>
      )}
      {error && <small className="text-danger">{error}</small>}
    </div>
  </div>
);

const CheckboxField = ({ label, name, checked, onChange }) => (
  <div className="col-md-6 mb-2">
    <div className="form-check text-start">
      <input
        type="checkbox"
        className="form-check-input ms-0"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
      />
      <label className="form-check-label" htmlFor={name}>
        {label}
      </label>
    </div>
  </div>
);

export default WarehouseForm;
