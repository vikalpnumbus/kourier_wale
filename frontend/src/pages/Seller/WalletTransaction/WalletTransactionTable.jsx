import React, { useEffect, useState } from 'react'
import api from '../../../utils/api';
import walletTransactionConfig from '../../../config/WalletTransaction/WalletTransactionConfig';
import Pagination from '../../../Component/Pagination';
import { formatDateTime } from '../../../middleware/CommonFunctions';
import { useSearchParams } from 'react-router-dom';

function WalletTransactionTable() {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [searchParams] = useSearchParams();
    const handleFetchData = async () => {
        setLoading(true);
        try {
            const page = parseInt(searchParams.get("page") || "1", 10);
            const limit = parseInt(searchParams.get("limit") || "10", 10);
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", limit);

            const url = `${walletTransactionConfig.walletTransaction}?${params.toString()}`;

            const { data } = await api.get(url);

            setDataList(data?.data?.result || []);
            setTotalCount(data?.data?.total || 0);
        } catch (error) {
            console.error("Fetch error:", error);
            setDataList([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        handleFetchData();
    }, [searchParams]);
    return (
        <div className="tab-content tab-content-vertical">
            <div className="tab-pane fade show active">
                <div className="table-responsive h-100">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th>Credit(₹)</th>
                                <th>Debit(₹)</th>
                                <th>Closing Balance(₹)</th>
                                <th>Description</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8">
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
                                        <td>
                                            {data?.createdAt ? formatDateTime(data?.createdAt) : '-'}
                                        </td>
                                        <td>{data?.id || '-'}</td>
                                        <td>{data?.payment_type === "CREDIT" ? data?.amount : '-'}</td>
                                        <td>{data?.payment_type === "DEBIT" ? data?.amount : '-'}</td>
                                        <td>{data?.closing_balance || '-'}</td>
                                        <td>{`${data?.payment_type === "CREDIT" ? "Credit" : data?.payment_type === "DEBIT" ? "Debit" : "Payment"} Applied For Razorpay Recharge.`}</td>
                                    </tr>

                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
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
            </div>
        </div>
    )
}

export default WalletTransactionTable
