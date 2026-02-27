import React from 'react'
import { Outlet } from 'react-router-dom'

function Remittance() {
    return (
        <div className="row">
            <div className="col-md-12 grid-margin stretch-card d-md-flex">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                <h4 className="card-title">
                                    COD Remittance
                                </h4>
                                <p className="remittance-subtitle">
                                View your COD remittance history and settlement status
                                </p>
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

export default Remittance
