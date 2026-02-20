import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import productsConfig from "../../../config/Products/ProductsConfig";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";

const defaultForm = {
  name: "",
  sku: "",
  price: "",
  category: "",
  productImage: null,
};

export default function ProductsForm() {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { id } = useParams();
  const location = useLocation();
  const { showError, showSuccess } = useAlert();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "price") {
      if (!/^(0|[1-9]\d*)(\.\d*)?$/.test(value) && value !== "") {
        return;
      }
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, productImage: file }));
      setErrors((prev) => ({ ...prev, productImage: "" }));
    }
  }, []);

  const removePreview = useCallback(() => {
    setPreview(null);
    setForm((prev) => ({ ...prev, productImage: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.price.trim()) newErrors.price = "Price is required";
    if (!form.category.trim()) newErrors.category = "Category is required";

    // Only require image on CREATE, not on EDIT
    const isEdit = location.pathname.includes("/products/edit");

    if (!isEdit) {
      if (!form.productImage) {
        newErrors.productImage = "Product image is required";
      } else if (!form.productImage.type?.startsWith("image/")) {
        newErrors.productImage = "File must be an image";
      } else if (form.productImage.size > 2 * 1024 * 1024) {
        newErrors.productImage = "Image size must be ≤ 2 MB";
      }
    } else {
      // If editing and user uploads a new image, still validate type/size
      if (form.productImage) {
        if (!form.productImage.type?.startsWith("image/")) {
          newErrors.productImage = "File must be an image";
        } else if (form.productImage.size > 2 * 1024 * 1024) {
          newErrors.productImage = "Image size must be ≤ 2 MB";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, location.pathname]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);

  try {
    const isEdit = location.pathname.includes("/products/edit");
    const url = isEdit ? `${productsConfig.productsApi}/${id}` : productsConfig.productsApi;
    const method = isEdit ? "patch" : "post";

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "productImage" && !value) return; // skip empty file
      formData.append(key, value);
    });

    const response = await api[method](url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 201 || response?.data?.status === 201) {
      showSuccess(
        response.data?.data?.message || "Product saved successfully!"
      );
      navigate("/products");
    }
  } catch (err) {
    if (Array.isArray(err?.response?.data?.message)) {
      const newErrors = err.response.data.message.reduce((acc, data) => {
        acc[data.field] = data.message;
        return acc;
      }, {});
      setErrors((prev) => ({ ...prev, ...newErrors }));
    } else {
      const errorMsg =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : typeof err?.response?.data === "string"
          ? err.response.data
          : "Something went wrong";
      showError(errorMsg);
    }
  } finally {
    setLoading(false);
  }
};

  const handleFetchData = async (productId) => {
  try {
    const response = await api.get(`${productsConfig.productsApi}/${productId}`);
    const initialData = response?.data?.data?.result[0] || {};
    return initialData;
  } catch (error) {
    console.error("Fetch Product Error:", error);
    return {};
  }
};

  useEffect(() => {
    const fetchData = async () => {
      if (location.pathname.includes("/products/edit")) {
        const data = await handleFetchData(id);
        setForm({
          name: data?.name || "",
          sku: data?.sku || "",
          category: data?.category || "",
          price: data?.price || "",
        });
        if (data?.productImage) {
          setPreview(`${import.meta.env.VITE_API_URL}${data.productImage[1]}`);
        }
      }
    };

    fetchData();
  }, [location.pathname, id]);

  const inputFields = useMemo(
    () => [
      { label: "Product Name", name: "name", required: true },
      { label: "SKU", name: "sku", required: false },   // 👈 SKU optional
      { label: "Price", name: "price", required: true },
    ],
    []
  );

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
  return (
    <div className="row text-center">
      <div className="col-lg-10 col-md-10 mx-auto">
        <div className="card custom-card">
          <div className="card-body pd-45">
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Dynamic Fields */}
                {inputFields.map(({ label, name, required }) => (
                <InputField
                  key={name}
                  label={label}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  error={errors[name]}
                  required={required}
                />
              ))}
                <div className="col-md-6 mb-2">
                  {" "}
                  <div className="form-group text-start mb-3">
                    {" "}
                    <label>Category<span className="text-danger">*</span></label>{" "}
                    <select
                      className="form-control lh-sm"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      {" "}
                      <option value="">Select</option>{" "}
                      {categoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {" "}
                          {opt.label}{" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                    {errors.category && (
                      <small className="text-danger">{errors.category}</small>
                    )}
                  </div>{" "}
                </div>

                <div className="col-md-6 mb-2">
                  <div className="form-group text-start mb-3">
                    <label>Product Image<span className="text-danger">*</span></label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                      accept="image/*"
                      ref={fileInputRef}
                    />
                    {errors.productImage && (
                      <small className="text-danger">
                        {errors.productImage}
                      </small>
                    )}
                  </div>
                </div>
                <div className="col-md-6 mb-2">
                  {preview && (
                    <div className="mt-2 position-relative d-inline-block">
                      <img
                        src={preview}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: "200px", objectFit: "contain" }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                        onClick={removePreview}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const InputField = ({ label, name, value, onChange, error, required }) => (
  <div className={`col-md-6 mb-2`}>
    <div className="form-group text-start mb-3">
      <label>
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      <input
        type="text"
        className="form-control"
        name={name}
        value={value}
        onChange={onChange}
      />
      {error && <small className="text-danger">{error}</small>}
    </div>
  </div>
);
