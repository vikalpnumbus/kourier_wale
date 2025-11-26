import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import PricingPlanConfig from "../../../config/PricingPlan/PricingPlanConfig";
import { useAlert } from "../../../middleware/AlertContext";
import { useParams } from "react-router-dom";

function PricingPlanEdit() {
  const { showSuccess, showError } = useAlert();
  const { id } = useParams();

  const [plan, setPlan] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [dirtyRows, setDirtyRows] = useState({}); // { [courierId]: { [type]: true } }

  const TYPE_ORDER = ["forward", "rto", "weight"];

  const groupPlan = (data) =>
    data.reduce((acc, item) => {
      const cid = item.courier_id;
      if (!acc[cid]) acc[cid] = { courier_name: item.courier_name, data: {} };
      acc[cid].data[item.type] = item;
      return acc;
    }, {});

  const groupSuccess = (data) =>
    data.reduce((acc, item) => {
      const cid = item.courier_id;
      if (!acc[cid]) acc[cid] = {};
      acc[cid][item.type] = item;
      return acc;
    }, {});

  // 🔹 helper to treat "no record found" as empty result
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
        console.warn(`${label}: no record found`);
        return null; // will be treated as empty array
      }

      console.error(`${label} error:`, error);
      throw error; // real error -> let load() handle it
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [planRes, successRes] = await Promise.all([
        safeGet(PricingPlanConfig.pricingPlanCourierApi, "Pricing Plan"),
        safeGet(
          `${PricingPlanConfig.pricingCardApi}?plan_id=${id}`,
          "Pricing Card"
        ),
      ]);

      const planGroup = groupPlan(planRes?.data?.data?.result || []);
      const successGroup = groupSuccess(successRes?.data?.data?.result || []);

      const finalForm = {};
      Object.keys(planGroup).forEach((cid) => {
        finalForm[cid] = {};

        TYPE_ORDER.forEach((type) => {
          finalForm[cid][type] = successGroup[cid]?.[type]
            ? successGroup[cid][type]
            : {
                id: null,
                plan_id: Number(id),
                courier_id: Number(cid),
                type,
                zone1: "",
                zone2: "",
                zone3: "",
                zone4: "",
                zone5: "",
                cod: "",
                cod_percentage: "",
              };
        });
      });

      setPlan(planGroup);
      setForm(finalForm);
      setDirtyRows({}); // reset dirty on load
    } catch (err) {
      console.error(err);
      showError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (courierId, type, field, value) => {
    setForm((prev) => ({
      ...prev,
      [courierId]: {
        ...prev[courierId],
        [type]: {
          ...prev[courierId][type],
          [field]: value,
        },
      },
    }));

    // mark this row as dirty
    setDirtyRows((prev) => ({
      ...prev,
      [courierId]: {
        ...(prev[courierId] || {}),
        [type]: true,
      },
    }));
  };

  const handleSaveAll = async () => {
    // nothing changed
    if (!Object.keys(dirtyRows).length) {
      showError("No changes to save");
      return;
    }

    try {
      const updateRequests = [];
      const createRequests = [];

      // Only iterate over dirty rows
      Object.entries(dirtyRows).forEach(([courierId, typesObj]) => {
        Object.keys(typesObj).forEach((type) => {
          const row = form[courierId][type];

          const payload = {
            plan_id: Number(id),
            courier_id: Number(courierId),
            type,
            zone1: row.zone1,
            zone2: row.zone2,
            zone3: row.zone3,
            zone4: row.zone4,
            zone5: row.zone5,
            cod: type === "rto" || type === "weight" ? "0" : row.cod,
            cod_percentage:
              type === "rto" || type === "weight" ? "0" : row.cod_percentage,
          };

          if (row.id) {
            // Existing row: update
            updateRequests.push(
              api.patch(
                `${PricingPlanConfig.pricingCardApi}/${row.id}`,
                payload
              )
            );
          } else {
            // New row: create and capture new ID
            createRequests.push(
              api
                .post(PricingPlanConfig.pricingCardApi, payload)
                .then((res) => ({
                  courierId,
                  type,
                  id: res?.data?.data?.id,
                }))
            );
          }
        });
      });

      await Promise.all(updateRequests);
      const createdResults = await Promise.all(createRequests);

      // Update IDs for newly created rows
      if (createdResults.length) {
        setForm((prev) => {
          const updated = { ...prev };
          createdResults.forEach(({ courierId, type, id }) => {
            if (!id) return;
            updated[courierId] = {
              ...updated[courierId],
              [type]: {
                ...updated[courierId][type],
                id,
              },
            };
          });
          return updated;
        });
      }

      // clear dirty flags after successful save
      setDirtyRows({});
      showSuccess("All changed rows saved successfully");
    } catch (err) {
      console.error(err);
      showError("Failed to save changes");
    }
  };

  if (loading)
    return (
      <div className="dot-opacity-loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    );

  return (
    <div className="tab-content tab-content-vertical">
      <div className="tab-pane fade show active">
        <div className="table-responsive h-100">
          <table className="table table-hover">
            <thead>
              <tr>
                <th className="text-center">Courier</th>
                <th className="text-center">Mode</th>
                <th className="text-center">Z1</th>
                <th className="text-center">Z2</th>
                <th className="text-center">Z3</th>
                <th className="text-center">Z4</th>
                <th className="text-center">Z5</th>
                <th className="text-center">Min COD</th>
                <th className="text-center">COD %</th>
              </tr>
            </thead>

            <tbody>
              {Object.values(plan).map((row, idx) => {
                const courierId = Object.keys(plan)[idx];

                return (
                  <tr key={idx}>
                    <td className="bg-light py-3 align-middle bg-gray-400 text-right">
                      <div
                        style={{
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                        }}
                      >
                        {row.courier_name}
                      </div>
                    </td>

                    <td className="py-3">
                      <div className="d-flex flex-column gap-5">
                        {TYPE_ORDER.map((t) => (
                          <span key={t}>{t.toUpperCase()}</span>
                        ))}
                      </div>
                    </td>

                    {[
                      "zone1",
                      "zone2",
                      "zone3",
                      "zone4",
                      "zone5",
                      "cod",
                      "cod_percentage",
                    ].map((field) => (
                      <td className="py-3" key={field}>
                        <div className="d-flex flex-column gap-3">
                          {TYPE_ORDER.map((type) => {
                            if (
                              (field === "cod" || field === "cod_percentage") &&
                              (type === "rto" || type === "weight")
                            ) {
                              return (
                                <div className="input-group" style={{opacity: "0"}} key={type}>
                                  <input
                                    type="text"
                                    className="form-control"
                                    disabled
                                    
                                  />
                                  <div className="input-group-text">
                                    
                                  </div>
                                </div>
                              );
                            }

                            const planValue = row.data[type]?.[field] || "0";
                            const successVal =
                              form[courierId]?.[type]?.[field] || "";

                            return (
                              <div className="input-group" key={type}>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={successVal}
                                  onChange={(e) =>
                                    handleChange(
                                      courierId,
                                      type,
                                      field,
                                      e.target.value
                                    )
                                  }
                                />
                                <div className="input-group-text">
                                  {planValue}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Save All button at bottom */}
        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary" onClick={handleSaveAll}>
            Save All
          </button>
        </div>
      </div>
    </div>
  );
}

export default PricingPlanEdit;
