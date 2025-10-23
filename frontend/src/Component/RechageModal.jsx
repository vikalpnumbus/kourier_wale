import React, { useState } from "react";

function RechageModal({ onClose }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const quickAmounts = [200, 300, 500];

  const handleInputChange = (e) => {
    const value = e.target.value;

    if (/^\d*$/.test(value)) {
      setAmount(value);

      if (value === "" || parseInt(value, 10) < 200) {
        setError("Minimum recharge amount is ₹200");
      } else {
        setError("");
      }
    }
  };

  const handleConfirm = () => {
    if (!amount || parseInt(amount, 10) < 200) {
      setError("Minimum recharge amount is ₹200");
      return;
    }
    alert(`Payment confirmed for ₹${amount}`);
  };

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
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
        <div className="modal-content border-0 rounded-3 shadow-sm">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-semibold">Recharge Wallet</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body text-center">
            <div className="mb-3 fw-semibold text-start">
              Please select payment amount
            </div>

            <input
              type="text"
              className={`form-control text-center mb-1 ${
                error ? "is-invalid" : ""
              }`}
              value={amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              inputMode="numeric"
            />
            {error && (
              <div className="text-danger small text-start mt-1">{error}</div>
            )}

            <div className="d-flex justify-content-center gap-2 mt-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`btn ${
                    parseInt(amount, 10) === amt
                      ? "btn-primary text-white"
                      : "btn-outline-secondary"
                  } px-4`}
                  onClick={() => {
                    setAmount(amt);
                    setError("");
                  }}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-footer border-top-0 d-flex justify-content-center">
            <button className="btn btn-outline-secondary px-4" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-dark px-4"
              onClick={handleConfirm}
              disabled={!amount || parseInt(amount, 10) < 200}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RechageModal;
