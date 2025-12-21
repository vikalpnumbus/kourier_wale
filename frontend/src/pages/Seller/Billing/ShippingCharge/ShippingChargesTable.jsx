import React, { useEffect, useState } from "react";
import { mdiDelete, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../../../utils/api";
import shipmentsConfig from "../../../../config/Shipments/ShipmentsConfig";
import Pagination from "../../../../Component/Pagination";

function ShippingChargesTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);
  const handleFetchData = async () => {
    setLoading(true);
    try {
      const url = `${shipmentsConfig.shipping_charges}`;
      const { data } = await api.get(url);
      setDataList(data?.data?.result || []);
      setTotalCount(data?.data?.total || 0);
    } catch (error) {
      console.error("Fetch orders error:", error);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);
  return (
    <>
      <div className="tab-content tab-content-vertical">
        <div className="tab-pane fade show active" role="tabpanel">
          <div className="table-responsive h-100">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>AWB Number</th>
                  <th>Created Date</th>
                  <th>Weight(GM)</th>
                  <th>Zone</th>
                  <th>Carrier</th>
                  <th>Status</th>
                  <th>Debit</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8">
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
                      <td className="py-2">TID: {data.id}</td>
                      <td className="py-2">{data.awb_number}</td>
                      <td className="py-2">{data.createdAt}</td>
                      <td className="py-2">{data.entered_weight}</td>
                      <td className="py-2">{data.zone}</td>
                      <td className="py-2">{data.courier_name}</td>
                      <td className="py-2">{data.shipping_status}</td>
                      <td className="py-2">₹{(Number(data.cod_price) + Number(data.freight_charge)).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Pagination totalCount={totalCount} />
    </>
  )
}

export default ShippingChargesTable