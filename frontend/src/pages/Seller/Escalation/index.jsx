import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function Escalation() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card d-md-flex">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <h4 className="card-title">Escalation
                </h4>
              </div>
              <div className="col-md-8 col-sm-12 d-flex justify-content-end gap-2">
                {
                  !location.pathname.includes("/support/add") &&
                  !location.pathname.includes("/support/view") && (
                    <button
                      onClick={() => navigate("add")}
                      type="button"
                      className="btn btn-dark btn-md py-2 px-4"
                    >
                      <Icon path={mdiPlus} size={0.7} /> Create Escalation
                    </button>
                  )}

              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <div className="tab-content tab-content-vertical">
                  <div className="tab-pane fade show active" role="tabpanel">
                    <Outlet />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Escalation;
