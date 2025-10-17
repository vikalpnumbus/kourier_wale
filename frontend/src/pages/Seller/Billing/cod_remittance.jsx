import React, { useEffect, useState } from "react";
import { mdiDelete, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../../../Component/Pagination";
function cod_remittance() {
  const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const [totalCount, setTotalCount] = useState(0);
  
  return (
    <>
      <div className="table-responsive h-100">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Particulars</th>
              <th>Transaction</th>
              <th>Amount</th>
              <th>Type</th>
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
                  <td className="py-2">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${
                        data.productImage[1]
                      }`}
                      alt={data.name}
                      className="img-fluid rounded me-3"
                      height={200}
                      width={200}
                    />
                    {data.name || ""}
                  </td>
                  <td className="py-2">{data.sku || ""}</td>
                  <td className="py-2">{data.price || ""}</td>
                  <td className="py-2">{data.category || ""}</td>
                  <td className="py-2">
                    <div className="btn-group">
                      <Link
                        to={`edit/${data.id}`}
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
                <td colSpan="6" className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination totalCount={totalCount} />
    </>
  )
}

export default cod_remittance