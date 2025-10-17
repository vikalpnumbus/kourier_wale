import React, { useRef, useState } from "react";
import { useAlert } from "../middleware/AlertContext";
import api from "../utils/api";

function ImportModal({ onClose, title, apiURL }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const { showError, showSuccess } = useAlert();
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");

    if (selectedFile) {
      // CSV validation
      const isCSV = selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv");
      if (!isCSV) {
        setFile(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setError("Only CSV files are allowed.");
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError("");
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a CSV file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(
        apiURL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data?.status === 200) {
        showSuccess(
          response.data?.data?.message || "Imported successfully!"
        );
        handleClear();
        onClose();
      }else {
        showError(
          response.data?.data?.message || "Something went wrong!"
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Something went wrong"
      );
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
          <div className="modal-header py-1">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="close" onClick={onClose}>
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <input ref={fileInputRef} type="file" onChange={handleFileChange} accept=".csv" />
              {error && <div className="text-danger mt-2">{error}</div>}
              {fileName && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger mt-2"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">
                Import
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
