import React, { useCallback, useState, useEffect, useRef } from "react";
import api from "../../../utils/api";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
import ProductSection from "./ProductSection";
import { useAlert } from "../../../middleware/AlertContext";
import ordersConfig from "../../../config/Orders/OrdersConfig";
import { useNavigate, useParams } from "react-router-dom";
import WarehouseDropdown from "./WarehouseDropdown";
import { stringifyPayload } from "../../../middleware/CommonFunctions";
import AddWarehouseModal from "../../../Component/AddWarehouseModal";

const defaultForm = {
  orderId: "",
  paymentType: "",
  "shippingDetails.fname": "",
  "shippingDetails.lname": "",
  "shippingDetails.address": "",
  "shippingDetails.pincode": "",
  "shippingDetails.city": "",
  "shippingDetails.state": "",
  "shippingDetails.phone": "",
  "shippingDetails.alternatePhone": "",
  "packageDetails.weight": "",
  "packageDetails.height": "",
  "packageDetails.breadth": "",
  "packageDetails.length": "",
  "packageDetails.volumetricWeight": "",
  orderAmount: "",
  "charges.shipping": "",
  "charges.tax_amount": "",
  "charges.cod": "",
  "charges.discount": "",
  collectableAmount: "",
  products: [],
  warehouse_id: "",
  rto_warehouse_id: "",
};

