import React, { useEffect, useState } from "react";
import api from "../../../../utils/api";
import shipmentsConfig from "../../../../config/Shipments/ShipmentsConfig";
import Pagination from "../../../../Component/Pagination";

function ShippingChargesTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(shipmentsConfig.shipping_charges);
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
  }, []);

  // ✅ helpers
  const formatDate = (date) => {
    if (!date) return { d: "-", t: "-" };
    const dt = new Date(date);
    return {
      d: dt.toISOString().split("T")[0],
      t: dt.toTimeString().split(" ")[0],
    };
  };

  const getStatusClass = (status) => {
    if (!status) return "status-pill";
    const s = status.toLowerCase();

    if (s.includes("cancel")) return "status-pill status-cancelled";
    if (s.includes("deliver")) return "status-pill status-delivered";
    if (s.includes("transit")) return "status-pill status-intransit";
    return "status-pill status-booked";
  };

  return (
    <div className="table-card">
      {/* HEADER */}
      <div className="table-header">
        <div>
          <span className="table-title">Transaction Ledger</span>
          <span className="table-count">{totalCount} entries</span>
        </div>
      </div>

      {/* TABLE */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>AWB Number</th>
            <th>Created Date</th>
            <th>Weight</th>
            <th>Zone</th>
            <th>Carrier</th>
            <th className="center">Status</th>
            <th className="amount-cell debit">Debit (₹)</th>
            <th className="amount-cell credit">Credit (₹)</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="text-center">
                Loading...
              </td>
            </tr>
          ) : dataList.length > 0 ? (
            dataList.map((item) => {
              const { d, t } = formatDate(item.createdAt);

              const debit =
                Number(item.cod_price || 0) +
                Number(item.freight_charge || 0);

              const credit =
                item.shipping_status?.toLowerCase().includes("cancel")
                  ? debit
                  : 0;

              return (
                <tr key={item.id}>
                  <td><span className="tid">TID-{item.id}</span></td>
                  <td><span className="awb">{item.awb_number}</span></td>
                  <td className="date-cell"><div className="date-part">{d}</div><div className="time-part">{t}</div></td>
                  <td><span className="weight-badge">{item.entered_weight} g</span></td>
                  <td><span className="zone-pill">{item.zone}</span></td>
                  <td>
                    <div className="carrier-wrap"><span className="carrier-dot" style={{ background: "#3D6BFF" }}></span>
                      <span className="carrier-name">{item.courier_name}</span>
                    </div>
                  </td>
                  <td className="center"><span className={getStatusClass(item.shipping_status)}>{item.shipping_status}</span></td>
                  <td className="amount-cell debit">₹{debit.toFixed(2)}</td>
                  <td className="amount-cell credit">₹{credit.toFixed(2)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* FOOTER */}
      <div className="table-footer">
        <div className="pagination-info">
          Showing {dataList.length} of {totalCount}
        </div>
        <Pagination totalCount={totalCount} />
      </div>
    </div>
  );
}

export default ShippingChargesTable;