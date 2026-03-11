import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import ChannelConfig from "../../../config/Channel/ChannelConfig";

const defaultForm = {
  channel: "shopify",
  channel_name: "",
  channel_host: "",
  api_key: "",
  api_secret: "",
  access_token: "",
};

function ShopifyForm() {
    const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const { showError, showSuccess } = useAlert();
  const navigate = useNavigate();

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  // Validate required fields
  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.channel_name.trim())
      newErrors.channel_name = "Channel name is required";
    if (!form.channel_host.trim())
      newErrors.channel_host = "Channel host is required";
    if (!form.api_key.trim()) newErrors.api_key = "API key is required";
    if (!form.api_secret.trim()) newErrors.api_secret = "API secret is required";
    if (!form.access_token.trim())
      newErrors.access_token = "Access token is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const isEdit = location.pathname.includes("/channel/edit/shopify");
      const url = isEdit
        ? `${ChannelConfig.channelApi}/${id}`
        : `${ChannelConfig.channelApi}`
      const method = isEdit ? "patch" : "post";

      const response = await api[method](url, form);

      if (response.status === 201 || response?.data?.status === 201) {
        showSuccess(
          response.data?.data?.message || "Channel saved successfully!"
        );
        navigate("/channel");
      }
    } catch (err) {
      const errorMsg =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : "Something went wrong";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing data in edit mode
  const handleFetchData = async (channelId) => {
    try {
      const response = await api.get(
        `${ChannelConfig.channelApi}/${channelId}`
      );
      const data = response?.data?.data?.result[0];
      console.log('data: ', data);
      if (data){
        setForm({
          channel: data.channel || "",
          channel_name: data.channel_name || "",
          channel_host: data.channel_host || "",
          api_key: data.api_key || "",
          api_secret: data.api_secret || "",
          access_token: data.access_token || "",
        });
      }
    } catch (error) {
      console.error("Fetch Channel Error:", error);
    }
  };

  useEffect(() => {
    if (location.pathname.includes("/channel/edit/shopify")) {
      handleFetchData(id);
    }
  }, [id, location.pathname]);

 
  return (
    <div className="row">
      <div className="col-lg-6 col-md-6">
        <div className="card m-b-30">
          <div className="card-header">
            <h5 className="m-b-0">Shopify Add Information</h5>
          </div>
          <div className="card-body">
            <h5 className="text-success">
              Use the following instructions to integrate Shopify:
            </h5>
            <ol className="pl-lg amazon-ints">
              <li>Login to Shopify Admin Panel.</li>
              <li>Go to Apps.</li>
              <li>Click on Private Apps Button.</li>
              <li>Click on Create a Private App.</li>
              <li>Enter Title name under the Description tab and click on Save.</li>
              <li>Click on Title, as you entered earlier.</li>
              <li>Here you will find Shopify API Key, password, Shared Secret.</li>
              <li>Copy the identifiers and integrate the channel.</li>
            </ol>
          </div>
        </div>
      </div>
      <div className="col-lg-6 col-md-6">
        <div className="card custom-card">
          <div className="card-body pd-45">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <InputField
                  label="Channel Name"
                  name="channel_name"
                  value={form.channel_name}
                  onChange={handleChange}
                  error={errors.channel_name}
                />
                <InputField
                  label="Channel Host"
                  name="channel_host"
                  value={form.channel_host}
                  onChange={handleChange}
                  error={errors.channel_host}
                />
                <InputField
                  label="API Key"
                  name="api_key"
                  value={form.api_key}
                  onChange={handleChange}
                  error={errors.api_key}
                />
                <InputField
                  label="API Secret"
                  name="api_secret"
                  value={form.api_secret}
                  onChange={handleChange}
                  error={errors.api_secret}
                />
                <InputField
                  label="Access Token"
                  name="access_token"
                  value={form.access_token}
                  onChange={handleChange}
                  error={errors.access_token}
                />
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
  )
}
export default ShopifyForm

const InputField = ({ label, name, value, onChange, error, disabled }) => (
  <div className="col-md-6 mb-3">
    <div className="form-group text-start">
      <label>
        {label}
        <span className="text-danger">*</span>
      </label>
      <input
        type="text"
        className="form-control"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <small className="text-danger">{error}</small>}
    </div>
  </div>
);