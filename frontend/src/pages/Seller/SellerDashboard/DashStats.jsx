import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import SellerDashboardConfig from '../../../config/SellerDashboard/SellerDashboardConfig';
import api from '../../../utils/api';
import Icon from "@mdi/react";
import {mdiPackageVariantClosed, mdiTruckFast,mdiCurrencyInr,mdiBackupRestore} from "@mdi/js";

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

            setStatsData(data?.data || {});
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
            <div className="row dashboard-stats">
  <div className="col-sm-12">
    {loading ? (
      <StatsSkeleton />
    ) : (
      <div className="row g-3">

        <div className="col-md-3">
          <div className="stat-card c-blue">
            <div className="stat-top">
              <div className="stat-icon blue">
                <Icon path={mdiPackageVariantClosed} size={0.8} />
              </div>
              <p className="statistics-title">Total Orders</p>
              <p className="stat-subtitle">All orders created on platform</p>
            </div>

            <h3 className="stat-value">
              {statsData?.total_orders || "--"}
            </h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card c-green">
            <div className="stat-top">
              <div className="stat-icon purple">
                <Icon path={mdiTruckFast} size={0.8} />
              </div>
              <p className="statistics-title">Total Shipments</p>
              <p className="stat-subtitle">Orders shipped via couriers</p>
            </div>

            <h3 className="stat-value">
              {statsData?.total_shipments || "--"}
            </h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card c-silver">
            <div className="stat-top">
              <div className="stat-icon green">
                <Icon path={mdiCurrencyInr} size={0.8} />
              </div>
              <p className="statistics-title">Total Revenue</p>
              <p className="stat-subtitle">Revenue generated from deliveries</p>
            </div>

            <h3 className="stat-value">
              ₹ {statsData?.revenue || "--"}
            </h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card c-gold">
            <div className="stat-top">
              <div className="stat-icon red">
                <Icon path={mdiBackupRestore} size={0.8} />
              </div>
              <p className="statistics-title">RTO Rate</p>
              <p className="stat-subtitle">Return to origin shipment rate</p>
            </div>

            <h3 className="stat-value">
              {getPercentage(
                statsData?.rto || 0,
                statsData?.total_delivered_shipments || 0
              )}
            </h3>
          </div>
        </div>

      </div>
    )}
  </div>
</div>
        </>
    )
}

export default DashStats
