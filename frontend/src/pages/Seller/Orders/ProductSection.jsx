import React, { useEffect, useState, useRef } from "react";
import productsConfig from "../../../config/Products/ProductsConfig";
import api from "../../../utils/api";
import AddProductModal from "../../../Component/AddProductModal";

function ProductSection({ setForm, setProductsPrice, setErrors, initialProductData = [] }) {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const wrapperRef = useRef(null);

  const handleProductAdded = (newProduct) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === newProduct.id);
      if (exists) return prev;
      return [...prev, { ...newProduct, quantity: 1 }];
    });
  };

  const handleFetchData = async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `${productsConfig.productsApi}?search=${encodeURIComponent(query)}`
        : productsConfig.productsApi;

      const { data } = await api.get(url);
      const results = data?.data?.result || [];
      setDataList(results);
    } catch (error) {
      console.error("Fetch products error:", error);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showList) return;
    handleFetchData(search);
  }, [search, showList]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearch("");
    setShowList(false);
  };

  useEffect(() => {
    if (initialProductData.length > 0) {
      initialProductData.forEach((item) => {
        handleSelectProduct(item);
      });
    }
  }, [initialProductData]);

  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleQuantityChange = (id, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(1, Number(qty) || 1) } : p
      )
    );
  };

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      products: selectedProducts.map((p) => ({
        id: p.id,
        qty: p.quantity,
      })),
      // orderAmount: parseFloat(
      //   selectedProducts
      //     .reduce((acc, curr) => acc + curr.price * curr.quantity, 0)
      //     .toFixed(2)
      // ),
    }));
    setProductsPrice(parseFloat(
      selectedProducts
        .reduce((acc, curr) => acc + curr.price * curr.quantity, 0)
        .toFixed(2)
    ))
    setErrors((prev) => ({ ...prev, products: "", orderAmount: "" }));
  }, [selectedProducts]);

  return (
    <>
      <h4 className="text-start mt-2 mb-3">Products Details<span className="text-danger">*</span></h4>
      <div className="col-md-12 mb-2" ref={wrapperRef} >
        <div className="form-group text-start mb-3 position-relative">
          <div className="btn-group w-100" role="group">
            <input
              type="text"
              className="form-control "
              placeholder="Search Products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowList(true)}
            />
            <button style={{ width: "150px" }} className="btn btn-dark btn-md py-2 px-3" type="button" onClick={() => setShowAddProductModal(true)}>
              Add Product
            </button>

          </div>


          {showList && (
            <div
              className="list-group position-absolute w-100 mt-1 shadow-sm"
              style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
            >
              {loading ? (
                <div className="list-group-item">Loading products...</div>
              ) : dataList.length > 0 ? (
                dataList.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="list-group-item list-group-item-action"
                    onClick={() => handleSelectProduct(item)}
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <div className="list-group-item text-muted">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected products */}
        <ul
          className="list-group mt-3"
          style={{ maxHeight: "260px", overflowY: "auto" }}
        >
          {selectedProducts.length > 0 ? (
            selectedProducts.map((item) => (
              <li
                key={item.id}
                // style={{
                //   minHeight: "60px",
                // }}
                className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}${item.productImage[0]}`}
                  className="img-fluid mb-2 mb-md-0 me-md-3"
                  height={100}
                  width={60}
                />

                <div className="text-start d-flex flex-column gap-2 flex-md-row w-100 justify-content-between mb-2 mb-md-0 me-1">
                  <div className="mb-1 mb-md-0" style={{ flex: 4 }}>
                    {item.name}
                  </div>
                  <div className="mb-1 mb-md-0" style={{ flex: 3 }}>
                    {item.sku}
                  </div>
                  <div style={{ flex: 1 }}>₹{item.price}</div>
                </div>

                <div className="d-flex align-items-center mt-2 mt-md-0">
                  <input
                    type="number"
                    className="form-control form-control-sm me-2 py-0 px-1"
                    style={{ width: "60px" }}
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveProduct(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="list-group-item text-muted" style={{ height: "136px" }}>No products selected</li>
          )}
        </ul>
      </div>
      {showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onProductAdded={handleProductAdded}
        />
      )}
    </>
  );
}

export default ProductSection;
