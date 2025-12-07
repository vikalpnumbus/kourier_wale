import React, { useState } from "react";
import api from "../../../utils/api";
import { useAlert } from "../../../middleware/AlertContext";

function ApproveRejectModal({ onClose, userId, action }) {
  const { showSuccess, showError } = useAlert();
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        userId,
        status: action === "approve" ? "approved" : "rejected",
        remarks,
      };

      const response = await api.post("/admin/kyc/verify", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data?.status === 201) {
        showSuccess(response.data?.data || "Status updated!");
        onClose(true); // reload table
      } else {
        showError(response.data?.data || "Failed to update status!");
      }
    } catch (err) {
      showError(err?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header py-2">
            <h5 className="modal-title">
              {action === "approve" ? "Approve User" : "Reject User"}
            </h5>
            <button
              type="button"
              className="close"
              onClick={() => onClose(false)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <label className="fw-bold">Remarks</label>
              <textarea
                className="form-control"
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your remarks"
                required
              ></textarea>

              {error && <div className="text-danger mt-2">{error}</div>}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">
                {action === "approve" ? "Approve" : "Reject"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onClose(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApproveRejectModal;
