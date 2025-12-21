import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../../middleware/CommonFunctions';

function ManageWeight() {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    return (
        <div className="tab-content tab-content-vertical">
            <div className="tab-pane fade show active">
                <div className="table-responsive h-100">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Courier</th>
                                <th>Seller</th>
                                <th>Account Manager</th>
                                <th>Seller Wgt.</th>
                                <th>Courier Wgt.</th>
                                <th>Add. Details</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="dot-opacity-loader">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </td>
                                </tr>
                            ) : dataList.length > 0 ? (
                                dataList.map((data) => (
                                    <tr key={data.id}>
                                        <td><Link to={`view/${data.id}`}>{data?.fname}</Link></td>
                                        <td>{data?.email}</td>
                                        <td>{data?.companyName}</td>
                                        <td>
                                            {data?.pricingPlanId === 1
                                                ? "Bronze"
                                                : data?.pricingPlanId === 2
                                                    ? "Silver"
                                                    : data?.pricingPlanId === 3
                                                        ? "Gold"
                                                        : data?.pricingPlanId === 4
                                                            ? "Platinum"
                                                            : ""}
                                        </td>

                                        <td>
                                            {data?.createdAt ? formatDateTime(data.createdAt) : ""}
                                        </td>

                                        <td>
                                            {data?.isVerified ? (
                                                <span className="text-success">Verified</span>
                                            ) : (
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-outline-primary btn-md px-3"
                                                        onClick={() =>
                                                            setModalData({ id: data.id, action: "approve" })
                                                        }
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        className="btn btn-outline-danger btn-md px-3"
                                                        onClick={() =>
                                                            setModalData({ id: data.id, action: "reject" })
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* {dataList.length > 0 && !loading && (
            <Pagination totalCount={totalCount} />
          )} */}
            </div>
        </div>
    )
}

export default ManageWeight
