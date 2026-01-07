import { useState, useEffect, useRef } from "react";
import { Calendar, DateObject } from "react-multi-date-picker";
import { useSearchParams } from "react-router-dom";

export default function DateRange() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStart = searchParams.get("start_date");
  const initialEnd = searchParams.get("end_date");

  const toDO = (d) => new DateObject(d);

  const isSameDay = (d1, d2) =>
    d1.format("YYYY-MM-DD") === d2.format("YYYY-MM-DD");

  const matchQuickFilter = (start, end) => {
    for (const filter of quickFilters) {
      const [fStart, fEnd] = filter.getRange();
      if (isSameDay(start, fStart) && isSameDay(end, fEnd)) {
        return filter.label;
      }
    }
    return "Custom";
  };


  const startOfDay = (date) => {
    const s = new Date(date);
    s.setHours(0, 0, 0, 0);
    return s;
  };
  const endOfDay = (date) => {
    const e = new Date(date);
    e.setHours(23, 59, 59, 999);
    return e;
  };

  const getTodayRange = () => {
    const now = new Date();
    return [toDO(startOfDay(now)), toDO(endOfDay(now))];
  };
  const getLastNDaysRange = (n) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (n - 1));
    return [toDO(startOfDay(start)), toDO(endOfDay(now))];
  };
  const getThisWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = (day + 6) % 7;
    const start = new Date(now);
    start.setDate(now.getDate() - diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return [toDO(startOfDay(start)), toDO(endOfDay(end))];
  };
  const getThisMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [toDO(startOfDay(start)), toDO(endOfDay(end))];
  };

  const defaultLast7 = getLastNDaysRange(7);

  const [values, setValues] = useState(() =>
    initialStart && initialEnd
      ? [
        new DateObject(initialStart),
        new DateObject(initialEnd),
      ]
      : defaultLast7
  );

  const [selectedFilter, setSelectedFilter] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyRange = (range, filterLabel) => {
    setValues(range);

    const startStr = range[0].format("YYYY-MM-DD");
    const endStr = range[1].format("YYYY-MM-DD");

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("start_date", startStr);
      newParams.set("end_date", endStr);
      return newParams;
    });

    setSelectedFilter(filterLabel);
    setOpen(false);
  };

  const handleApply = () => {
    if (values && values[0] && values[1]) {
      const startStr = values[0].format("YYYY-MM-DD");
      const endStr = values[1].format("YYYY-MM-DD");

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("start_date", startStr);
        newParams.set("end_date", endStr);
        return newParams;
      });

      setSelectedFilter("Custom");
      setOpen(false);
    }
  };

  const quickFilters = [
    { label: "Today", getRange: getTodayRange },
    { label: "Last 7 Days", getRange: () => getLastNDaysRange(7) },
    { label: "This Week", getRange: getThisWeekRange },
    { label: "Last 30 Days", getRange: () => getLastNDaysRange(30) },
    { label: "This Month", getRange: getThisMonthRange },
    { label: "Last 90 Days", getRange: () => getLastNDaysRange(90) },
  ];

  const formatDate = (dateObj) => (dateObj ? dateObj.format("DD-MM-YYYY") : "");
  const inputValue =
    values && values[0] && values[1]
      ? `${formatDate(values[0])} ➛ ${formatDate(values[1])}`
      : "";

  useEffect(() => {
    if (initialStart && initialEnd) {
      const start = new DateObject(initialStart);
      const end = new DateObject(initialEnd);

      setValues([start, end]);
      setSelectedFilter(matchQuickFilter(start, end));
    } else {
      // 👇 DEFAULT CASE
      setValues(defaultLast7);
      setSelectedFilter("Last 7 Days");
    }
  }, [initialStart, initialEnd]);



  return (
    <div
      className="w-100"
      ref={containerRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <input
        readOnly
        value={`${selectedFilter}: ${inputValue}`}
        onClick={() => setOpen((prev) => !prev)}
        placeholder="Select date range"
        className="form-control py-2 px-4 pe-5"
      />

      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            zIndex: 1000,
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            padding: "12px",
            maxWidth: "100vw",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "8px",
            }}
          >
            {selectedFilter === "Custom" && (
              <button
                style={{
                  background: "#0074d9",
                  color: "white",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  transition: "all 0.2s",
                }}
              >
                Custom
              </button>
            )}

            {quickFilters.map((f) => (
              <button
                key={f.label}
                onClick={() => applyRange(f.getRange(), f.label)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "none",
                  background:
                    selectedFilter === f.label ? "#0074d9" : "#f1f3f5",
                  color: selectedFilter === f.label ? "white" : "#495057",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  transition: "all 0.2s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Calendar
            value={values}
            onChange={setValues}
            range
            numberOfMonths={2}
            showOtherDays
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "12px",
            }}
          />

          <button
            onClick={handleApply}
            className="btn btn-md py-2 px-4 me-2 float-end text-white"
            style={{ backgroundColor: "#0074d9" }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
