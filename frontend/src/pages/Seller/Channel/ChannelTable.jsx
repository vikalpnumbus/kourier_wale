import React, { useEffect, useState } from "react";
import { mdiDelete, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useSearchParams } from "react-router-dom";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import Pagination from "../../../Component/Pagination";
import { formatDateTime } from "../../../middleware/CommonFunctions";
import ChannelConfig from "../../../config/Channel/ChannelConfig";

function ChannelTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useAlert();
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const name = searchParams.get("name")?.trim();
      const category = searchParams.get("category")?.trim();
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (name) {
        params.append("name", name);
      }
      if (category) {
        params.append("category", category);
      }

      const url = `${ChannelConfig.channelApi}?${params.toString()}`;

      const { data } = await api.get(url);

      setDataList(data?.data?.result || []);
      setTotalCount(data?.data?.total || 0);
    } catch (error) {
      console.error("Fetch channel error:", error);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`${ChannelConfig.channelApi}/${id}`);
      handleFetchData();
      showSuccess("Channel deleted successfully!");
    } catch (error) {
      showError(
        error?.response?.data?.message ||
          "Something went wrong, Please try again later."
      );
      console.error("Delete error:", error);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [searchParams]);
  return (
    <>
      <div className="table-responsive h-100">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Channel Name</th>
              <th>Channel Host</th>
              <th>Date</th>
              <th>Actions</th>
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
                  <td className="py-2">{data.channel || ""}</td>
                  <td className="py-2">{data.channel_name || ""}</td>
                  <td className="py-2">{data.channel_host || ""}</td>
                  <td className="py-2">
                    {data?.createdAt ? formatDateTime(data?.createdAt) : ""}
                  </td>

                  <td className="py-2">
                    <div className="btn-group">
                      <Link
                        to={`edit${
                          data.channel == "shopify" ? "/shopify" : ""
                        }/${data.id}`}
                        className="btn btn-outline-primary btn-md py-2 px-3"
                      >
                        <Icon path={mdiPencil} size={0.6} />
                      </Link>
                      <button
                        className="btn btn-outline-primary btn-md py-2 px-3"
                        onClick={() => deleteProduct(data.id)}
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
    </>
  );
}

export default ChannelTable;
