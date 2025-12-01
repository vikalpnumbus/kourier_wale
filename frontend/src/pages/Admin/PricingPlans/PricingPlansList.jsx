import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../../utils/api";
import Pagination from "../../../Component/Pagination";
import Icon from "@mdi/react";
import { mdiEye, mdiPencil } from "@mdi/js";
import PricingPlanConfig from "../../../config/PricingPlan/PricingPlanConfig";

function PricingPlansList() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const page = Number.parseInt(searchParams.get("page") || "1", 10);
      const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const url = `${PricingPlanConfig.pricingPlanApi}?${params.toString()}`;

      const { data } = await api.get(url);

      setDataList(data?.data?.result || []);
      setTotalCount(data?.data?.total || 0);
    } catch (error) {
      console.error("Fetch error:", error);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [searchParams]);
  return (
    <div className="tab-content tab-content-vertical">
      <div className="tab-pane fade show active" role="tabpanel">
        <div className="table-responsive h-100">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Plan Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="dot-opacity-loader">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </td>
                </tr>
              ) : dataList.length > 0 ? (
                dataList.map((data) => (
                  <tr key={data.id}>
                    <td className="py-3">{data?.name?.toUpperCase() || ""}</td>
                    <td className="py-3">{data?.type?.toUpperCase() || ""}</td>
                    <td className="py-3">
                      <div className="btn-group">
                        <Link
                          to={`edit/${data?.id}`}
                          className="btn btn-outline-primary btn-md py-2 px-3"
                        >
                          <Icon path={mdiPencil} size={0.6} />
                        </Link>
                        <Link
                          to={`view/${data?.id}`}
                          className="btn btn-outline-primary btn-md py-2 px-3"
                        >
                          <Icon path={mdiEye} size={0.6} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {dataList.length > 0 && !loading && (
          <Pagination totalCount={totalCount} />
        )}
      </div>
    </div>
  );
}

export default PricingPlansList;
