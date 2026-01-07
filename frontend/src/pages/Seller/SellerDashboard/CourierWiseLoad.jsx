import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function CourierWiseLoad({ statsData, loading }) {
    useEffect(() => {
        if (!statsData.length) return;

        const root = am5.Root.new("chartdiv");
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

        const chartData = statsData.map((item) => {
            const totalLoad =
                Number(item.pending_pickup) +
                Number(item.delivered_count) +
                Number(item.rto_count) +
                Number(item.in_transit_count);

            return {
                category: item.courier_name,
                value: totalLoad,
            };
        });

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
                                Courier Wise Load
                            </h4>

                            {loading ? (
                                <div className="dot-opacity-loader">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            ) : (
                                <div
                                    id="chartdiv"
                                    style={{ width: "100%", height: "450px" }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourierWiseLoad;
