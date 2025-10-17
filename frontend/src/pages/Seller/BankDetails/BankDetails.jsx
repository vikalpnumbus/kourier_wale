import React, { useEffect, useState } from "react";
import BankTable from "./BankTable";
import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";
import { useNavigate, useSearchParams } from "react-router-dom";
import bankDetailsConfig from "../../../config/BankDetails/BankDetailsConfig";
import api from "../../../utils/api";

function BankDetails() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);
  
  const handleFetchData = async () => {
    try {
      setLoading(true);
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
     

      const url = `${bankDetailsConfig.bankDetails}?${params.toString()}`;
      const response = await api.get(url);
      const data = response?.data?.data?.result || [];
      setTotalCount(response?.data?.data?.total || 0);
      setDataList(data);
    } catch (error) {
      console.error("Bank Details Fetch Error:", error);
      setDataList([]);
      navigate("add");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    handleFetchData();
  }, [searchParams]);
  return (
    <>
      <div className="row">
        <div className="col-md-6"></div>
        <div className="col-md-6 text-end">
          <button
            onClick={() => navigate("add")}
            type="button"
            className="btn btn-dark btn-md py-2 px-4"
          >
            <Icon path={mdiPlus} size={0.7} /> Add Bank
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <BankTable
            dataList={dataList}
            loading={loading}
            handleFetchData={handleFetchData}
            totalCount={totalCount}
          />
        </div>
      </div>
    </>
  );
}

export default BankDetails;
