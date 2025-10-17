import { Outlet, useNavigate } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiChevronLeft, mdiPlus } from "@mdi/js";
function AWBList() {
  const navigate = useNavigate();
  return (
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card d-md-flex">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <h4 className="card-title">
                  {(location.pathname.includes("/awb_list/add") ||
                    location.pathname.includes("/awb_list/edit") ) && (
                      <button
                        className="btn btn-light btn-md py-1 px-1 me-2"
                        onClick={() => navigate(-1)}
                      >
                        <Icon path={mdiChevronLeft} size={0.8} />
                      </button>
                    )}
                  Courier - AWB List{" "}
                </h4>
              </div>
              <div className="col-md-8 col-sm-12 d-flex justify-content-end gap-2">
                {!location.pathname.includes("/awb_list/edit") &&
                  !location.pathname.includes("/awb_list/add") && (
                    <button
                      onClick={() => navigate("add")}
                      type="button"
                      className="btn btn-dark btn-md py-2 px-4"
                    >
                      <Icon path={mdiPlus} size={0.7} /> Add AWB
                    </button>
                  )}
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AWBList;
