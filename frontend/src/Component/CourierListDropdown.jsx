import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import api from "../utils/api";
import courierConfig from "../config/Courier/CourierConfig";

function CourierListDropdown({
  setForm,
  errors,
  setErrors,
  initialCourierData,
}) {
  const [initialOption, setInitialOption] = useState(null);

  // Fetch data for dropdown options
  const loadOptions = async (inputValue) => {
    try {
      const url = inputValue
        ? `${courierConfig.courierApi}?search=${encodeURIComponent(
            inputValue
          )}`
        : `${courierConfig.courierApi}`;
      const { data } = await api.get(url);
      const results = data?.data?.result || [];
      return results.map((courier) => ({
        value: courier.id,
        label: courier.name,
      }));
    } catch (error) {
      console.error("Error loading couriers:", error);
      return [];
    }
  };

  // Set initial selected value when editing existing data
  useEffect(() => {
    const fetchInitial = async () => {
      if (initialCourierData) {
        try {
          const { data } = await api.get(
            `${courierConfig.courierApi}/${initialCourierData}`
          );
          const courier = data?.data?.result[0];
          if (courier) {
            setInitialOption({ value: courier.id, label: courier.name });
          }
        } catch (error) {
          console.error("Error fetching initial courier:", error);
        }
      }
    };
    fetchInitial();
  }, [initialCourierData]);

  const handleChange = (selectedOption) => {
    setInitialOption(selectedOption);
    setForm((prev) => ({
      ...prev,
      courier_id: selectedOption ? selectedOption.value : "",
    }));
    setErrors((prev) => ({ ...prev, courier_id: "" }));
  };

  console.log("object", initialOption);

  return (
    <div className="form-group mb-1 text-start">
      <label>Courier</label>
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        value={initialOption}
        onChange={handleChange}
        placeholder="Search courier..."
        isClearable
        styles={{
          control: (provided) => ({
            ...provided,
            // borderColor: errors.courier_id ? "red" : provided.borderColor,
          }),
        }}
      />
      {errors.courier_id && (
        <small className="text-danger">{errors.courier_id}</small>
      )}
    </div>
  );
}

export default CourierListDropdown;
