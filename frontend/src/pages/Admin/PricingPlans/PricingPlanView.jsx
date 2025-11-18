import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import PricingPlanConfig from "../../../config/PricingPlan/PricingPlanConfig";
import { useAlert } from "../../../middleware/AlertContext";

function PricingPlanView() {
  const { showError } = useAlert();

  const [courierPricingPlan, setCourierPricingPlan] = useState({});
  const [courierSuccess, setCourierSuccess] = useState({});
  const [loading, setLoading] = useState(false);

  const TYPE_ORDER = ["forward", "rto", "weight"];

  // ---- GROUP PRICING PLAN ----
  function groupCourierData(data) {
    return data.reduce((acc, item) => {
      const id = item.courier_id;
      if (!acc[id]) {
        acc[id] = {
          courier_name: item.courier_name?.trim() || "",
          data: {},
        };
      }
      acc[id].data[item.type] = item;
      return acc;
    }, {});
  }

  // ---- GROUP PRICING CARD (success values) ----
  function groupSuccessData(data) {
    return data.reduce((acc, item) => {
      const id = item.courier_id;
      if (!acc[id]) {
        acc[id] = {};
      }
      acc[id][item.type] = item; // entire record per type
      return acc;
    }, {});
  }

  // ---- GET PRICING PLAN ----
  const fetchPricingPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get(PricingPlanConfig.pricingPlanCourierApi);
      const grouped = groupCourierData(res?.data?.data?.result);
      setCourierPricingPlan(grouped);
    } catch (error) {
      showError("Failed to load pricing plan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ---- GET PRICING CARD SUCCESS ----
  const fetchPricingCard = async () => {
    setLoading(true);
    try {
      const res = await api.get(PricingPlanConfig.pricingCardApi);
      const grouped = groupSuccessData(res?.data?.data?.result);
      setCourierSuccess(grouped);
    } catch (error) {
      showError("Failed to load success comparison");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingPlan();
    fetchPricingCard();
  }, []);

  // helper to get success data
  const getSuccess = (courierId, mode, field) => {
    return courierSuccess[courierId]?.[mode]?.[field] || "0";
  };

  return (
    <>
      <div className="tab-content tab-content-vertical">
        <div className="tab-pane fade show active" role="tabpanel">
          <div className="table-responsive h-100">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Courier</th>
                  <th>Mode</th>
                  <th>Z1</th>
                  <th>Z2</th>
                  <th>Z3</th>
                  <th>Z4</th>
                  <th>Z5</th>
                  <th>Min COD</th>
                  <th>COD %</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9">
                      <div className="dot-opacity-loader">
                        <span></span><span></span><span></span>
                      </div>
                    </td>
                  </tr>
                ) : Object.values(courierPricingPlan).length > 0 ? (
                  Object.values(courierPricingPlan).map((row, index) => (
                    <tr key={index}>
                      {/* Courier Name */}
                      <td className="py-3">{row.courier_name}</td>

                      {/* Mode Names */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-3">
                          {TYPE_ORDER.map((mode) => (
                            <span key={mode}>{mode.toUpperCase()}</span>
                          ))}
                        </div>
                      </td>

                      {/* Z1 */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-3">
                          {TYPE_ORDER.map((mode) => (
                            <span key={mode}>
                              {row.data[mode]?.zone1 || "0"} |{" "}
                              <span className="text-success">
                                {getSuccess(row.data[mode]?.courier_id, mode, "zone1")}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Z2 */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-3">
                          {TYPE_ORDER.map((mode) => (
                            <span key={mode}>
                              {row.data[mode]?.zone2 || "0"} |{" "}
                              <span className="text-success">
                                {getSuccess(row.data[mode]?.courier_id, mode, "zone2")}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Z3 */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-3">
                          {TYPE_ORDER.map((mode) => (
                            <span key={mode}>
                              {row.data[mode]?.zone3 || "0"} |{" "}
                              <span className="text-success">
                                {getSuccess(row.data[mode]?.courier_id, mode, "zone3")}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Z4 */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-3">
                          {TYPE_ORDER.map((mode) => (
                            <span key={mode}>
                              {row.data[mode]?.zone4 || "0"} |{" "}
                              <span className="text-success">
                                {getSuccess(row.data[mode]?.courier_id, mode, "zone4")}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Z5 */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-3">
                          {TYPE_ORDER.map((mode) => (
                            <span key={mode}>
                              {row.data[mode]?.zone5 || "0"} |{" "}
                              <span className="text-success">
                                {getSuccess(row.data[mode]?.courier_id, mode, "zone5")}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* MIN COD */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-3">
                          {TYPE_ORDER.map((mode) => (
                            <span key={mode}>
                              {row.data[mode]?.cod || "0"} |{" "}
                              <span className="text-success">
                                {getSuccess(row.data[mode]?.courier_id, mode, "cod")}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* COD % */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-3">
                          {TYPE_ORDER.map((mode) => (
                            <span key={mode}>
                              {row.data[mode]?.cod_percentage || "0"} |{" "}
                              <span className="text-success">
                                {getSuccess(row.data[mode]?.courier_id, mode, "cod_percentage")}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default PricingPlanView;
