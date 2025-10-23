import React, { useState } from "react";

function RechargeModal({ onClose }) {
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

  const handleConfirm = async () => {
    if (!amount || parseInt(amount, 10) < 200) {
      setError("Minimum recharge amount is ₹200");
      return;
    }

    try {
      // 1️⃣ Create Razorpay order
      const response = await fetch("http://localhost:3001/api/v1/payments/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer b9cb99335c0348a27753deec471c6e7b4456cad8941502e6ae60f2e53b16ed624d62fdf85397d3e0681afb2712e5e3c48070be32db60f5dcbff39e1e773f0e65a249e967304018446ea122d85f0385542381e2946518c1a9400078abf793ec67c338fb9a9188b000d0d17f7e16349fa4a9bc587ee30f29332ca620b94a874afa42aadba2c209a80f74075a05655324e07ce6281b8c0c3a53f6152d3c093b5ea4",
        },
        body: JSON.stringify({ amount: parseInt(amount, 10) }),
      });

      const orderData = await response.json();
      const order = orderData?.data;

      if (!order) {
        alert("Error: Unable to create payment order.");
        return;
      }

      // 2️⃣ Razorpay Options
      const options = {
        key: "rzp_test_RWRrXY5L9hZwD6",
        amount: order.amount,
        currency: order.currency,
        name: "Kourier Wale",
        description: "Wallet Recharge",
        image: "https://kourierwale.in/wp-content/uploads/2024/06/cropped-KW-32x32.png",
        order_id: order.id,
        handler: async function (response) {
          // 3️⃣ Verify payment
          const verifyRes = await fetch("http://localhost:3001/api/v1/payments/razorpay/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer b9cb99335c0348a27753deec471c6e7b4456cad8941502e6ae60f2e53b16ed62408936585b1d6d73e932cc425d7c9972ce820906aee711f3d289382dcffcf1c51fdf3df1752a3578d8c9ecf1f158ee9a61a97b72a78e314f7946e83c39d6c32d9830cf711210b671405eb59efb14ce3f4dacf498e5575223fa761a92250ebeee5193f8d12314b306af40344716dfc17c8b37e851cfc0e756d877c8a65e1e9d97",
            },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.status === 200) {
            alert(verifyData.data?.message || "✅ Payment Successful");
          } else {
            alert("❌ Payment Verification Failed");
          }
        },
        prefill: {
          name: "Rahul Singh",
          email: "rahul@example.com",
          contact: "9999999999",
        },
        notes: { plan: "Wallet Recharge" },
        theme: { color: "#4599cd" },
      };

      // 4️⃣ Open Razorpay Payment Window
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Error during payment initialization");
    }
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
      <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 rounded-3 shadow-sm">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-semibold">Recharge Wallet</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>

          <div className="modal-body text-center">
            <div className="mb-3 fw-semibold text-start">Please select payment amount</div>

            <input
              type="text"
              className={`form-control text-center mb-1 ${error ? "is-invalid" : ""}`}
              value={amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              inputMode="numeric"
            />
            {error && <div className="text-danger small text-start mt-1">{error}</div>}

            <div className="d-flex justify-content-center gap-2 mt-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`btn ${parseInt(amount, 10) === amt ? "btn-primary text-white" : "btn-outline-secondary"} px-4`}
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

export default RechargeModal;
