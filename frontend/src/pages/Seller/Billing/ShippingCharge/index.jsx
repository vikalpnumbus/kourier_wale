import React from 'react'
import { Outlet } from 'react-router-dom'

function ShippingCharge() {
    return (
        <div className="row">
            <div className="col-md-12 grid-margin stretch-card d-md-flex">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                <h4 className="card-title">
                                    Shipping Charges
                                </h4>
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

export default ShippingCharge
