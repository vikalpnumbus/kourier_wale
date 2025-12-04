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

    // 1. Ensure every courier exists in grouped
    couriers.forEach((c) => {
      grouped[c.id] = {
        courier_name: c.name,
        data: {}
      };
    });

    // 2. Fill pricing rows where they exist
    pricingList.forEach((item) => {
      const cid = item.courier_id;

      if (!grouped[cid]) return; // courier might not exist anymore

      grouped[cid].data[item.type] = item;
    });

    // 3. Ensure forward, rto, weight always exist
    Object.keys(grouped).forEach((cid) => {
      TYPE_ORDER.forEach((type) => {
        if (!grouped[cid].data[type]) {
          grouped[cid].data[type] = {
            id: null,
            courier_id: Number(cid),
            type,
            plan_id: 4,
            zone1: "0",
            zone2: "0",
            zone3: "0",
            zone4: "0",
            zone5: "0",
            cod: "0",
            cod_percentage: "0",
          };
        }
      });
    });

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

      const page = Number.parseInt(searchParams.get("page") || "1", 10);
      const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const url = `${PricingPlanConfig.pricingPlanCourierApi}?${params}`;

      const { data } = await api.get(url);

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
