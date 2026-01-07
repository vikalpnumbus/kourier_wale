import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SellerDashboardConfig from "../../../config/SellerDashboard/SellerDashboardConfig";
import api from "../../../utils/api";

import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function PaymentModeWise({ defaultStart, defaultEnd }) {
    const [loading, setLoading] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [searchParams] = useSearchParams();

    // 🔹 Fetch API
    const handleFetchData = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: searchParams.get("start_date") || defaultStart,
                end_date: searchParams.get("end_date") || defaultEnd,
            };

            const query = new URLSearchParams(params).toString();
            const url = `${SellerDashboardConfig.paymentModeWiseStats}?${query}`;

            const { data } = await api.get(url);
            setStatsData(data?.data[0] || null);
        } catch (error) {
            console.error("Fetch error:", error);
            setStatsData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetchData();
    }, [searchParams]);

    // 🔹 Chart Effect
    useEffect(() => {
        if (Number(statsData?.cod_payments || 0) + Number(statsData?.prepaid_payments || 0) === 0) return;

        const root = am5.Root.new("paymentModeChart");
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(
            am5percent.PieChart.new(root, {
                endAngle: 270,
            })
        );

        const series = chart.series.push(
            am5percent.PieSeries.new(root, {
                valueField: "value",
                categoryField: "category",
                endAngle: 270,
            })
        );

        series.states.create("hidden", {
            endAngle: -90,
        });

        // 🔹 Transform API data
        const chartData = [
            {
                category: "COD",
                value: Number(statsData.cod_payments || 0),
            },
            {
                category: "Prepaid",
                value: Number(statsData.prepaid_payments || 0),
            },
        ];

        series.data.setAll(chartData);
        series.appear(1000, 100);

        return () => {
            root.dispose();
        };
    }, [statsData]);

    return (
        <div className="col-lg-6 d-flex flex-column">
            <div className="row flex-grow">
                <div className="col-12 grid-margin stretch-card">
                    <div className="card card-rounded">
                        <div className="card-body">
                            <h4 className="card-title card-title-dash">
                                Payment Wise Load
                            </h4>

                            {loading ? (
                                <div className="dot-opacity-loader">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            ) : (
                                Number(statsData?.cod_payments || 0) + Number(statsData?.prepaid_payments || 0) > 0 ? (
                                    <div id="paymentModeChart" className="chart-container" style={{ width: "100%", height: "450px" }}></div>
                                ) : (
                                    <div className="text-center" style={{ height: "450px" }}>
                                        <p>No records found</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentModeWise;
