import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
import api from "../../../utils/api";
import Select from "react-select";
import DateRange from "../../../Component/DateRange";

function OrdersFilter({ setShowFilters }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState({
    start_date: searchParams.get("start_date") || "",
    end_date: searchParams.get("end_date") || "",
  });
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [channelName, setChannelName] = useState(searchParams.get("channel_name") || "");
  const [shippingName, setShippingName] = useState(
    searchParams.get("shippingName") || ""
  );
  const [warehouse, setWarehouse] = useState(
    searchParams.get("warehouse_id")
      ? {
        value: searchParams.get("warehouse_id"),
        label: searchParams.get("warehouse_name") || "Selected Warehouse",
      }
      : null
  );

  const PAYMENT_TYPE_LABELS = {
    cod: "COD",
    prepaid: "Prepaid",
  };

  const [paymentType, setPaymentType] = useState(() => {
    const param = searchParams.get("paymentType");
    return param
      ? { value: param, label: PAYMENT_TYPE_LABELS[param] || param }
      : null;
  });

  const [warehouseList, setWarehouseList] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const handleFetchWarehouse = async () => {
    setLoadingWarehouses(true);
    try {
      const { data } = await api.get(warehouseConfig.warehouseApi);
      setWarehouseList(data?.data?.result || []);
    } catch (error) {
      console.error("Fetch warehouses error:", error);
      setWarehouseList([]);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  useEffect(() => {
    handleFetchWarehouse();
  }, []);

  // memoize options for react-select
  const warehouseOptions = useMemo(
    () =>
      warehouseList.map((w) => ({
        value: w.id.toString(),
        label: w.name,
      })),
    [warehouseList]
  );

  const handleSearch = () => {
    // Get existing search params as an object
    const params = Object.fromEntries([...searchParams]);

    // Update with filter values
    if (orderId.trim()) params.orderId = orderId.trim();
    else delete params.orderId;

    if (channelName.trim()) params.channel_name = channelName.trim();
    else delete params.channel_name;

    if (shippingName.trim()) params.shippingName = shippingName.trim();
    else delete params.shippingName;

    if (warehouse) {
      params.warehouse_id = warehouse.value;
      params.warehouse_name = warehouse.label;
    } else {
      delete params.warehouse_id;
      delete params.warehouse_name;
    }

    if (paymentType?.value) params.paymentType = paymentType.value;
    else delete params.paymentType;

    if (date?.start_date && date?.end_date) {
      params.start_date = date.start_date;
      params.end_date = date.end_date;
    } else {
      console.log(date);
      delete params.start_date;
      delete params.end_date;
    }

    console.log(params);

    setSearchParams(params);
  };

  const handleClear = () => {
    setOrderId("");
    setChannelName("");
    setShippingName("");
    setWarehouse(null);
    setPaymentType(null);
    setDate("");
    setSearchParams({});
    setShowFilters(false);
  };

  return (
    <div className="col-md-12 mt-3">
      <div className="row gap-2">
        <div className="col-md-3">
          <DateRange />
        </div>
        {/* Shipping name */}
        <div className="col-md-3">
          <input
            className="form-control py-2 px-4 pe-5"
            placeholder="Search by Customer name"
            type="text"
            value={shippingName}
            onChange={(e) => setShippingName(e.target.value)}
          />
        </div>

        {/* Order IDs */}
        <div className="col-md-3">
          <input
            className="form-control py-2 px-4 pe-5"
            placeholder="Search orders by comma-separated IDs"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <input
            className="form-control py-2 px-4 pe-5"
            placeholder="Channel Name"
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
        </div>

        {/* Warehouse dropdown */}
        <div className="col-md-3">
          <Select
            options={warehouseOptions}
            value={warehouse}
            onChange={setWarehouse}
            placeholder="Select warehouse"
            isSearchable
            isLoading={loadingWarehouses}
            styles={{
              menu: (provided) => ({
                ...provided,
                zIndex: 9999,
              }),
            }}
          />
        </div>

        <div className="col-md-3">
          <Select
            options={[
              { label: "All", value: "" },
              { label: "COD", value: "cod" },
              { label: "Prepaid", value: "prepaid" },
            ]}
            value={paymentType}
            onChange={setPaymentType}
            placeholder="Select payment type"
            styles={{
              menu: (provided) => ({
                ...provided,
                zIndex: 9999,
              }),
            }}
          />
        </div>

        {/* Actions */}
        <div className="col-md-3 d-flex align-items-center">
          <button
            type="button"
            className="btn btn-dark btn-md py-2 px-4 me-2"
            onClick={handleSearch}
          >
            Apply
          </button>
          <button
            type="button"
            className="btn btn-light text-dark btn-md py-2 px-4"
            onClick={handleClear}
          >
            {/* <Icon path={mdiClose} size={0.7} /> */}
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrdersFilter;