function OrdersForm() {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useAlert();
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialProductData, setInitialProductData] = useState([]);
  const [initialWarehouseData, setInitialWarehouseData] = useState("");
  const [productsPrice, setProductsPrice] = useState(0);
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);

  const inputRefs = useRef({});
  const setRef = (name, node) => {
    if (node) inputRefs.current[name] = node;
  };

  useEffect(() => {
    const brandPrefix = "";
    const uniqueId = `${Math.floor(Date.now() / 1000)}`;
    setForm((prev) => ({
      ...prev,
      orderId: `${brandPrefix}${uniqueId}${location.pathname.includes("/orders/clone") ? "-Copy" : ""
        }`,
    }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (
      name === "shippingDetails.phone" ||
      name === "shippingDetails.alternatePhone"
    ) {
      if (!/^\d*$/.test(value)) return;

      if (value === "" || /^[6-9]\d{0,9}$/.test(value)) {
        newValue = value.slice(0, 10);
      } else {
        return;
      }
    }

    if (name === "paymentType") {
      setForm((prev) => ({ ...prev, "charges.cod": "", collectableAmount: "" }));
      setErrors((prev) => ({ ...prev, "charges.cod": "", collectableAmount: "" }));
    }

    if (
      name === "packageDetails.weight" ||
      name === "packageDetails.height" ||
      name === "packageDetails.breadth" ||
      name === "packageDetails.length" ||
      name === "charges.cod" ||
      name === "charges.discount" ||
      name === "charges.tax_amount" ||
      name === "charges.shipping" ||
      name === "orderAmount"
    ) {
      if (!/^\d*\.?\d{0,2}$/.test(value)) return;
    }

    if (
      name === "packageDetails.height" ||
      name === "packageDetails.breadth" ||
      name === "packageDetails.length"
    ) {
      if (value > 9999) return;
    }

    if (name === "shippingDetails.pincode") {
      if (!/^\d*$/.test(value)) return;
    }

    if (name === "collectableAmount") {
      // console.log('newValue: ', newValue);
      // console.log('form?.orderAmount: ', form?.orderAmount);
      const collectable = Number(newValue);
      const orderAmount = Number(form?.orderAmount);

      if (collectable > orderAmount) {
        setErrors(prev => ({
          ...prev,
          [name]: "Collectable amount cannot be greater than order amount",
        }));
        return;
      }
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [form.orderAmount]);

  const handleFetchPincode = async (pincode) => {
    setLoadingPincode(true);
    try {
      const response = await api.get(
        `${warehouseConfig.pincodeApi}/${pincode}`
      );
      if (response?.data?.status === 200) {
        if (!response.data?.data || response.data.data.length === 0) {
          return setErrors((prev) => ({
            ...prev,
            "shippingDetails.pincode": "Enter correct pincode",
          }));
        }
        const { city, state } = response.data.data;
        setForm((prev) => ({
          ...prev,
          "shippingDetails.city": city,
          "shippingDetails.state": state,
        }));
        setErrors((prev) => ({
          ...prev,
          "shippingDetails.city": "",
          "shippingDetails.state": "",
          "shippingDetails.pincode": "",
        }));
      }
    } catch (error) {
      console.error("Pincode Fetch Error:", error);
      setErrors((prev) => ({
        ...prev,
        "shippingDetails.pincode": "Enter correct pincode",
      }));
    } finally {
      setLoadingPincode(false);
    }
  };

  useEffect(() => {
    if (/^\d{6}$/.test(form["shippingDetails.pincode"])) {
      handleFetchPincode(form["shippingDetails.pincode"]);
    }
  }, [form["shippingDetails.pincode"]]);

  useEffect(() => {
    const length = parseFloat(form["packageDetails.length"]) || 0;
    const breadth = parseFloat(form["packageDetails.breadth"]) || 0;
    const height = parseFloat(form["packageDetails.height"]) || 0;
    if (length > 0 && breadth > 0 && height > 0) {
      const volWeight = ((length * breadth * height) / 5000);
      setForm((prev) => ({
        ...prev,
        "packageDetails.volumetricWeight": (volWeight).toFixed(2),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        "packageDetails.volumetricWeight": "0",
      }));
    }
  }, [
    form["packageDetails.length"],
    form["packageDetails.breadth"],
    form["packageDetails.height"],
  ]);

  useEffect(() => {
    if (form.paymentType === "prepaid") {
      setForm((prev) => ({ ...prev, collectableAmount: "0" }));
      return;
    }
    const finalAmount = parseFloat(productsPrice) || 0;
    const shipping = parseFloat(form["charges.shipping"]) || 0;
    const tax = parseFloat(form["charges.tax_amount"]) || 0;
    const cod =
      form.paymentType === "cod" ? parseFloat(form["charges.cod"]) || 0 : 0;
    const discount = parseFloat(form["charges.discount"]) || 0;
    const total = finalAmount + shipping + tax + cod - discount;
    setForm((prev) => ({ ...prev, collectableAmount: total.toFixed(2), orderAmount: total.toFixed(2) }));
  }, [
    productsPrice,
    form["charges.shipping"],
    form["charges.tax_amount"],
    form["charges.cod"],
    form["charges.discount"],
    form.paymentType,
  ]);

  const validateForm = (form) => {
    const errors = {};
    if (!form.paymentType) errors.paymentType = "Payment type required";
    if (!form["shippingDetails.fname"])
      errors["shippingDetails.fname"] = "First name required";
    if (!form["shippingDetails.lname"])
      errors["shippingDetails.lname"] = "Last name required";
    if (!form["shippingDetails.address"])
      errors["shippingDetails.address"] = "Address required";
    if (!form["shippingDetails.pincode"])
      errors["shippingDetails.pincode"] = "Pincode required";
    else if (!/^\d{6}$/.test(form["shippingDetails.pincode"]))
      errors["shippingDetails.pincode"] = "Enter valid 6-digit pincode";
    if (!form["shippingDetails.city"])
      errors["shippingDetails.city"] = "City required";
    if (!form["shippingDetails.state"])
      errors["shippingDetails.state"] = "State required";
    if (!form["shippingDetails.phone"])
      errors["shippingDetails.phone"] = "Phone number required";
    else if (!/^\d{10}$/.test(form["shippingDetails.phone"]))
      errors["shippingDetails.phone"] = "Enter valid 10-digit phone number";

    if (
      form["shippingDetails.alternatePhone"] &&
      !/^\d{10}$/.test(form["shippingDetails.alternatePhone"])
    ) {
      errors["shippingDetails.alternatePhone"] =
        "Enter valid 10-digit phone number";
    }

    if (!form["packageDetails.weight"])
      errors["packageDetails.weight"] = "Weight required";
    const dimensionFields = [
      { key: "packageDetails.length", label: "Length" },
      { key: "packageDetails.breadth", label: "Breadth" },
      { key: "packageDetails.height", label: "Height" },
    ];

    dimensionFields.forEach(({ key, label }) => {
      const value = form[key];

      if (!value) {
        errors[key] = `${label} required`;
      } else if (!/^\d*\.?\d{0,2}$/.test(value)) {
        errors[key] = `Enter valid ${label.toLowerCase()}`;
      } else if (parseFloat(value) <= 0) {
        errors[key] = `Must be greater than 0`;
      }
    });
    if (!form["packageDetails.volumetricWeight"])
      errors["packageDetails.volumetricWeight"] = "Volumetric weight required";
    if (!form.orderAmount) errors.orderAmount = "Final amount required";
    // if (!form["charges.shipping"])
    //   errors["charges.shipping"] = "Shipping charge required";
    if (!form["charges.tax_amount"])
      errors["charges.tax_amount"] = "Tax amount required";
    if (form.paymentType === "cod" && !form["charges.cod"])
      errors["charges.cod"] = "COD charge required";
    // if (!form["charges.discount"])
    //   errors["charges.discount"] = "Discount required";
    if (!form.products || form.products.length === 0)
      errors.products = "At least one product must be added";
    if (!form.warehouse_id) errors.warehouse_id = "Warehouse required";
    if (!form.rto_warehouse_id)
      errors.rto_warehouse_id = "RTO Warehouse required";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      const firstErrorField = Object.keys(newErrors)[0];
      const node = inputRefs.current[firstErrorField];
      if (node && node.scrollIntoView) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        node.focus();
      }
      return;
    }
    setLoading(true);
    try {
      const isEdit = location.pathname.includes("/orders/edit");
      const url = isEdit
        ? `${ordersConfig.ordersApi}/${id}`
        : ordersConfig.ordersApi;
      const method = isEdit ? "patch" : "post";

      const payload = Object.fromEntries(
        Object.entries(form).filter(([_, value]) => {
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === "object" && value !== null)
            return Object.values(value).some(
              (v) => v !== "" && v !== null && v !== undefined
            );
          return value !== "" && value !== null && value !== undefined;
        })
      );

      payload.order_source = "portal";
      // payload.rto_warehouse_id = "12";

      if (payload.paymentType === "prepaid") {
        if (!payload["charges.cod"]) payload["charges.cod"] = "0";
      }
      if (!payload["charges.discount"]) payload["charges.discount"] = "0";
      if (!payload["charges.shipping"]) payload["charges.shipping"] = "0";

      const payloadString = stringifyPayload(payload);

      const response = await api[method](url, payloadString);

      if (response.status === 201 || response?.data?.status === 201) {
        showSuccess(
          response.data?.data?.message || "Warehouse saved successfully!"
        );
        if (location.pathname.includes("/orders/clone")) {
          navigate("/orders");
        } else {
          navigate(-1);
        }
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

  const handleFetchData = async (orderId) => {
    try {
      const response = await api.get(`${ordersConfig.ordersApi}/${orderId}`);
      const initialData = response?.data?.data?.result?.[0] || {};
      return initialData;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return {};
    }
  };

  const [initialRtoWarehouseData, setInitialRtoWarehouseData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      if (
        location.pathname.includes("/orders/edit") ||
        location.pathname.includes("/orders/clone")
      ) {
        const data = await handleFetchData(id);
        setInitialProductData(data?.products || []);
        setInitialWarehouseData(data?.warehouse_id || "");
        setInitialRtoWarehouseData(data?.rto_warehouse_id || "");
        setForm({
          orderId: location.pathname.includes("/orders/clone")
            ? `${data?.orderId}-Copy`
            : data?.orderId || "",
          paymentType: data?.paymentType || "",
          "shippingDetails.fname": data?.shippingDetails?.fname || "",
          "shippingDetails.lname": data?.shippingDetails?.lname || "",
          "shippingDetails.address": data?.shippingDetails?.address || "",
          "shippingDetails.pincode": data?.shippingDetails?.pincode || "",
          "shippingDetails.city": data?.shippingDetails?.city || "",
          "shippingDetails.state": data?.shippingDetails?.state || "",
          "shippingDetails.phone": data?.shippingDetails?.phone || "",
          "shippingDetails.alternatePhone":
            data?.shippingDetails?.alternatePhone || "",
          "packageDetails.weight": data?.packageDetails?.weight || "",
          "packageDetails.height": data?.packageDetails?.height || "",
          "packageDetails.breadth": data?.packageDetails?.breadth || "",
          "packageDetails.length": data?.packageDetails?.length || "",
          "packageDetails.volumetricWeight":
            data?.packageDetails?.volumetricWeight || "",
          orderAmount: data?.orderAmount || "",
          "charges.shipping": data?.charges?.shipping || "",
          "charges.tax_amount": data?.charges?.tax_amount || "",
          "charges.cod": data?.charges?.cod || "",
          "charges.discount": data?.charges?.discount || "",
          collectableAmount: data?.collectableAmount || "",
          // products: [],
          // warehouse_id: data?.warehouse_id || "",
        });
      }
    };

    fetchData();
  }, [location.pathname, id]);

  return (
    <>
      <div className="tab-content tab-content-vertical">
        <div className="tab-pane fade show active" role="tabpanel">
          <div className="row text-center">
            <div className="col-lg-12 col-md-12 col-sm-12 ">
              <div className="card custom-card">
                <div className="card-body pd-45">
                  <form onSubmit={handleSubmit}>
                    <div className="row">

                      <div className="col-md-8">
                        <div className="row">
                          <h4 className="text-start mb-3">
                            Shipping Information
                          </h4>
                          {[
                            "fname",
                            "lname",
                            "phone",
                            "alternatePhone",
                            "address",
                            "pincode",
                            "city",
                            "state",
                          ].map((field) => {
                            const customLabels = {
                              fname: "First Name",
                              lname: "Last Name",
                              alternatePhone: "Alternate Phone",
                            };

                            const label =
                              customLabels[field] ||
                              field
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase());

                            const maxLength =
                              field === "phone" || field === "alternatePhone"
                                ? 10
                                : field === "pincode"
                                  ? 6
                                  : undefined;

                            return field === "address" ? (
                              <div
                                key={`shippingDetails.${field}`}
                                className="col-md-12 mb-2"
                              >
                                <div className="form-floating text-start mb-3">
                                  <textarea
                                    className="form-control form-textarea"
                                    label={label}
                                    placeholder={label}
                                    name={`shippingDetails.${field}`}
                                    id={`shippingDetails.${field}`}
                                    value={form[`shippingDetails.${field}`]}
                                    onChange={handleChange}
                                    error={errors[`shippingDetails.${field}`]}
                                    ref={(node) =>
                                      setRef(`shippingDetails.${field}`, node)
                                    }
                                    rows={3}
                                  />
                                  <label htmlFor={`shippingDetails.${field}`}>
                                    {label}
                                    <span className="text-danger">*</span>
                                  </label>
                                  {errors[`shippingDetails.${field}`] && (
                                    <small className="text-danger">
                                      {errors[`shippingDetails.${field}`]}
                                    </small>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <InputField
                                key={`shippingDetails.${field}`}
                                label={label}
                                name={`shippingDetails.${field}`}
                                value={form[`shippingDetails.${field}`]}
                                onChange={handleChange}
                                error={errors[`shippingDetails.${field}`]}
                                disabled={["city", "state"].includes(field)}
                                loading={
                                  field === "pincode" ? loadingPincode : false
                                }
                                ref={(node) =>
                                  setRef(`shippingDetails.${field}`, node)
                                }
                                maxLength={maxLength}
                                screenMd={
                                  ["city", "state", "pincode"].includes(field)
                                    ? "4"
                                    : "6"
                                }
                              />
                            );
                          })}

                          <ProductSection
                            setForm={setForm}
                            setProductsPrice={setProductsPrice}
                            setErrors={setErrors}
                            initialProductData={initialProductData}
                          />
                          {errors.products && (
                            <small className="text-danger text-start">
                              {errors.products}
                            </small>
                          )}

                          <div className="col-md-6"></div>
                          <h4 className="text-start col-md-6 mb-3 mt-3">Charges</h4>
                          <div className="col-md-6"></div>
                          <InputField
                            label="Order Amount"
                            value={productsPrice}
                            screenMd="6"
                            disabled
                          />
                          <div className="col-md-6"></div>

                          <InputField
                            key="charges.shipping"
                            label="Shipping Charge"
                            name="charges.shipping"
                            value={form["charges.shipping"]}
                            onChange={handleChange}
                            error={errors["charges.shipping"]}
                            ref={(node) => setRef("charges.shipping", node)}
                            screenMd="6"
                          />
                          <div className="col-md-6"></div>

                          {form.paymentType === "cod" && (
                            <>
                              <InputField
                                key="charges.cod"
                                label="COD Charge"
                                name="charges.cod"
                                value={form["charges.cod"]}
                                onChange={handleChange}
                                error={errors["charges.cod"]}
                                ref={(node) => setRef("charges.cod", node)}
                                screenMd="6"
                              />
                              <div className="col-md-6"></div>
                            </>)}

                          {[
                            "charges.tax_amount",
                            "charges.discount",
                          ].map((field) => {
                            const labelMap = {
                              "charges.tax_amount": "Tax Amount",
                              "charges.discount": "Discount",
                            };

                            return (
                              <>
                                <InputField
                                  key={field}
                                  label={labelMap[field] || field}
                                  name={field}
                                  value={form[field]}
                                  onChange={handleChange}
                                  error={errors[field]}
                                  ref={(node) => setRef(field, node)}
                                  screenMd="6"
                                />
                                <div className="col-md-6"></div>
                              </>
                            );
                          })}

                          <InputField
                            key="orderAmount"
                            label="Final Amount"
                            name="orderAmount"
                            value={form.orderAmount}
                            error={errors.orderAmount}
                            onChange={handleChange}
                            ref={(node) => setRef("orderAmount", node)}
                            screenMd="6"
                            disabled
                          />
                          <div className="col-md-6"></div>

                          {form.paymentType === "cod" && (
                            <InputField
                              key="collectableAmount"
                              label="Collectable Amount"
                              name="collectableAmount"
                              value={form.collectableAmount}
                              error={errors.collectableAmount}
                              onChange={handleChange}
                              disabled={form.paymentType === "prepaid"}
                              ref={(node) => setRef("collectableAmount", node)}
                              screenMd="6"
                            />
                          )}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="row">
                          <h4 className="text-start mb-3">Order Information</h4>
                          <InputField
                            key="orderId"
                            label="Order ID"
                            name="orderId"
                            value={form.orderId}
                            onChange={handleChange}
                            error={errors.orderId}
                            ref={(node) => setRef("orderId", node)}
                            screenMd="6"
                          />
                          <div className="col-md-6 mb-2">
                            <div className="form-floating text-start mb-3">
                              <select
                                className="form-control lh-sm"
                                name="paymentType"
                                id="paymentType"
                                value={form.paymentType}
                                onChange={handleChange}
                                ref={(node) => setRef("paymentType", node)}
                              >
                                <option value="">Select</option>
                                {[
                                  { label: "COD", value: "cod" },
                                  { label: "Prepaid", value: "prepaid" },
                                ].map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <label key="paymentType">
                                Payment Type<span className="text-danger">*</span>
                              </label>
                              {errors.paymentType && (
                                <small className="text-danger">
                                  {errors.paymentType}
                                </small>
                              )}
                            </div>
                          </div>

                          <h4 className="text-start mt-3 mb-3">
                            Package Details
                          </h4>
                          <InputField
                            key="packageDetails.weight"
                            label="Weight (grams)"
                            name="packageDetails.weight"
                            value={form["packageDetails.weight"]}
                            onChange={handleChange}
                            error={errors["packageDetails.weight"]}
                            ref={(node) => setRef("packageDetails.weight", node)}
                            screenMd="12"
                          />

                          <div className="col-md-12 mb-2">
                            <div className="form-group text-start mb-3">
                              <div className="d-flex gap-2">
                                {["length", "breadth", "height"].map((dim) => (
                                  <div
                                    key={dim}
                                    className="d-flex flex-column flex-grow-1 form-floating"
                                  >
                                    <input
                                      className="form-control"
                                      name={`packageDetails.${dim}`}
                                      id={`packageDetails.${dim}`}
                                      value={form[`packageDetails.${dim}`]}
                                      onChange={handleChange}
                                      placeholder={
                                        dim.charAt(0).toUpperCase() + dim.slice(1)
                                      }
                                      ref={(node) =>
                                        setRef(`packageDetails.${dim}`, node)
                                      }
                                    />
                                    <label htmlFor={`packageDetails.${dim}`}>
                                      {dim.charAt(0).toUpperCase() +
                                        dim.slice(1) +
                                        " (cm)"}
                                      <span className="text-danger">*</span>
                                    </label>
                                    {errors[`packageDetails.${dim}`] && (
                                      <small className="text-danger">
                                        {errors[`packageDetails.${dim}`]}
                                      </small>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <InputField
                            key="packageDetails.volumetricWeight"
                            label="Volumetric Weight (grams)"
                            name="packageDetails.volumetricWeight"
                            value={form["packageDetails.volumetricWeight"]}
                            error={errors["packageDetails.volumetricWeight"]}
                            disabled
                            ref={(node) =>
                              setRef("packageDetails.volumetricWeight", node)
                            }
                            screenMd="12"
                          />
                          {/* <div className="col-md-6 mb-2"></div> */}

                          <div className="col-md-12 mt-3">
                            <WarehouseDropdown
                              setForm={setForm}
                              setErrors={setErrors}
                              initialWarehouseData={initialWarehouseData}
                              warehouseType={"normal"}
                            />
                            {errors.warehouse_id && (
                              <small className="text-danger text-start mb-4">
                                {errors.warehouse_id}
                              </small>
                            )}
                          </div>

                          <div className="col-md-12 mt-3">
                            <WarehouseDropdown
                              setForm={setForm}
                              setErrors={setErrors}
                              initialWarehouseData={initialRtoWarehouseData}
                              warehouseType={"rto"}
                            />
                            {errors.rto_warehouse_id && (
                              <small className="text-danger text-start mb-4">
                                {errors.rto_warehouse_id}
                              </small>
                            )}
                          </div>
                          <div className="col-md-12 mt-2">
                            <button style={{ width: "150px" }} className="btn btn-dark btn-md py-2 px-3" type="button" onClick={() => setShowAddWarehouseModal(true)}>
                              Add Warehouse
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>

                    <button className="btn btn-primary float-end" type="submit">
                      {loading ? "Submitting..." : location.pathname.includes("/orders/edit") ? "Edit order" : "Create order"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAddWarehouseModal && (
        <AddWarehouseModal
          onClose={() => setShowAddWarehouseModal(false)}
        />
      )}
    </>
  );
}

export default OrdersForm;

const InputField = React.forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      error,
      disabled,
      loading,
      type = "text",
      maxLength,
      screenMd,
    },
    ref
  ) => (
    <div className={`col-md-${screenMd} mb-2`}>
      <div className="form-floating text-start mb-3">
        <input
          type={type}
          className="form-control"
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
          maxLength={maxLength}
          placeholder={name}
        />
        <label htmlFor={name}>
          {label}
          {name !== "shippingDetails.alternatePhone" && name !== "charges.shipping" && name !== "charges.discount" && (
            <span className="text-danger">*</span>
          )}
        </label>
        {name === "shippingDetails.pincode" && loading && (
          <>
            <small className="text-muted">Fetching city & state...</small>
            <br />
          </>
        )}
        {name === "packageDetails.weight" && (
          <>
            <small className="text-muted">eg: 500, 300 (in grams)</small>
            <br />
          </>
        )}
        {error && <small className="text-danger">{error}</small>}
      </div>
    </div>
  )
);
