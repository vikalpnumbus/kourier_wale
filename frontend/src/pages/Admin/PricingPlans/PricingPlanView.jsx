import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import PricingPlanConfig from "../../../config/PricingPlan/PricingPlanConfig";
import { useAlert } from "../../../middleware/AlertContext";
import { useParams } from "react-router-dom";

function PricingPlanView() {
  const { showError } = useAlert();

  const [courierPricingPlan, setCourierPricingPlan] = useState({});
  const [courierSuccess, setCourierSuccess] = useState({});
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const { id } = useParams();

  const TYPE_ORDER = ["forward", "rto", "weight"];

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

  function groupSuccessData(data) {
    return data.reduce((acc, item) => {
      const id = item.courier_id;
      if (!acc[id]) {
        acc[id] = {};
      }
      acc[id][item.type] = item;
      return acc;
    }, {});
  }

  const loadAllData = async () => {
    setLoading(true);

    // helper to treat "no record found" as empty data instead of hard error
    const safeGet = async (url, label) => {
      try {
        const res = await api.get(url);
        return res;
      } catch (error) {
        const msg = error?.response?.data?.message || "";

        const isNoRecordError =
          error?.response?.status === 404 ||
          error?.response?.status === 204 ||
          msg.toLowerCase().includes("no record found");

        if (isNoRecordError) {
          // just log and return null -> will be treated as empty array
          console.warn(`${label}: no record found`);
          return null;
        }

        // other errors should still bubble up
        console.error(`${label} error:`, error);
        throw error;
      }
    };

    try {
      const [planRes, cardRes] = await Promise.all([
        safeGet(PricingPlanConfig.pricingPlanCourierApi, "Pricing Plan"),
        safeGet(
          `${PricingPlanConfig.pricingCardApi}?plan_id=${id}`,
          "Pricing Card"
        ),
      ]);

      const planData = planRes?.data?.data?.result || [];
      const successData = cardRes?.data?.data?.result || [];

      setCourierPricingPlan(groupCourierData(planData));
      setCourierSuccess(groupSuccessData(successData));
      setReady(true);
    } catch (error) {
      // only comes here for real errors, not "no record found"
      console.error(error);
      showError("Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const getSuccess = (courierId, mode, field) => {
    return courierSuccess[courierId]?.[mode]?.[field] || "0";
  };

  return (
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
              {!ready || loading ? (
                <tr>
                  <td colSpan="9">
                    <div className="dot-opacity-loader">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </td>
                </tr>
              ) : Object.values(courierPricingPlan).length > 0 ? (
                Object.values(courierPricingPlan).map((row, index) => (
                  <tr key={index}>
                    <td className="py-3">{row.courier_name}</td>

                    <td className="py-3">
                      <div className="d-flex flex-column gap-3">
                        {TYPE_ORDER.map((mode) => (
                          <span key={mode}>{mode.toUpperCase()}</span>
                        ))}
                      </div>
                    </td>

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

                    <td className="py-3">
                      <div className="d-flex flex-column gap-3">
                        {TYPE_ORDER.map((mode) => (
                          <span key={mode}>
                            {row.data[mode]?.cod_percentage || "0"} |{" "}
                            <span className="text-success">
                              {getSuccess(
                                row.data[mode]?.courier_id,
                                mode,
                                "cod_percentage"
                              )}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PricingPlanView;
