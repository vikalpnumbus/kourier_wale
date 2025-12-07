import React, { useState } from "react";
import Icon from "@mdi/react";
import { mdiChevronLeft, mdiClose, mdiFilterOutline } from "@mdi/js";
import { Outlet, useNavigate } from "react-router-dom";
import UsersFilter from "./UsersFilter";

function Users() {
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card d-md-flex">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <h4 className="card-title">
                  {location.pathname.includes("/users/view") && (
                    <button
                      className="btn btn-light btn-md py-1 px-1 me-2"
                      onClick={() => navigate(-1)}
                    >
                      <Icon path={mdiChevronLeft} size={0.8} />
                    </button>
                  )}
                  {location.pathname.includes("/users/view") ? "User View" : "Users"}
                </h4>
              </div>
              <div className="col-md-8 col-sm-12 d-flex justify-content-end gap-2">
                {!location.pathname.includes("/admin/users/view") && (
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    type="button"
                    className="btn btn-dark btn-md py-2 px-4"
                  >
                    {showFilters ? (
                      <>
                        <Icon path={mdiClose} size={0.7} /> Close
                      </>
                    ) : (
                      <>
                        <Icon path={mdiFilterOutline} size={0.7} /> Filter
                      </>
                    )}
                  </button>
                )}
              </div>
              {!location.pathname.includes("/admin/users/view") &&
                showFilters && <UsersFilter setShowFilters={setShowFilters} />}
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

export default Users;
