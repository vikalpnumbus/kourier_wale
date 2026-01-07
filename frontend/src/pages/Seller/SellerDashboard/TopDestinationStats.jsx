import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SellerDashboardConfig from "../../../config/SellerDashboard/SellerDashboardConfig";
import api from "../../../utils/api";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function TopDestinationStats({ defaultStart, defaultEnd }) {
    const [loading, setLoading] = useState(false);
    const [statsData, setStatsData] = useState([]);
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
            const url = `${SellerDashboardConfig.cityWiseStats}?${query}`;

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

    // 🔹 Chart Effect
    useEffect(() => {
        if (!statsData.length) return;

        const root = am5.Root.new("topDestinationChart");
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: true,
                panY: true,
                wheelX: "panX",
                wheelY: "zoomX",
                pinchZoomX: true,
                paddingLeft: 0,
                paddingRight: 1,
            })
        );

        const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
        cursor.lineY.set("visible", false);

        // 🔹 X Axis
        const xRenderer = am5xy.AxisRendererX.new(root, {
            minGridDistance: 30,
            minorGridEnabled: true,
        });

        xRenderer.labels.template.setAll({
            rotation: -90,
            centerY: am5.p50,
            centerX: am5.p100,
            paddingRight: 15,
        });

        const xAxis = chart.xAxes.push(
            am5xy.CategoryAxis.new(root, {
                categoryField: "city",
                renderer: xRenderer,
                tooltip: am5.Tooltip.new(root, {}),
            })
        );

        // 🔹 Y Axis
        const yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, {
                    strokeOpacity: 0.1,
                }),
            })
        );

        // 🔹 Series
        const series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
                name: "Shipments",
                xAxis,
                yAxis,
                valueYField: "shipment_count",
                categoryXField: "city",
                sequencedInterpolation: true,
                tooltip: am5.Tooltip.new(root, {
                    labelText: "{valueY}",
                }),
            })
        );

        series.columns.template.setAll({
            cornerRadiusTL: 5,
            cornerRadiusTR: 5,
            strokeOpacity: 0,
        });

        series.columns.template.adapters.add("fill", (_, target) =>
            chart.get("colors").getIndex(series.columns.indexOf(target))
        );

        series.columns.template.adapters.add("stroke", (_, target) =>
            chart.get("colors").getIndex(series.columns.indexOf(target))
        );

        // 🔹 Set data
        xAxis.data.setAll(statsData);
        series.data.setAll(statsData);

        series.appear(1000);
        chart.appear(1000, 100);

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
                                Top Destination
                            </h4>

                            {loading ? (
                                <div className="dot-opacity-loader">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            ) : (
                                statsData.length > 0 ? (
                                    <div
                                        id="topDestinationChart"
                                        style={{ width: "100%", height: "450px" }}
                                    />
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

export default TopDestinationStats;
