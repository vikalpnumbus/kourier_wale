import React, { useEffect, useState } from 'react'
import Pagination from "../../../Component/Pagination";
import { useSearchParams } from 'react-router-dom';
import api from "../../../utils/api";
import RemittanceConfig from '../../../config/AdminConfig/Remittance/RemittanceConfig';
import { formatDateTime } from '../../../middleware/CommonFunctions';

function RemittanceTable() {
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

            // const url = `${RemittanceConfig.remittanceListApi}?${params.toString()}`;
            const url = `${RemittanceConfig.remittanceListApi}`;

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
        <>
            <div className="table-responsive h-100">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Seller Id</th>
                            <th>Company Name</th>
                            <th>Wallet Balance</th>
                            <th>Created At</th>
                            <th>On Hold</th>
                            <th>Remittance Cycle</th>
                            <th>Remittance Amount</th>
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
                                    <td className="py-2">{data?.remittances[0]?.userId || ""}</td>
                                    <td className="py-2">{data?.remittances[0]?.user?.companyName || ""}</td>
                                    <td className="py-2">{data?.remittances[0]?.user?.wallet_balance || ""}</td>
                                    <td className="py-2">
                                        {data?.createdAt ? formatDateTime(data?.createdAt) : ""}
                                    </td>
                                    <td className="py-2">
                                        -
                                    </td>
                                    <td className="py-2">{data?.remittances[0]?.user?.seller_remit_cycle ? `T+${data?.remittances[0]?.user?.seller_remit_cycle}` : ""}</td>
                                    <td className="py-2">{data?.remittance_amount}</td>
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
    )
}

export default RemittanceTable
