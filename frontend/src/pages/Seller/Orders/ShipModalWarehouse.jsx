import { useEffect, useState, useRef } from "react";
import api from "../../../utils/api";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";

function ShipModalWarehouse({
  setForm,
  setErrors,
  initialWarehouseData,
  warehouseType,
}) {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [selected, setSelected] = useState(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const handleFetchData = async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `${warehouseConfig.warehouseApi}?search=${encodeURIComponent(query)}`
        : warehouseConfig.warehouseApi;

      const { data } = await api.get(url);
      const results = data?.data?.result || [];
      setDataList(results);
    } catch (error) {
      console.error("Fetch warehouses error:", error);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      handleFetchData(search);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setSelected(item);
    setSearch(
      `${item.name} - ${item.city}, ${item.state} (${item.pincode})`
    );
    setShowList(false);
  };

  useEffect(() => {
    if (warehouseType === "normal") {
      setForm((prev) => ({
        ...prev,
        warehouse_id: selected?.id || "",
      }));
      setErrors((prev) => ({ ...prev, warehouse_id: "" }));
    } else if (warehouseType === "rto") {
      setForm((prev) => ({
        ...prev,
        rto_warehouse_id: selected?.id || "",
      }));
      setErrors((prev) => ({ ...prev, rto_warehouse_id: "" }));
    }
  }, [selected]);

  const [isInitialSet, setIsInitialSet] = useState(false);

  useEffect(() => {
    if (!isInitialSet && initialWarehouseData && dataList.length > 0) {
      const warehouse = dataList.find(
        (item) => item.id == initialWarehouseData
      );

      if (warehouse) {
        setSelected(warehouse);
        setSearch(
          `${warehouse.name} - ${warehouse.city}, ${warehouse.state} (${warehouse.pincode})`
        );
        setIsInitialSet(true);
      }
    }
  }, [initialWarehouseData, dataList, isInitialSet]);

  return (
    <>
      <div
        ref={wrapperRef}
        className="form-group mb-1 text-start  position-relative"
      >
        <label>{warehouseType === "rto" ? "RTO Location" : "Pickup Location"}</label>
        <input
          type="text"
          className="form-control"
          placeholder={
            warehouseType === "rto"
              ? "Search RTO Locations"
              : "Search Locations"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => {
            setShowList(true);
            handleFetchData("");
          }}
        />

        {showList && (
          <div
            className="list-group position-absolute w-100 mt-1 shadow-sm bg-white"
            style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
          >
            {loading ? (
              <div className="list-group-item">Loading Locations...</div>
            ) : dataList.length > 0 ? (
              dataList.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSelect(item)}
                >
                  {item.name}<br />
                  {item.city}, {item.state}, {item.pincode}
                </button>
              ))
            ) : (
              <div className="list-group-item text-muted">
                No Warehouses found
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ShipModalWarehouse;
