import React, { useEffect, useState } from "react";
import { mdiDelete, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useSearchParams } from "react-router-dom";
import productsConfig from "../../../config/Products/ProductsConfig";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import Pagination from "../../../Component/Pagination";
import "../../../assets/product/product.css"; // <-- yaha tum CSS file daalna

function ProductsTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useAlert();
  const [totalCount, setTotalCount] = useState(0);

  // filters state (UI ke liye)
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const name = searchParams.get("name")?.trim();
      const category = searchParams.get("category")?.trim();
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (name) params.append("name", name);
      if (category) params.append("category", category);

      const url = `${productsConfig.productsApi}?${params.toString()}`;
      const { data } = await api.get(url);

      setDataList(data?.data?.result || []);
      setTotalCount(data?.data?.total || 0);
    } catch (error) {
      setDataList([]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`${productsConfig.productsApi}/${id}`);
      showSuccess("Product deleted successfully!");
      handleFetchData();
    } catch (error) {
      showError(error?.response?.data?.message || "Error");
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [searchParams]);

  // UI filter (frontend)
  const filteredData = dataList.filter((item) => {
    const matchSearch =
      !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      !categoryFilter || item.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  return (
    <div className="products-page">

      {/* HEADER */}
      {/* <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">
            Manage your product catalogue
          </div>
        </div>
      </div> */}
      {/* <div className="filters-bar">
        <input
          type="text"
          placeholder="Search product..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="sports">Sports</option>
          <option value="apparel">Apparel</option>
          <option value="electronics">Electronics</option>
        </select>
      </div> */}
      <div className="table-card">
        <div className="table-header-row">
          <div className="table-header-title">
            Product Catalogue
            <span className="table-count-badge">
              {totalCount} items
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Category</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div class="product-name-cell">
                        <div class="product-thumb">
                          <div class="product-thumb-placeholder">
                            <img src={`${import.meta.env.VITE_API_URL}${item.productImage?.[0]}`} className="product-thumb"/>
                          </div>
                        </div>
                        <div>
                          <div class="product-name-text">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="sku-cell">{item.sku}</td>
                    <td className="price-cell">
                      ₹ {item.price}
                    </td>
                    <td>
                      <span className="category-badge">
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <Link to={`edit/${item.id}`} className="action-btn edit">
                          <Icon path={mdiPencil} size={0.7} />
                        </Link>
                        <button className="action-btn delete" onClick={() => deleteProduct(item.id)}>
                          <Icon path={mdiDelete} size={0.7} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="table-footer">
          <Pagination totalCount={totalCount} />
        </div>
      </div>
    </div>
  );
}

export default ProductsTable;