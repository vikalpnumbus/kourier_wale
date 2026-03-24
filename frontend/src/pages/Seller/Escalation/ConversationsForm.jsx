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
        <div className="rb-label">Add New Remark</div>

        <form onSubmit={handleSubmit}>
          <textarea
            className="rb-ta"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="rb-bottom">

            <label className="rb-attach-btn">
              Attach
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>

            <button className="rb-submit" disabled={loading}>
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConversationsForm;
