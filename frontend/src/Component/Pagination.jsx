import React from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "@mdi/react";
import {
  mdiChevronDoubleLeft,
  mdiChevronDoubleRight,
  mdiChevronLeft,
  mdiChevronRight,
} from "@mdi/js";

function Pagination({ totalCount }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const totalPages = Math.ceil(totalCount / limit);

  const updateParams = (newPage, newLimit = limit) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev); // keep existing params
      newParams.set("page", newPage.toString());
      newParams.set("limit", newLimit.toString());
      return newParams;
    });
  };

  // --- calculate page window (max 3 pages) ---
  const visiblePages = [];
  let start = Math.max(1, page - 1);
  let end = Math.min(totalPages, start + 2);

  if (end - start < 2) {
    start = Math.max(1, end - 2);
  }

  for (let i = start; i <= end; i++) {
    visiblePages.push(i);
  }

  return (
    <div className="row mt-4">
      <div className="col-sm-12 d-flex justify-content-between align-items-center">
        <div
          className="me-0"
          role="status"
          aria-live="polite"
          style={{ fontSize: "13px" }}
        >
          <span className="">
            <select
              value={limit}
              onChange={(e) => updateParams(1, parseInt(e.target.value, 10))}
              className="custom-select custom-select-sm form-control d-inline-block pe-4 py-2 me-2"
              style={{ width: "fit-content", height: "fit-content" }}
            >
              {[10, 50, 100, 150, 200, 250, 300].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            Per Page
          </span>
          <span className="border-start ps-2 py-2 mx-2">
            Showing {(page - 1) * limit + 1} To{" "}
            {Math.min(page * limit, totalCount)} of {totalCount} Entries
          </span>
        </div>
        <div className="dataTables_paginate paging_simple_numbers">
          <ul className="pagination flex-wrap pagination-rounded-flat m-0">
            {/* First */}
            <li className={`page-item ${page === 1 ? "pe-none " : ""}`}>
              <button
                className={`page-link px-1 ${page === 1 ? "disabled " : ""}`}
                onClick={() => page > 1 && updateParams(1)}
                disabled={page === 1}
                style={{ cursor: "pointer" }}
              >
                <Icon path={mdiChevronDoubleLeft} size={1} />
              </button>
            </li>

            {/* Prev */}
            <li className={`page-item ${page === 1 ? "pe-none " : ""}`}>
              <button
                className={`page-link px-1 ${page === 1 ? "disabled " : ""}`}
                onClick={() => page > 1 && updateParams(page - 1)}
                disabled={page === 1}
                style={{ cursor: "pointer" }}
              >
                <Icon path={mdiChevronLeft} size={1} />
              </button>
            </li>

            {/* Dots before */}
            {/* {visiblePages[0] > 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )} */}

            {/* Page Numbers */}
            {visiblePages.map((p) => (
              <li
                key={p}
                className={`paginate_button page-item ${
                  page === p ? "active" : ""
                }`}
              >
                <button className="page-link" onClick={() => updateParams(p)}>
                  {p}
                </button>
              </li>
            ))}

            {/* Dots after */}
            {/* {visiblePages[visiblePages.length - 1] < totalPages && (
              <div className="page-item disabled">
                <span className="page-link">...</span>
              </div>
            )} */}

            {/* Next */}
            <li
              className={`page-item ${page === totalPages ? "pe-none " : ""}`}
            >
              <button
                className={`page-link px-1 ${
                  page === totalPages ? "disabled " : ""
                }`}
                onClick={() => page < totalPages && updateParams(page + 1)}
                disabled={page === totalPages}
                style={{ cursor: "pointer" }}
              >
                <Icon path={mdiChevronRight} size={1} />
              </button>
            </li>

            {/* Last */}
            <li
              className={`page-item ${page === totalPages ? "pe-none " : ""}`}
            >
              <button
                className={`page-link px-1 ${
                  page === totalPages ? "disabled " : ""
                }`}
                onClick={() => page < totalPages && updateParams(totalPages)}
                disabled={page === totalPages}
                style={{ cursor: "pointer" }}
              >
                <Icon path={mdiChevronDoubleRight} size={1} />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
