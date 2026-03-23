import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../../../assets/escalation/escalation.css";

function Escalation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Support · Ticket Management</div>
          <h1 className="page-title">Escalation</h1>
        </div>

        <div className="page-header-right">
          {!location.pathname.includes("/support/add") &&
            !location.pathname.includes("/support/view") && (
              <button
                onClick={() => navigate("add")}
                className="btn btn-primary"
              >
                <Icon path={mdiPlus} size={0.7} />
                <span>Create Escalation</span>
              </button>
            )}
        </div>
      </div>
      <div className="content-card">
        <Outlet />
      </div>
    </div>
  );
}

export default Escalation;