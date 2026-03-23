import React from "react";
import { useNavigate } from "react-router-dom";

function AddChannelPage() {
    const navigate = useNavigate()
  return (
    <>
      <div>
        <div className="section-label">Available Platforms</div>
        <div className="channels-grid">
          <div className="channel-available-card connected">
            <div className="connected-badge">
              ✓
            </div>
            <div className="channel-logo-wrap logo-shopify">SH</div>
            <div>
              <div className="channel-card-name">Shopify</div>
              <div className="channel-card-type">E-Commerce</div>
            </div>
            <button
              onClick={() => navigate("shopify")}
              className="channel-card-btn connected-btn"
            > Connected
            </button>
          </div>
          <div className="channel-available-card">
            <div className="channel-logo-wrap logo-woo">WC</div>

            <div>
              <div className="channel-card-name">WooCommerce</div>
              <div className="channel-card-type">E-Commerce</div>
            </div>
            <button className="channel-card-btn connect">
              Connect
            </button>
          </div>
          <div className="channel-available-card">
            <div className="channel-logo-wrap logo-magento">MG</div>
            <div>
              <div className="channel-card-name">Magento</div>
              <div className="channel-card-type">E-Commerce</div>
            </div>
            <button className="channel-card-btn connect">
              Connect
            </button>
          </div>
          <div className="channel-available-card">
            <div className="channel-logo-wrap logo-opencart">OC</div>
            <div>
              <div className="channel-card-name">OpenCart</div>
              <div className="channel-card-type">E-Commerce</div>
            </div>
            <button className="channel-card-btn connect">
              Connect
            </button>
          </div>
          <div className="channel-available-card">
            <div className="channel-logo-wrap logo-custom">API</div>
            <div>
              <div className="channel-card-name">Custom API</div>
              <div className="channel-card-type">Developer</div>
            </div>
            <button className="channel-card-btn connect">
              Connect
            </button>
          </div>
          <div className="channel-available-card">
            <div className="channel-logo-wrap logo-amazon">AMZ</div>
            <div>
              <div className="channel-card-name">Amazon</div>
              <div className="channel-card-type">Marketplace</div>
            </div>
            <button className="channel-card-btn connect">
              Connect
            </button>
          </div>
          <div className="channel-available-card">
            <div className="channel-logo-wrap logo-flipkart">FK</div>
            <div>
              <div className="channel-card-name">Flipkart</div>
              <div className="channel-card-type">Marketplace</div>
            </div>
            <button className="channel-card-btn connect">
              Connect
            </button>
          </div>
          <div className="channel-available-card">
            <div className="channel-logo-wrap logo-meesho">MS</div>
            <div>
              <div className="channel-card-name">Meesho</div>
              <div className="channel-card-type">Marketplace</div>
            </div>
            <button className="channel-card-btn connect">
              Connect
            </button>
          </div>
          <div className="channel-available-card">
            <div className="channel-logo-wrap logo-unicom">UC</div>
            <div>
              <div className="channel-card-name">Unicommerce</div>
              <div className="channel-card-type">OMS</div>
            </div>
            <button className="channel-card-btn connect">
              Connect
            </button>
          </div>
          <div className="channel-available-card">
            <div className="channel-logo-wrap logo-excel">XL</div>
            <div>
              <div className="channel-card-name">Excel Upload</div>
              <div className="channel-card-type">Bulk Import</div>
            </div>
            <button className="channel-card-btn connect">
              Connect
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddChannelPage;
