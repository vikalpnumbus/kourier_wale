import React, { useState } from "react";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import escalationConfig from "../../../config/Escalation/EscalationConfig";

function ConversationsForm({
  escalationId,
  to = "seller",
  handleFetchConversation,
}) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useAlert() || {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      showError?.("Message cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("escalation_id", escalationId);
      formData.append("to", to);
      formData.append("message", message);
      if (file) formData.append("attachments", file);

      const url = escalationConfig.conversationsApi;

      const response = await api.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.data?.status === 201) {
        showSuccess(response.data?.data?.message || response.data?.data);
        setMessage("");
        setFile(null);
        handleFetchConversation(escalationId);
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

  return (
    <div className="card bg-light card-rounded mt-3">
      <div className="card-body px-3 py-3">
        <h4 className="card-title card-title-dash mb-2">Add new remark</h4>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-12 mb-2">
              <div className="form-group text-start mb-3">
                <textarea
                  className="form-control form-textarea"
                  rows={3}
                  placeholder="Add new message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-12 mb-2">
              <div className="form-group text-start mb-3">
                <label>Attachments (If any)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>

            <div className="col-md-12">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConversationsForm;
