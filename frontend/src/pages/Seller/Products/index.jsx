import React, { useState } from "react";
import Icon from "@mdi/react";
import { mdiClose, mdiCloudDownload, mdiPlus } from "@mdi/js";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import ImportModal from "../../../Component/ImportModal";
import productsConfig from "../../../config/Products/ProductsConfig";

function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const categoryOptions = [
    { label: "Appliances", value: "appliances" },
    { label: "Mobile", value: "mobile" },
    { label: "Electronics", value: "electronics" },
    { label: "Fashion", value: "fashion" },
    { label: "Home and Kitchen", value: "home_and_kitchen" },
    { label: "Grocery", value: "grocery" },
    { label: "Books", value: "books" },
    { label: "Beauty", value: "beauty" },
    { label: "Sports", value: "sports" },
    { label: "Automotive", value: "automotive" },
    { label: "Toys", value: "toys" },
    { label: "Furniture", value: "furniture" },
    { label: "Baby", value: "baby" },
    { label: "Computers", value: "computers" },
    { label: "Other", value: "other" },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("name") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [showImportModal, setShowImportModal] = useState(false)

  const handleSearch = () => {
    const params = {};
    if (search.trim()) params.name = search.trim();
    if (category.trim()) params.category = category.trim();

    setSearchParams(params);
  };

  const handleClear = () => {
    setSearch("");
    setCategory("");
    setSearchParams({});
  };
  return (
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card d-md-flex">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <h4 className="card-title">Products</h4>
              </div>
              <div className="col-md-8 col-sm-12 d-flex justify-content-end gap-2">
                {!location.pathname.includes("/products/add") &&
                  !location.pathname.includes("/products/edit") && (
                    <div className="form-group d-flex m-0 gap-2">
                      <input
                        className="form-control py-2 px-4 pe-5"
                        placeholder="Search Product"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />

                      <select
                        className="form-control"
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {" "}
                        <option value="">Select category</option>{" "}
                        {categoryOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {" "}
                            {opt.label}{" "}
                          </option>
                        ))}{" "}
                      </select>

                      <button
                        type="button"
                        className="btn btn-dark btn-md py-2 px-4"
                        onClick={handleSearch}
                      >
                        Search
                      </button>
                      {(search || category) && (
                        <button
                          type="button"
                          className="btn border-0"
                          onClick={handleClear}
                        >
                          <Icon path={mdiClose} size={0.7} />
                        </button>
                      )}
                    </div>
                  )}

                {!location.pathname.includes("/products/edit") &&
                  !location.pathname.includes("/products/add") && (
                    <button
                      onClick={() => {
                        setShowImportModal(true);
                      }}
                      type="button"
                      className="btn btn-dark btn-md py-2 px-4"
                    >
                      <Icon path={mdiCloudDownload} size={0.7} /> Import
                    </button>
                  )}
                {!location.pathname.includes("/products/edit") &&
                  !location.pathname.includes("/products/add") && (
                    <button
                      onClick={() => navigate("add")}
                      type="button"
                      className="btn btn-dark btn-md py-2 px-4"
                    >
                      <Icon path={mdiPlus} size={0.7} /> Add Product
                    </button>
                  )}
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <div className="tab-content tab-content-vertical">
                  <div className="tab-pane fade show active" role="tabpanel">
                    <Outlet />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showImportModal && <ImportModal title="Import Products" onClose={() => setShowImportModal(false)} apiURL={productsConfig.productsBulkApi} />}
    </div>
  );
}

export default Products;
