import React from "react";

function CourierWiseStatus({ statsData = [], loading }) {
    const getNumber = (val) => Number(val) || 0;

    return (
        <div className="col-lg-6 d-flex flex-column">
            <div className="row flex-grow">
                <div className="col-12 grid-margin stretch-card">
                    <div className="card card-rounded">
                        <div className="card-body">
                            <h4 className="card-title card-title-dash">
                                Courier Wise Status
                            </h4>

                            {loading ? (
                                <div className="dot-opacity-loader">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            ) : (
                                <div className="table-responsive h-100">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Courier</th>
                                                <th>Total</th>
                                                <th>Pending Pickup</th>
                                                <th>In Transit</th>
                                                <th>Delivered</th>
                                                <th>RTO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statsData.length > 0 ? (
                                                statsData.map((data) => {
                                                    const pending = getNumber(data.pending_pickup);
                                                    const transit = getNumber(data.in_transit_count);
                                                    const delivered = getNumber(data.delivered_count);
                                                    const rto = getNumber(data.rto_count);

                                                    const total =
                                                        pending + transit + delivered + rto;

                                                    return (
                                                        <tr key={data.courier_id}>
                                                            <td className="py-3">
                                                                {data.courier_name || "-"}
                                                            </td>
                                                            <td className="py-3">{total}</td>
                                                            <td className="py-3">{pending}</td>
                                                            <td className="py-3">{transit}</td>
                                                            <td className="py-3">{delivered}</td>
                                                            <td className="py-3">{rto}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
                                                        No records found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourierWiseStatus;
