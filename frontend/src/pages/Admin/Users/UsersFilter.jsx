import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import DateRange from "../../../Component/DateRange";
import Select from "react-select";

const ACTIVE_OPTIONS = [
  { label: "All", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

const VERIFIED_OPTIONS = [
  { label: "All", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

function UsersFilter({ setShowFilters }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState({
    start_date: searchParams.get("start_date") || "",
    end_date: searchParams.get("end_date") || "",
  });
  const [name, setName] = useState(searchParams.get("name") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [userId, setUserId] = useState(searchParams.get("userId") || "");
  const getInitialOption = (options, key) => {
    const value = searchParams.get(key);
    return value
      ? options.find((opt) => opt.value === value)
      : null;
  };

  const [isActive, setIsActive] = useState(
    getInitialOption(ACTIVE_OPTIONS, "isActive")
  );

  const [isVerified, setIsVerified] = useState(
    getInitialOption(VERIFIED_OPTIONS, "isVerified")
  );



  const handleSearch = () => {
    const params = Object.fromEntries([...searchParams]);


    if (name.trim()) params.name = name.trim();
    else delete params.name;
    if (email.trim()) params.email = email.trim();
    else delete params.email;
    if (phone.trim()) params.phone = phone.trim();
    else delete params.phone;
    if (userId.trim()) params.userId = userId.trim();
    else delete params.userId;
    if (isActive?.value) params.isActive = isActive.value;
    else delete params.isActive;

    if (isVerified?.value) params.isVerified = isVerified.value;
    else delete params.isVerified;


    if (date?.start_date && date?.end_date) {
      params.start_date = date.start_date;
      params.end_date = date.end_date;
    }

    setSearchParams(params);
  };

  const handleClear = () => {
    setName("");
    setEmail("");
    setPhone("");
    setUserId("");
    setDate({ start_date: "", end_date: "" });
    setIsActive(null);
    setIsVerified(null);
    setSearchParams({});
    setShowFilters(false);
  };


  return (
    <div className="col-md-12 mt-3">
      <div className="row gap-2">
        <div className="col-md-3">
          <DateRange />
        </div>
        <div className="col-md-3">
          <input
            className="form-control py-2 px-4 pe-5"
            placeholder="Search by Seller Id"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control py-2 px-4 pe-5"
            placeholder="Search by Customer name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control py-2 px-4 pe-5"
            placeholder="Search by Customer Email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control py-2 px-4 pe-5"
            placeholder="Search by Customer Phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>



        <div className="col-md-3">
          <Select
            options={ACTIVE_OPTIONS}
            value={isActive}
            onChange={setIsActive}
            placeholder="Select Active Status"
            isClearable
          />

        </div>
        <div className="col-md-3">

          <Select
            options={VERIFIED_OPTIONS}
            value={isVerified}
            onChange={setIsVerified}
            placeholder="Select Verified Status"
            isClearable
          />

        </div>

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
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default UsersFilter;
