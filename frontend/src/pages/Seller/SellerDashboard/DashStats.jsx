import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import SellerDashboardConfig from '../../../config/SellerDashboard/SellerDashboardConfig';
import api from '../../../utils/api';

function DashStats({ defaultStart, defaultEnd }) {
    const [loading, setLoading] = useState(false);
    const [statsData, setStatsData] = useState([]);
    const [searchParams] = useSearchParams();
    const getPercentage = (value, total) =>
        total > 0 ? `${((value / total) * 100).toFixed(2)}%` : "0%";

    const StatsSkeleton = () => (
        <div className="statistics-details d-flex align-items-center justify-content-between w-100">
            {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                    <div className="skeleton skeleton-text mb-2" style={{ width: 120 }} />
                    <div className="skeleton skeleton-number" style={{ width: 80 }} />
                </div>
            ))}
        </div>
    );


    const handleFetchData = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: searchParams.get("start_date") || defaultStart,
                end_date: searchParams.get("end_date") || defaultEnd,
            };
            const query = Object.entries(params)
                .map(([k, v]) => `${k}=${v}`)
                .join("&");

            const url = `${SellerDashboardConfig.dashStats}?${query}`;

            const { data } = await api.get(url);

            setStatsData(data?.data[0] || []);
        } catch (error) {
            console.error("Fetch error:", error);
            setStatsData([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        handleFetchData();
    }, [searchParams]);
    return (
        <>
            <div className="row">
                <div className="col-sm-12">
                    <div className="statistics-details d-flex align-items-center justify-content-between">
                        {loading ? (
                            <StatsSkeleton />
                        ) : (
                            <>
                                <div>
                                    <p className="statistics-title">Total Order</p>
                                    <h3 className="rate-percentage">
                                        {statsData?.total_delivered_shipments || "--"}
                                    </h3>
                                </div>

                                <div>
                                    <p className="statistics-title">Total Shipment</p>
                                    <h3 className="rate-percentage">
                                        {statsData?.total_shipments || "--"}
                                    </h3>
                                </div>

                                <div>
                                    <p className="statistics-title">Total Revenue</p>
                                    <h3 className="rate-percentage">
                                        {statsData?.revenue || "--"}
                                    </h3>
                                </div>

                                <div>
                                    <p className="statistics-title">Total RTO</p>
                                    <h3 className="rate-percentage">
                                        {getPercentage(
                                            statsData?.rto || 0,
                                            statsData?.total_delivered_shipments || 0
                                        )}
                                    </h3>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashStats
