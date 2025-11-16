import React, {
  useCallback,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import escalationConfig from "../../../config/Escalation/EscalationConfig";

const defaultForm = {
  type: "",
  subject: "",
  query: "",
  awb_numbers: "",
  attachments: [],
};

function EscalationForm() {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const { showError, showSuccess } = useAlert();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);

    const invalidFiles = files.filter(
      (file) =>
        !file.type.startsWith("image/") && !file.type.startsWith("application/")
    );

    if (invalidFiles.length > 0) {
      showError("Only images or documents allowed");
      return;
    }

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    setForm((prev) => ({ ...prev, attachments: files }));
    setErrors((prev) => ({ ...prev, attachments: "" }));
  }, []);

  const removePreviews = useCallback(() => {
    setPreviews([]);
    setForm((prev) => ({ ...prev, attachments: [] }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!form.type.trim()) newErrors.type = "Type is required";
    if (!form.subject.trim()) newErrors.subject = "Subject is required";
    if (!form.query.trim()) newErrors.query = "Query is required";

    if (form.type === "Shipment Query" && !form.awb_numbers.trim()) {
      newErrors.awb_numbers = "AWB Number is required for Shipment Query";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const url = escalationConfig.escalationApi;

      const formData = new FormData();
      formData.append("type", form.type);
      formData.append("subject", form.subject);
      formData.append("query", form.query);

      if (form.awb_numbers.trim()) {
        formData.append("awb_numbers", form.awb_numbers);
      }

      form.attachments.forEach((file) => {
        formData.append("attachment", file);
      });

      const response = await api.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.data?.status === 201) {
        showSuccess("Escalation created successfully!");
        navigate("/support");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Something went wrong";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = ["Shipment Query", "Tech Query", "Billing Query", "Pickup Query"];

  const subjectOptions = [
    "Proof of Delivery",
    "Re-attempt",
    "Self Collect - Branch Address Required",
    "Forward Stuck In Transit",
    "Forward Delivery Dispute",
    "RTO Stuck In Transit",
    "RTO Delivery Dispute",
    "Hold Shipment",
    "RTO Instruction",
    "Change Payment Type - COD/Prepaid",
    "Reverse Pickup Delivery Query",
    "Status Mismatch",
    "Other",
  ];

  return (
    <>
      <div className="row text-center">
        <div className="col-lg-10 col-md-10 mx-auto">
          <div className="card custom-card">
            <div className="card-body pd-45">
              <form onSubmit={handleSubmit}>
                <div className="row">

                  <div className="col-md-4 mb-2">
                    <div className="form-group text-start mb-3">
                      <label>
                        Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        {typeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <small className="text-danger">{errors.type}</small>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4 mb-2">
                    <div className="form-group text-start mb-3">
                      <label>
                        Subject <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                      >
                        <option value="">Choose one</option>
                        {subjectOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <small className="text-danger">{errors.subject}</small>
                      )}
                    </div>
                  </div>

                  {form.type === "Shipment Query" && (
                    <InputField
                      label="AWB Numbers (comma separated)"
                      name="awb_numbers"
                      value={form.awb_numbers}
                      onChange={handleChange}
                      error={errors.awb_numbers}
                    />
                  )}

                  <div className="col-md-12 mb-2">
                    <div className="form-group text-start mb-3">
                      <label>
                        Query <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={4}
                        name="query"
                        placeholder="Describe the issue..."
                        value={form.query}
                        onChange={handleChange}
                      ></textarea>
                      {errors.query && (
                        <small className="text-danger">{errors.query}</small>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 mb-2">
                    <div className="form-group text-start mb-3">
                      <label>Attachments (multiple)</label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                      {errors.attachments && (
                        <small className="text-danger">{errors.attachments}</small>
                      )}
                    </div>
                  </div>

                  <div className="col-md-12 mb-2">
                    {previews.length > 0 && (
                      <div className="mt-2 d-flex gap-3 flex-wrap">
                        {previews.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{ maxHeight: "160px" }}
                          />
                        ))}

                        <button
                          type="button"
                          className="btn btn-sm btn-danger d-block mt-2"
                          onClick={removePreviews}
                        >
                          Remove All
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Submit Escalation"}
                </button>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EscalationForm;

const InputField = ({ label, name, value, onChange, error }) => (
  <div className="col-md-4 mb-2">
    <div className="form-group text-start mb-3">
      <label>{label}</label>
      <input
        type="text"
        className="form-control"
        name={name}
        value={value}
        onChange={onChange}
      />
      {error && <small className="text-danger">{error}</small>}
    </div>
  </div>
);
