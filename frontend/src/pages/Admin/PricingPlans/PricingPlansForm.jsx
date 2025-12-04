import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import PricingPlanConfig from "../../../config/PricingPlan/PricingPlanConfig";

function PricingPlansForm() {
  const defaultForm = {
    type: "",
    name: "",
  };

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const isEdit = location.pathname.includes("/plans/edit");

  /** Allowed standard plan names */
  const standardPlanNames = ["bronze", "silver", "gold", "platinum"];

  /** Handle input change */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Reset name if user switches type
    if (name === "type") {
      setForm((prev) => ({
        ...prev,
        type: value,
        name: value === "standard" ? "bronze" : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  /** Validation logic */
  const validate = useCallback(() => {
    const newErrors = {};
    if (!String(form.type).trim()) newErrors.type = "Type is required";
    if (!String(form.name).trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  /** Handle form submission */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const url = isEdit
        ? `${PricingPlanConfig.pricingPlanApi}/${id}`
        : `${PricingPlanConfig.pricingPlanApi}`
      const method = isEdit ? "patch" : "post";

      const response = await api[method](url, form);

      if (response?.data?.status === 201 || response.status === 201) {
        showSuccess("Pricing Plan saved successfully!");
        navigate("/admin/plans");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        "Something went wrong while saving the pricing plan";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /** Fetch existing data for edit */
  const fetchPricingPlan = async (id) => {
    try {
      const res = await api.get(
        `${PricingPlanConfig.pricingPlanApi}/${id}`
      );
      const data = res?.data?.data?.result?.[0];
      if (data) {
        setForm({
          type: String(data.type || ""),
          name: String(data.name || ""),
        });
      }
    } catch (error) {
      console.error("Error fetching pricing plan:", error);
      showError("Failed to load pricing plan data");
    }
  };

  useEffect(() => {
    if (isEdit && id) fetchPricingPlan(id);
  }, [isEdit, id]);

  return (
    <div className="row text-center">
      <div className="col-lg-8 col-md-10 mx-auto">
        <div className="card custom-card">
          <div className="card-body pd-45">
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Type */}
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Type</label>
                    <select
                      name="type"
                      className="form-control"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="">Select Type</option>
                      <option value="standard">Standard</option>
                      <option value="custom">Custom</option>
                    </select>
                    {errors.type && (
                      <small className="text-danger">{errors.type}</small>
                    )}
                  </div>
                </div>

                {/* Name (dynamic input or dropdown) */}
                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Name</label>
                    {form.type === "standard" ? (
                      <select
                        name="name"
                        className="form-control"
                        value={form.name}
                        onChange={handleChange}
                      >
                        <option value="">Select Plan Name</option>
                        {standardPlanNames.map((plan) => (
                          <option key={plan} value={plan}>
                            {plan.charAt(0).toUpperCase() + plan.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter custom plan name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                      />
                    )}
                    {errors.name && (
                      <small className="text-danger">{errors.name}</small>
                    )}
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
                    ? "Update Pricing Plan"
                    : "Add Pricing Plan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingPlansForm;
