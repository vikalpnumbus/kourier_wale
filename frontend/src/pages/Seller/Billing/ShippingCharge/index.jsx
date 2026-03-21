import React from "react";
import { Outlet } from "react-router-dom";
import "../../../../assets/Billing/shippingcharges.css";
function ShippingCharge() {
  return (
    <div className="shipping-page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">
            Billing · Transaction Ledger
          </div>
          <h1 className="page-title">Shipping Charges</h1>
          <p className="page-subtitle">
            All debit and credit entries across your shipping transactions
          </p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-ghost">Export CSV</button>
          <button className="btn btn-ghost">Date Range</button>
        </div>
      </div>
      <div className="mt-3">
        <Outlet />
      </div>
    </div>
  );
}

export default ShippingCharge;