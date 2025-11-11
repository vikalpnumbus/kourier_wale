import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../../../../middleware/AlertContext";
import api from "../../../../utils/api";
import courierConfig from "../../../../config/Courier/CourierConfig";

function CourierForm() {
  const defaultForm = {
    name: "",
    code: "",
    status: "1", // default Yes
    show_to_users: "1", // default Yes
    volumetric_divisor: "",
    weight: "",
    additional_weight: "",
    secret_key: "",
    password: "",
  };

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const location = useLocation();
  const { showError, showSuccess } = useAlert();
  const navigate = useNavigate();

  const isEdit = location.pathname.includes("/courier/edit");

  /** Handle input change */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  /** Validation logic */
  const validate = useCallback(() => {
    const newErrors = {};

    if (!String(form.name).trim()) newErrors.name = "Name is required";
    if (!String(form.code).trim()) newErrors.code = "Courier code is required";
    if (!String(form.volumetric_divisor).trim())
      newErrors.volumetric_divisor = "Volumetric divisor is required";
    if (!String(form.weight).trim()) newErrors.weight = "Weight is required";
    if (!String(form.additional_weight).trim())
      newErrors.additional_weight = "Additional weight is required";
    if (!String(form.secret_key).trim())
      newErrors.secret_key = "Secret key is required";
    if (!String(form.password).trim())
      newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  /** Handle submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const url = isEdit
        ? `${courierConfig.courierApi}/${id}`
        : `${courierConfig.courierApi}`
      const method = isEdit ? "patch" : "post";

      const payload = {
        ...form,
        status: form.status === "1" ? "1" : "0",
        show_to_users: form.show_to_users === "1" ? "1" : "0",
      };

      const response = await api[method](url, payload);

      if (response?.data?.status === 201 || response.status === 201) {
        showSuccess("Courier saved successfully!");
        navigate("/admin/courier");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        "Something went wrong while saving the courier";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /** Fetch data for edit mode */
  const fetchCourier = async (id) => {
    try {
      const res = await api.get(
        `${courierConfig.courierApi}/${id}`
      );
      const data = res?.data?.data?.result?.[0];
      if (data) {
        setForm({
          name: String(data.name || ""),
          code: String(data.code || ""),
          status: data.status === "1" ? "1" : "0",
          show_to_users: data.show_to_users === "1" ? "1" : "0",
          volumetric_divisor: String(data.volumetric_divisor || ""),
          weight: String(data.weight || ""),
          additional_weight: String(data.additional_weight || ""),
          secret_key: String(data.secret_key || ""),
          password: String(data.password || ""),
        });
      }
    } catch (error) {
      console.error("Error fetching courier:", error);
      showError("Failed to load courier data");
    }
  };

  useEffect(() => {
    if (isEdit && id) fetchCourier(id);
  }, [isEdit, id]);

  return (
    <div className="row text-center">
      <div className="col-lg-10 col-md-10 mx-auto">
        <div className="card custom-card">
          <div className="card-body pd-45">
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Name */}
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <small className="text-danger">{errors.name}</small>
                    )}
                  </div>
                </div>

                {/* Code */}
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Courier Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter courier code"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                    />
                    {errors.code && (
                      <small className="text-danger">{errors.code}</small>
                    )}
                  </div>
                </div>

                {/* Volumetric Divisor */}
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Volumetric Divisor</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Volumetric Divisor"
                      name="volumetric_divisor"
                      value={form.volumetric_divisor}
                      onChange={handleChange}
                    />
                    {errors.volumetric_divisor && (
                      <small className="text-danger">
                        {errors.volumetric_divisor}
                      </small>
                    )}
                  </div>
                </div>

                {/* Weight */}
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Weight</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter weight"
                      name="weight"
                      value={form.weight}
                      onChange={handleChange}
                    />
                    {errors.weight && (
                      <small className="text-danger">{errors.weight}</small>
                    )}
                  </div>
                </div>

                {/* Additional Weight */}
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Additional Weight</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter additional weight"
                      name="additional_weight"
                      value={form.additional_weight}
                      onChange={handleChange}
                    />
                    {errors.additional_weight && (
                      <small className="text-danger">
                        {errors.additional_weight}
                      </small>
                    )}
                  </div>
                </div>

                {/* Secret Key */}
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Secret Key</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Secret Key"
                      name="secret_key"
                      value={form.secret_key}
                      onChange={handleChange}
                    />
                    {errors.secret_key && (
                      <small className="text-danger">
                        {errors.secret_key}
                      </small>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter Password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
                      <small className="text-danger">{errors.password}</small>
                    )}
                  </div>
                </div>

                {/* Status (Dropdown) */}
                <div className="col-md-3 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Status</label>
                    <select
                      name="status"
                      className="form-control"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  </div>
                </div>

                {/* Show to Users (Dropdown) */}
                <div className="col-md-3 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Show to Users</label>
                    <select
                      name="show_to_users"
                      className="form-control"
                      value={form.show_to_users}
                      onChange={handleChange}
                    >
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mt-3"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : isEdit
                  ? "Update Courier"
                  : "Add Courier"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourierForm;
