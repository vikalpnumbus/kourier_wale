import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PricingPlanConfig from "../../../../config/PricingPlan/PricingPlanConfig";
import api from "../../../../utils/api";
import courierConfig from "../../../../config/Courier/CourierConfig";

const TYPE_ORDER = ["forward", "rto", "weight"];

function PricingCourierPage() {
  const [dataList, setDataList] = useState([]);
  const [searchParams] = useSearchParams();
  const [pricingLoading, setPricingLoading] = useState(true);
  const [courierLoading, setCourierLoading] = useState(true);
  const [courierData, setCourierData] = useState([]);
  const [data, setData] = useState({});
  const [dirty, setDirty] = useState({});
  useEffect(() => {
    if (courierData.length) {
      groupData(dataList, courierData);
    }
  }, [dataList, courierData]);

  const groupData = (pricingList, couriers) => {
    const grouped = {};
    couriers.forEach((c) => {
      grouped[c.id] = {
        courier_name: c.name,
        data: {},
      };
    });
    pricingList.forEach((item) => {
      if (!item.courier_id || !item.type) return;
      const cid = item.courier_id;
      if (!grouped[cid]) return;
      grouped[cid].data[item.type] = item;
    });
    Object.keys(grouped).forEach((cid) => {
      TYPE_ORDER.forEach((type) => {
        if (!grouped[cid].data[type]) {
          grouped[cid].data[type] = null; // 🔥 IMPORTANT FIX
        }
      });
    });
    console.log("GROUPED DATA", grouped); // debug
    setData(grouped);
  };

  const handleChange = (cid, type, field, value) => {
    setData((prev) => ({
      ...prev,
      [cid]: {
        ...prev[cid],
        data: {
          ...prev[cid].data,
          [type]: {
            ...prev[cid].data[type],
            [field]: value,
          },
        },
      },
    }));

    // Track edited rows
    setDirty((prev) => ({
      ...prev,
      [cid]: {
        ...(prev[cid] || {}),
        [type]: true,
      },
    }));
  };

  const saveChanges = async () => {
    if (!Object.keys(dirty).length) {
      alert("No changes to save");
      return;
    }

    try {
      const requests = [];

      Object.entries(dirty).forEach(([cid, typeObj]) => {
        Object.keys(typeObj).forEach((type) => {
          const row = data[cid].data[type];

          const payload = {
            plan_id: row.plan_id,
            courier_id: Number(cid),
            type,
            zone1: row.zone1,
            zone2: row.zone2,
            zone3: row.zone3,
            zone4: row.zone4,
            zone5: row.zone5,
            cod:
              type === "rto" || type === "weight" ? "0" : row.cod,
            cod_percentage:
              type === "rto" || type === "weight" ? "0" : row.cod_percentage,
          };


          if (!row.id) {
            requests.push(
              api.post(`${PricingPlanConfig.pricingPlanCourierApi}`, payload)
            );
          } else {
            requests.push(
              api.patch(
                `${PricingPlanConfig.pricingPlanCourierApi}/${row.id}`,
                payload
              )
            );
          }
        });
      });

      await Promise.all(requests);

      alert("Saved successfully!");
      setDirty({});
      handleFetchData();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save");
    }
  };


  const handleFetchData = async () => {
  try {
    setPricingLoading(true);
    const params = new URLSearchParams();
    params.append("page", 1);
    params.append("limit", 1000); // 🔥 FIXED
    const url = `${PricingPlanConfig.pricingPlanCourierApi}?${params}`;
    const { data } = await api.get(url);
    console.log("API DATA", data?.data?.result); // debug
    setDataList(data?.data?.result || []);
  } catch (error) {
    console.error("Fetch error:", error);
    setDataList([]);
  } finally {
    setPricingLoading(false);
  }
};


  const handleFetchCourier = async () => {
    try {
      setCourierLoading(true);

      const url = `${courierConfig.courierApi}`;
      const { data } = await api.get(url);

      setCourierData(data?.data?.result || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setCourierData([]);
    } finally {
      setCourierLoading(false);
    }
  };


  useEffect(() => {
    handleFetchData();
    handleFetchCourier()
  }, [searchParams]);

  return (

    <div className="tab-content tab-content-vertical">
      <div className="tab-pane fade show active">
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
                <th>COD</th>
                <th>COD %</th>
              </tr>
            </thead>

            <tbody>
              {pricingLoading || courierLoading ? (
                <tr>
                  <td colSpan="9">
                    <div className="dot-opacity-loader">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </td>
                </tr>
              ) : Object.entries(data).map(([cid, row]) => (
                <tr key={cid}>
                  <td className="align-middle text-center bg-light">
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
                        <strong key={t}>{t.toUpperCase()}</strong>
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
                    <td key={field}>
                      <div className="d-flex flex-column gap-2">
                        {TYPE_ORDER.map((type) => {
                          const val = row.data[type]?.[field] || "";

                          // Hide COD for rto & weight
                          if (
                            (field === "cod" || field === "cod_percentage") &&
                            (type === "rto" || type === "weight")
                          ) {
                            return (
                              <input
                                key={type}
                                disabled
                                style={{ opacity: 0 }}
                                className="form-control"
                              />
                            );
                          }

                          return (
                            <input
                              key={type}
                              type="text"
                              className="form-control"
                              value={val}
                              onChange={(e) =>
                                handleChange(cid, type, field, e.target.value)
                              }
                            />
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-end">
          <button className="btn btn-primary" onClick={saveChanges}>
            Save All
          </button>
        </div>
      </div>
    </div>

  );
}

export default PricingCourierPage;
