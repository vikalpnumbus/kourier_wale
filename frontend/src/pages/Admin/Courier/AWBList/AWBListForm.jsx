import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../../../../middleware/AlertContext";
import AWBListConfig from "../../../../config/AdminConfig/Courier/AWBList";
import api from "../../../../utils/api";
import CourierListDropdown from "../../../../Component/CourierListDropdown";

function AWBListForm() {
  const defaultForm = {
    courier_id: "",
    awb_number: [], 
    mode: "",
    used: "0",
  };

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [awbInput, setAwbInput] = useState(""); 
  const { id } = useParams();
  const location = useLocation();
  const { showError, showSuccess } = useAlert();
  const navigate = useNavigate();
  const isEdit = location.pathname.includes("/awb_list/edit");


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleAWBInputChange = (e) => {
    setAwbInput(e.target.value);
  };

  const handleAWBInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      processAWBInput();
    }
  };

  const processAWBInput = () => {
    if (!awbInput.trim()) return;

    const newAWBs = awbInput
      .split(/[,\s]+/) 
      .map((a) => a.trim())
      .filter((a) => a !== "");

    if (newAWBs.length) {
      setForm((prev) => {
        const existing = new Set(prev.awb_number);
        newAWBs.forEach((awb) => existing.add(awb));
        return { ...prev, awb_number: Array.from(existing) };
      });
    }

    setAwbInput(""); 
    setErrors((prev) => ({ ...prev, awb_number: "" }));
  };

  const removeAWB = (awbToRemove) => {
    setForm((prev) => ({
      ...prev,
      awb_number: prev.awb_number.filter((a) => a !== awbToRemove),
    }));
  };

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.courier_id) newErrors.courier_id = "Courier is required";
    if (!form.mode.trim()) newErrors.mode = "Mode is required";
    if (!form.awb_number.length)
      newErrors.awb_number = "Enter at least one AWB";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const url = isEdit
        ? `${AWBListConfig.awbList}/${id}`
        : AWBListConfig.awbList;
      const method = isEdit ? "patch" : "post";

      let payload = { ...form };

      if (isEdit) {
        payload.awb_number = awbInput.trim();
      } else {
        payload.awb_number = form.awb_number.filter((awb) => awb.trim());
      }

      const response = await api[method](url, payload);

      if (response.status === 201 || response?.data?.status === 201) {
        showSuccess(response.data?.data?.message || "AWB saved successfully!");
        navigate("/admin/awb_list");
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

  const handleFetchData = async (awbId) => {
    try {
      const response = await api.get(`${AWBListConfig.awbList}/${awbId}`);
      const initialData = response?.data?.data?.result[0] || {};
      return initialData;
    } catch (error) {
      console.error("Fetch AWB Error:", error);
      return {};
    }
  };

  useEffect(() => {
  const fetchData = async () => {
    if (isEdit) {
      const data = await handleFetchData(id);
      let awbs = [];

      if (typeof data?.awb_number === "string") {
        awbs = data.awb_number.split(/[,\s]+/).filter(Boolean);
      } else if (Array.isArray(data?.awb_number)) {
        awbs = data.awb_number.filter(Boolean);
      }

      setForm({
        courier_id: data?.courier_id || "",
        awb_number: awbs,
        mode: data?.mode || "",
        used: "0",
      });

      if (awbs.length > 0) {
        setAwbInput(awbs[0]);
      }
    }
  };
  fetchData();
}, [isEdit, id]);


  const modeOptions = [
    { label: "Forward", value: "forward" },
    { label: "Reverse", value: "reverse" },
  ];

  return (
    <div className="row text-center">
      <div className="col-lg-10 col-md-10 mx-auto">
        <div className="card custom-card">
          <div className="card-body pd-45">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <CourierListDropdown
                    setForm={setForm}
                    setErrors={setErrors}
                    initialCourierData={form.courier_id}
                    errors={errors}
                  />
                </div>

                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Mode</label>
                    <select
                      className="form-control lh-sm"
                      name="mode"
                      value={form.mode}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {modeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.mode && (
                      <small className="text-danger">{errors.mode}</small>
                    )}
                  </div>
                </div>

                <div className="col-md-12 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>AWB Number{!isEdit && "s"}</label>

                    {isEdit ? (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter AWB number"
                        value={awbInput}
                        onChange={(e) => setAwbInput(e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter AWBs separated by commas or spaces"
                        value={awbInput}
                        onChange={handleAWBInputChange}
                        onKeyDown={handleAWBInputKeyDown}
                        onBlur={processAWBInput}
                      />
                    )}

                    {errors.awb_number && (
                      <small className="text-danger">{errors.awb_number}</small>
                    )}
                  </div>

                  {!isEdit && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {form.awb_number.map((awb) => (
                        <span
                          key={awb}
                          className="badge bg-primary d-flex align-items-center p-2"
                        >
                          {awb}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            style={{ fontSize: "0.6rem" }}
                            onClick={() => removeAWB(awb)}
                          ></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mt-3"
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

export default AWBListForm;
