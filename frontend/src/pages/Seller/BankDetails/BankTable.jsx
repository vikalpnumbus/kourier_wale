import React, { useEffect, useState } from "react";
import { mdiArrowUp, mdiArrowDown, mdiPencil, mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";
import ImageModal from "./ImageModal";
import { Link } from "react-router-dom";
import bankDetailsConfig from "../../../config/BankDetails/BankDetailsConfig";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import Pagination from "../../../Component/Pagination";
const BankTable = ({
  dataList = [],
  loading = false,
  handleFetchData,
  totalCount = 0,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [show, setShow] = useState(false);
  const [image, setImage] = useState(null);
  const { showError, showSuccess } = useAlert();

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "badge badge-success";
      case "rejected":
        return "badge badge-danger";
      case "pending":
        return "badge badge-info";
      default:
        return "badge badge-secondary";
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return dataList;
    return [...dataList].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [dataList, sortConfig]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <Icon path={mdiArrowUp} size={0.6} className="inline-block ml-1" />
    ) : (
      <Icon path={mdiArrowDown} size={0.6} className="inline-block ml-1" />
    );
  };

  const handleMakePrimary = async (id) => {
    try {
      const url = `${bankDetailsConfig.bankDetails}/${id}`;
      const formData = new FormData();
      formData.append("isPrimary", true);

      const response = await api.patch(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.data?.status === 201) {
        showSuccess("Bank details updated to primary");
        handleFetchData();
      }
    } catch (error) {
      showError(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Something went wrong"
      );
    }
  };

  useEffect(() => {
    if (totalCount === 1) {
      const [item] = dataList;
      if (item && !item.isPrimary) {
        handleMakePrimary(item.id);
      }
    }
  }, [totalCount]);

  return (
    <>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th
                onClick={() => handleSort("accountHolderName")}
                style={{ cursor: "pointer" }}
              >
                Account Name {renderSortIcon("accountHolderName")}
              </th>
              <th
                onClick={() => handleSort("accountNumber")}
                style={{ cursor: "pointer" }}
              >
                Account Number {renderSortIcon("accountNumber")}
              </th>
              <th
                onClick={() => handleSort("bankName")}
                style={{ cursor: "pointer" }}
              >
                Bank Name {renderSortIcon("bankName")}
              </th>
              <th
                onClick={() => handleSort("branchName")}
                style={{ cursor: "pointer" }}
              >
                Branch Name {renderSortIcon("branchName")}
              </th>
              <th
                onClick={() => handleSort("accountType")}
                style={{ cursor: "pointer" }}
              >
                Account Type {renderSortIcon("accountType")}
              </th>
              <th
                onClick={() => handleSort("ifscCode")}
                style={{ cursor: "pointer" }}
              >
                IFSC Code {renderSortIcon("ifscCode")}
              </th>
              <th
                onClick={() => handleSort("status")}
                style={{ cursor: "pointer" }}
              >
                Status {renderSortIcon("status")}
              </th>
              <th>Cheque Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="h-100">
            {loading ? (
              <tr>
                <td colSpan={"9"}>
                  <div className="dot-opacity-loader">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </td>
              </tr>
            ) : sortedData?.length > 0 ? (
              sortedData?.map((data) => (
                <tr key={data.id}>
                  <td className="py-2">{data.accountHolderName || ""}</td>
                  <td className="py-2">{data.accountNumber || ""}</td>
                  <td className="py-2">{data.bankName || ""}</td>
                  <td className="py-2">{data.bankBranch || ""}</td>
                  <td className="py-2">{data.accountType || ""}</td>
                  <td className="py-2">{data.ifscCode || ""}</td>
                  <td className="py-2">
                    <label className={getStatusClass(data.status)}>
                      {data.status}
                    </label>
                  </td>
                  <td className="py-2">
                    <button
                      className="btn btn-outline-primary btn-md py-2 px-4"
                      onClick={() => {
                        setImage(
                          `${import.meta.env.VITE_API_URL}${
                            data.cancelledChequeImage[1]
                          }`
                        );
                        setShow(true);
                      }}
                    >
                      View
                    </button>
                  </td>
                  <td className="py-2">
                    {data.status !== "approved" &&
                      (data.isPrimary ? (
                        <p className="text-success">
                          <Icon path={mdiCheck} size={0.7} /> Primary
                        </p>
                      ) : (
                        <div className="btn-group">
                          <Link
                            to={`edit/${data.id}`}
                            className="btn btn-outline-primary btn-md py-2 px-3"
                          >
                            <Icon path={mdiPencil} size={0.6} />
                          </Link>
                          <button
                            className="btn btn-outline-primary btn-md py-2 px-3"
                            onClick={() => handleMakePrimary(data.id)}
                          >
                            Make Primary
                          </button>
                        </div>
                      ))}
                  </td>
                </tr>
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
        {show && <ImageModal imageUrl={image} onClose={() => setShow(false)} />}
      </div>
      {sortedData.length > 0 && !loading && (
        <Pagination totalCount={totalCount} />
      )}
    </>
  );
};

export default BankTable;
