import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";

function PricingPlans() {
  const navigate = useNavigate()
  return (
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card d-md-flex">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <h4 className="card-title">
                  
                  Pricing Plans
                </h4>
              </div>
              <div className="col-md-8 col-sm-12 d-flex justify-content-end gap-2">
                {!location.pathname.includes("/plans/edit") &&
                  !location.pathname.includes("/plans/add") && (
                    <button
                      onClick={() => navigate("add")}
                      type="button"
                      className="btn btn-dark btn-md py-2 px-4"
                    >
                      <Icon path={mdiPlus} size={0.7} /> 
                      Add Plan
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
  )
}

export default PricingPlans
