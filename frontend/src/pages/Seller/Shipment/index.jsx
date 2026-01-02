import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import OrdersFilter from "../Orders/OrdersFilter";
import Icon from "@mdi/react";
import { mdiClose, mdiFilterOutline } from "@mdi/js";

function Shipments() {
    const [showFilters, setShowFilters] = useState(false);
    const location = useLocation();

    const isShipmentView = location.pathname.startsWith("/shipments/view");
    useEffect(() => {
        if (isShipmentView) {
            setShowFilters(false);
        }
    }, [isShipmentView]);

    return (
        <div className="row">
            <div className="col-md-12 grid-margin stretch-card d-md-flex">
                <div className="card">
                    <div className="card-body">
                        <div className="row align-items-center">
                            <div className="col-md-4">
                                <h4 className="card-title">Shipment</h4>
                            </div>

                            <div className="col-md-8 col-sm-12 d-flex justify-content-end gap-2">
                                {!isShipmentView && (
                                    <button
                                        onClick={() => setShowFilters(prev => !prev)}
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

                            {!isShipmentView && showFilters && (
                                <OrdersFilter setShowFilters={setShowFilters} />
                            )}
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

export default Shipments;
