import React, { useEffect, useState } from "react";
import { mdiEye } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../../utils/api";
import SupportConfig from "../../../config/AdminConfig/Support/SupportConfig";
import { formatDateTime } from "../../../middleware/CommonFunctions";
import Pagination from "../../../Component/Pagination";

function SupportTable() {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const [totalCount, setTotalCount] = useState(0);

    const handleFetchData = async () => {
        setLoading(true);
        try {
            const page = parseInt(searchParams.get("page") || "1", 10);
            const limit = parseInt(searchParams.get("limit") || "10", 10);

            // Build query params
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", limit);

            const url = `${SupportConfig.support}?${params.toString()}`;

            const { data } = await api.get(url);

            setDataList(data?.data?.result || []);
            setTotalCount(data?.data?.total || 0);
        } catch (error) {
            console.error("Fetch channel error:", error);
            setDataList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetchData();
    }, [searchParams]);
    return (
        <div>
            <>
                <div className="table-responsive h-100">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Escalation Type</th>
                                <th>Details</th>
                                <th>Ticket Created</th>
                                <th>Last Update</th>
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
                                        <td className="py-2">{data.id || ""}</td>
                                        <td className="py-2">{data.type || ""}</td>
                                        <td className="py-2">details</td>
                                        <td className="py-2">
                                            {data?.createdAt ? formatDateTime(data?.createdAt) : ""}
                                        </td>
                                        <td className="py-2">
                                            {data?.updatedAt ? formatDateTime(data?.updatedAt) : ""}
                                        </td>
                                        <td className="py-2">status</td>

                                        <td className="py-2">
                                            <div className="btn-group">
                                                <Link
                                                    to={`view/${data.id}`}
                                                    className="btn btn-outline-primary btn-md py-2 px-3"
                                                >
                                                    <Icon path={mdiEye} size={0.6} /> View Escalation
                                                </Link>
                                            </div>
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
                {dataList.length > 0 && !loading && (
                    <Pagination totalCount={totalCount} />
                )}
            </>
        </div>
    )
}

export default SupportTable
