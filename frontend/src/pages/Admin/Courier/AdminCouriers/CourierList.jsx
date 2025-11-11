import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../../../utils/api";
// import Icon from "@mdi/react";
// import { mdiDelete, mdiPencil } from "@mdi/js";
import Pagination from "../../../../Component/Pagination";
import courierConfig from "../../../../config/Courier/CourierConfig";

function CourierList() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const url = `${courierConfig.courierApi}?${params.toString()}`;

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
    <>
      <div className="tab-content tab-content-vertical">
        <div className="tab-pane fade show active" role="tabpanel">
          <div className="table-responsive h-100">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Courier Id</th>
                  <th>Code</th>
                  <th>Courier Type</th>
                  <th>Status</th>
                  {/* <th>Action</th> */}
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
                      <td className="py-3">{data?.name || ""}</td>
                      <td className="py-3">{data?.id || ""}</td>
                      <td className="py-3">{data?.code || ""}</td>
                      <td className="py-3">
                        {data?.courier_type || ""}
                      </td>
                      <td className="py-3">
                        {data?.status === "1" ? "Active" : "Inactive"}
                      </td>
                      
                      
                      {/* <td className="py-3">
                        <div className="btn-group">
                          <Link
                            to={`edit/${data?.id}`}
                            className="btn btn-outline-primary btn-md py-2 px-3"
                          >
                            <Icon path={mdiPencil} size={0.6} />
                          </Link>
                          
                        </div>
                      </td> */}
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
          <Pagination totalCount={totalCount} />
        </div>
      </div>
    </>
  );
}

export default CourierList;
