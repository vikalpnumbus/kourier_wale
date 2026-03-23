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
                <div className="table-card">
                    <div style={{ overflowX: "auto" }}>
                        <table className="txn-table">
                            <thead>
                                <tr>
                                    <th className="th-first">Date & Time</th>
                                    <th>TXN ID</th>
                                    <th>Type</th>
                                    <th className="th-r">Credit (₹)</th>
                                    <th className="th-r">Debit (₹)</th>
                                    <th className="th-r">Closing Balance (₹)</th>
                                    <th className="th-last">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                    <td colSpan="7">Loading...</td>
                                    </tr>
                                ) : dataList.length > 0 ? (
                                    dataList.map((data) => {
                                    const isCredit = data?.payment_type === "CREDIT";

                                    return (
                                        <tr key={data.id}>
                                        {/* DATE */}
                                        <td className="td-first">
                                            <div className="date-cell">
                                            <div className="dc-date">
                                                {data?.createdAt ? formatDateTime(data.createdAt).split(",")[0] : "-"}
                                            </div>
                                            <div className="dc-time">
                                                {data?.createdAt ? formatDateTime(data.createdAt).split(",")[1] : ""}
                                            </div>
                                            </div>
                                        </td>

                                        {/* TXN ID */}
                                        <td>
                                            <div className="txnid-cell">#{data?.id}</div>
                                        </td>

                                        {/* TYPE BADGE */}
                                        <td>
                                            <div className={`type-badge ${isCredit ? "tbt-credit" : "tbt-debit"}`}>
                                            <span className="tb-dot"></span>
                                            {isCredit ? "CREDIT" : "DEBIT"}
                                            </div>
                                        </td>

                                        {/* CREDIT */}
                                        <td className="td-r">
                                            {isCredit ? (
                                            <span className="amt-credit">₹ {data.amount}</span>
                                            ) : (
                                            <span className="amt-dash">—</span>
                                            )}
                                        </td>

                                        {/* DEBIT */}
                                        <td className="td-r">
                                            {!isCredit ? (
                                            <span className="amt-debit">₹ {data.amount}</span>
                                            ) : (
                                            <span className="amt-dash">—</span>
                                            )}
                                        </td>

                                        {/* BALANCE */}
                                        <td className="td-r">
                                            <span className="balance-cell">
                                            ₹ {data?.closing_balance || 0}
                                            </span>
                                        </td>

                                        {/* DESCRIPTION */}
                                        <td className="td-last">
                                            <div className="desc-cell">
                                            {isCredit ? "Wallet Recharge" : "Shipment Deduction"}
                                            <div className="desc-ref">
                                                {data?.payment_type} Applied
                                            </div>
                                            </div>
                                        </td>
                                        </tr>
                                    );
                                    })
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
                </div>

                {dataList.length > 0 && !loading && (
                    <Pagination totalCount={totalCount} />
                )}
            </div>
        </div>
    )
}

export default WalletTransactionTable
