import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAlert } from "../../../../middleware/AlertContext";
import api from "../../../../utils/api";
import AWBListConfig from "../../../../config/AdminConfig/Courier/AWBList";
import Pagination from "../../../../Component/Pagination";
import { formatDateTime } from "../../../../middleware/CommonFunctions";
import Icon from "@mdi/react";
import { mdiDelete, mdiPencil } from "@mdi/js";

function AWBListTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useAlert();
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const url = `${AWBListConfig.awbList}?${params.toString()}`;

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

  const deleteAWB = async (id) => {
    try {
      await api.delete(`${AWBListConfig.awbList}/${id}`);
      handleFetchData();
      showSuccess("AWB deleted successfully!");
    } catch (error) {
      showError(
        error?.response?.data?.message ||
          "Something went wrong, Please try again later."
      );
      console.error("Delete AWB error:", error);
    }
  };

  return (
    <>
      <div className="tab-content tab-content-vertical">
        <div className="tab-pane fade show active" role="tabpanel">
          <div className="table-responsive h-100">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>AWB number</th>
                  <th>Courier</th>
                  <th>Created At</th>
                  <th>Mode</th>
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
                      <td className="py-3">{data?.awb_number || ""}</td>
                      <td className="py-3">{data?.courier_name || ""}</td>
                      <td className="py-3">
                        {data?.createdAt ? formatDateTime(data?.createdAt) : ""}
                      </td>
                      <td className="py-3">{data?.mode || ""}</td>
                      <td className="py-3">
                        <div className="btn-group">
                          <Link
                            to={`edit/${data?.id}`}
                            className="btn btn-outline-primary btn-md py-2 px-3"
                          >
                            <Icon path={mdiPencil} size={0.6} />
                          </Link>
                          <button
                            className="btn btn-outline-primary btn-md py-2 px-3"
                            onClick={() => deleteAWB(data.id)}
                          >
                            <Icon path={mdiDelete} size={0.6} />
                          </button>
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
    </>
  );
}

export default AWBListTable;
