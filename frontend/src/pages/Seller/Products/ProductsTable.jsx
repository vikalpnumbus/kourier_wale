import React, { useEffect, useState } from "react";
import { mdiDelete, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useSearchParams } from "react-router-dom";
import productsConfig from "../../../config/Products/ProductsConfig";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import Pagination from "../../../Component/Pagination";
function ProductsTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useAlert();
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const name = searchParams.get("name")?.trim();
      const category = searchParams.get("category")?.trim();
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (name) {
        params.append("name", name);
      }
      if (category) {
        params.append("category", category);
      }

      const url = `${productsConfig.productsApi}?${params.toString()}`;

      const { data } = await api.get(url);

      setDataList(data?.data?.result || []);
      setTotalCount(data?.data?.total || 0);
    } catch (error) {
      console.error("Fetch products error:", error);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`${productsConfig.productsApi}/${id}`);
      handleFetchData();
      showSuccess("Product deleted successfully!");
    } catch (error) {
      showError(
        error?.response?.data?.message ||
        "Something went wrong, Please try again later."
      );
      console.error("Delete product error:", error);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [searchParams]);

  return (
    <>
      <div className="table-responsive h-100">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Product Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">
                  <div className="dot-opacity-loader">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </td>
              </tr>
            ) : dataList.length > 0 ? (
              dataList.map((data) => (
                <tr key={data.id}>
                  <td className="py-2">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${data.productImage[0]
                        }`}
                      className="img-fluid rounded me-3"
                      height={200}
                      width={200}
                    />
                    {data.name || ""}
                  </td>
                  <td className="py-2">{data.sku || ""}</td>
                  <td className="py-2">{data.price || ""}</td>
                  <td className="py-2">{data.category || ""}</td>
                  <td className="py-2">
                    <div className="btn-group">
                      <Link
                        to={`edit/${data.id}`}
                        className="btn btn-outline-primary btn-md py-2 px-3"
                      >
                        <Icon path={mdiPencil} size={0.6} />
                      </Link>
                      <button
                        className="btn btn-outline-primary btn-md py-2 px-3"
                        onClick={() => deleteProduct(data.id)}
                      >
                        <Icon path={mdiDelete} size={0.6} />
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
      <Pagination totalCount={totalCount} />
    </>
  );
}

export default ProductsTable;
