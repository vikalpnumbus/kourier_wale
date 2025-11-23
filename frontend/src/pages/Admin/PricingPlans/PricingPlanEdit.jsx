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

  const load = async () => {
    try {
      setLoading(true);

      const [planRes, successRes] = await Promise.all([
        api.get(PricingPlanConfig.pricingPlanCourierApi),
        api.get(`${PricingPlanConfig.pricingCardApi}?plan_id=${id}`),
      ]);

      const planGroup = groupPlan(planRes.data.data.result || []);
      const successGroup = groupSuccess(successRes.data.data.result || []);

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
    } catch (err) {
      console.error(err);
      showError("Failed to load data");
    }
    setLoading(false);
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
  };

  const handleSave = async (courierId, type) => {
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
      cod: row.cod,
      cod_percentage: row.cod_percentage,
    };

    try {
      if (row.id) {
        await api.patch(
          `${PricingPlanConfig.pricingCardApi}/${row.id}`,
          payload
        );
        showSuccess(`${type.toUpperCase()} updated successfully`);
      } else {
        const createRes = await api.post(
          PricingPlanConfig.pricingCardApi,
          payload
        );

        const newId = createRes.data?.data?.id;
        setForm((prev) => ({
          ...prev,
          [courierId]: {
            ...prev[courierId],
            [type]: { ...prev[courierId][type], id: newId },
          },
        }));

        showSuccess(`${type.toUpperCase()} created successfully`);
      }
    } catch (err) {
      console.error(err);
      showError("Failed to save");
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
                <th className="text-center">Action</th>
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

                    <td className="py-3">
                      <div className="d-flex flex-column gap-4">
                        {TYPE_ORDER.map((type) => (
                          <button
                            key={type}
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSave(courierId, type)}
                          >
                            Save {type.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PricingPlanEdit;
