import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import SellerDashboardConfig from '../../../config/SellerDashboard/SellerDashboardConfig';
import api from '../../../utils/api';
import CourierWiseLoad from './CourierWiseLoad';
import CourierWiseStatus from './CourierWiseStatus';

function CourierWise({ defaultStart, defaultEnd }) {
    const [loading, setLoading] = useState(false);
    const [statsData, setStatsData] = useState([]);
    const [searchParams] = useSearchParams();

    const handleFetchData = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: searchParams.get("start_date") || defaultStart,
                end_date: searchParams.get("end_date") || defaultEnd,
            };

            const query = new URLSearchParams(params).toString();
            const url = `${SellerDashboardConfig.courierWiseStats}?${query}`;

            const { data } = await api.get(url);
            setStatsData(data?.data || []);
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
        <div className="row">
            <CourierWiseLoad statsData={statsData} loading={loading} />
            <CourierWiseStatus statsData={statsData} loading={loading} />
        </div>
    )
}

export default CourierWise
