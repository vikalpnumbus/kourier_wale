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
        <table className="data-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Channel Name</th>
              <th>Channel Host</th>
              <th>Connected On</th>
              <th className="center">Actions</th>
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
                  <td>
                    <div className="channel-name-cell">
                      <div className="channel-mini-logo logo-custom">
                        {data.channel?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="channel-name-text">
                          {data.channel || ""}
                        </div>
                        <div className="channel-name-id">
                          CHANNEL
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="ch-name-badge">
                      {data.channel_name || ""}
                    </span>
                  </td>
                  <td>
                    <div className="host-cell">
                      <span className="host-url">
                        {data.channel_host || ""}
                      </span>
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-part">
                      {data?.createdAt ? formatDateTime(data.createdAt) : ""}
                    </div>
                  </td>

                  <td className="center">
                    <div className="action-group" style={{ justifyContent: "center" }}>
                      <Link
                        to={`edit${data.channel == "shopify" ? "/shopify" : ""}/${data.id}`}
                        className="act-btn edit"
                      >
                        <Icon path={mdiPencil} size={0.6} />
                      </Link>
                      <button className="act-btn delete" onClick={() => deleteProduct(data.id)}><Icon path={mdiDelete} size={0.6} /></button>
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
