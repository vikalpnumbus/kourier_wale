import { useEffect, useState, useRef } from "react";
import api from "../../../utils/api";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";

function WarehouseDropdown({
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
    setSearch(item.name);
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
        setSearch(warehouse.name);
        setIsInitialSet(true);
      }
    }
  }, [initialWarehouseData, dataList, isInitialSet]);

  return (
    <>
      <div  ref={wrapperRef}>
      <h4 className="text-start  mb-3">{warehouseType === "rto" && "RTO "}Warehouse Details<span className="text-danger">*</span></h4>
        <div className="form-group mb-1 text-start  position-relative">
          <input
            type="text"
            className="form-control"
            placeholder={warehouseType === "rto" ? "Search RTO Warehouses" : "Search Warehouses"}
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
                <div className="list-group-item">Loading Warehouses...</div>
              ) : dataList.length > 0 ? (
                dataList.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="list-group-item list-group-item-action"
                    onClick={() => handleSelect(item)}
                  >
                    {item.name}
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
      </div>
    </>
  );
}

export default WarehouseDropdown;
