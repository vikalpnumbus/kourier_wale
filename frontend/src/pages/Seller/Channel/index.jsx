
import Icon from "@mdi/react";
import { mdiClose, mdiCloudDownload, mdiPlus } from "@mdi/js";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "../../../assets/channel/channel.css";
function Channel() {
    const navigate = useNavigate();
  const location = useLocation();

 
  return (
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card d-md-flex">
        <div className="card">
          <div className="card-body">
            <div className="page-header">
              <div>
                <div className="page-eyebrow">Settings · Integrations</div>
                <h1 className="page-title">Channel Integrations</h1>
                <p className="page-subtitle">
                  Connect your storefronts and sync orders automatically into Veygo
                </p>
              </div>

              {!location.pathname.includes("/channel/edit") &&
                !location.pathname.includes("/channel/add") && (
                  <button
                    onClick={() => navigate("add")}
                    className="btn btn-primary"
                  >
                    <Icon path={mdiPlus} size={0.7} /> Add Channel
                  </button>
                )}
            </div>

            <div className="table-card mt-3">
              <div className="table-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="table-title">Connected Channels</span>
                  <span className="table-count">List</span>
                </div>
              </div>

              <div className="p-3">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Channel
