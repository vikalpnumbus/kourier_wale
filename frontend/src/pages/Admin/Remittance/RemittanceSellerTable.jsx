import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import RemittanceConfig from '../../../config/AdminConfig/Remittance/RemittanceConfig';
import api from '../../../utils/api';
import Pagination from '../../../Component/Pagination';
import { formatDateTime } from '../../../middleware/CommonFunctions';

function RemittanceSellerTable() {
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

            const url = `${RemittanceConfig.remittanceSellerListApi}?${params.toString()}`;

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
                            <th>Remittance Id</th>
                            <th>Company-Seller Id</th>
                            <th>Created At</th>
                            <th>Paid</th>
                            <th>Remittance Amount</th>
                            <th>Payment Date</th>
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
                                    <td className="py-2">{data?.id || ""}</td>
                                    <td className="py-2">{data?.user?.companyName && data?.userId ? data?.user?.companyName + " - " + data?.userId : ""}</td>
                                    <td className="py-2">
                                        {data?.createdAt ? formatDateTime(data?.createdAt) : ""}
                                    </td>
                                    <td className="py-2">
                                        {data?.remittance_status === "paid" ? "Yes" : "No"}
                                    </td>
                                    <td className="py-2">{data?.remittance_amount || ""}</td>
                                    <td className="py-2">
                                        {data?.remittance_paid_date ? formatDateTime(data?.remittance_paid_date) : ""}
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
    )
}

export default RemittanceSellerTable
