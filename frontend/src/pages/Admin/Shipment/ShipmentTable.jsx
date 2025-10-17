import { useState } from "react";
import Pagination from "../../../Component/Pagination";

function ShipmentTable() {
    const [totalCount, setTotalCount] = useState(0);
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);
  return (
    <div className="tab-content tab-content-vertical">
      <div className="tab-pane fade show active" role="tabpanel">
        
        <div className="table-responsive h-100">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    // checked={allSelected}
                    // onChange={toggleSelectAll}
                    style={{ cursor: "pointer" }}
                  />
                </th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Pickup & delivery Address</th>
                <th>Package Details</th>
                <th>Payment Details</th>
                <th>AWB Number</th>
                <th>Status</th>
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
                    <tr key={data.id}>data</tr>
                //   <tr key={data.id}>
                //     <td className="py-2">
                //       {orderCanShip(data) ? (
                //         <>
                //           <input
                //             type="checkbox"
                //             checked={selectedOrders.includes(data.id)}
                //             onChange={() => toggleOrder(data.id)}
                //             style={{ cursor: "pointer" }}
                //           />
                //         </>
                //       ) : (
                //         <></>
                //       )}
                //     </td>
                //     <td className="py-2">
                //       <div className="d-flex flex-column gap-3">
                //         <Link to={`view/${data.id}`}>{data.orderId || ""}</Link>
                //         <span>
                //           {data.createdAt ? formatDateTime(data.createdAt) : ""}
                //         </span>
                //       </div>
                //     </td>

                //     <td className="py-2">
                //       <div className="d-flex flex-column gap-3">
                //         <span>
                //           {data.shippingDetails.fname &&
                //           data.shippingDetails.lname
                //             ? `${data.shippingDetails.fname} ${data.shippingDetails.lname}`
                //             : ""}
                //         </span>
                //         <span>{data.shippingDetails.phone || ""}</span>
                //       </div>
                //     </td>

                //     <td className="py-2">
                //       <div className="d-flex flex-column gap-3">
                //         <div>
                //           <span className="fw-bolder">From: </span>
                //           <span>{`${data.shippingDetails.city} ( ${data.shippingDetails.state} - ${data.shippingDetails.pincode} )`}</span>
                //         </div>
                //         <div>
                //           <span className="fw-bolder">To: </span>
                //           <span>{findWarehouse(data.warehouse_id) || ""}</span>
                //         </div>
                //       </div>
                //     </td>

                //     <td className="py-2">
                //       <div className="d-flex flex-column gap-3">
                //         {data.packageDetails.weight && (
                //           <span>
                //             {formatWeight(data.packageDetails.weight)}
                //           </span>
                //         )}

                //         {data.packageDetails["length"] &&
                //           data.packageDetails.breadth &&
                //           data.packageDetails.height && (
                //             <span>
                //               Dim: {data.packageDetails.length} x{" "}
                //               {data.packageDetails.breadth} x{" "}
                //               {data.packageDetails.height} cm
                //             </span>
                //           )}
                //       </div>
                //     </td>
                //     <td className="py-2">
                //       <div className="d-flex flex-column gap-3">
                //         <span>
                //           {data.orderAmount ? `₹ ${data.orderAmount}` : ""}
                //         </span>
                //         <span>
                //           {data.paymentType
                //             ? data.paymentType.toUpperCase()
                //             : ""}
                //         </span>
                //       </div>
                //     </td>
                //     <td className="py-2">
                //       <div className="btn-group">
                //         <Link
                //           to={`edit/${data.id}`}
                //           className="btn btn-outline-primary btn-md py-2 px-3"
                //         >
                //           <Icon path={mdiPencil} size={0.6} />
                //         </Link>
                //       </div>
                //     </td>
                //     <td className="py-2">
                //       <div className="btn-group">
                //         <button
                //           className="btn btn-primary btn-md py-2 px-3"
                //           onClick={() => {
                //             setShipOrderDetails({
                //               id: data.id,
                //               warehouse_id: data.warehouse_id,
                //               rto_warehouse_id: data.rto_warehouse_id,
                //               collectableAmount: data.collectableAmount,
                //               paymentType: data.paymentType,
                //               packageDetails: data.packageDetails,
                //               shippingDetails: data.shippingDetails,
                //             });
                //             setShowShipModal(true);
                //           }}
                //           disabled={!orderCanShip(data)}
                //         >
                //           {data.shipping_status === "new"
                //             ? "Ship"
                //             : "Not Shipped"}
                //         </button>
                //       </div>
                //     </td>
                //   </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
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
  );
}

export default ShipmentTable;
