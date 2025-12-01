import React, {
  useState,
  useEffect,
} from "react";
import RateConfig from "../../../config/RateDetails/RateDetailsConfig";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import api from "../../../utils/api";
import '../../../../public/themes/assets/css/custom/custom.css';
function index() {
    const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
    paymentType: "",
    amount: ""
  });
  const planNames = {
    1: "Bronze",
    2: "Silver",
    3: "Gold",
    4: "Platinum",
  };
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForwardReverse, setShowForwardReverse] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.origin.trim()) {
    newErrors.origin = "Origin is required";
    } else if (formData.origin.trim().length !== 6) {
    newErrors.origin = "Origin must be exactly 6 characters";
    }
    if (!formData.destination.trim()) {
        newErrors.destination = "Destination is required";
    } else if (formData.destination.trim().length !== 6) {
        newErrors.destination = "Destination must be exactly 6 characters";
    }
    if (!formData.weight.trim()) newErrors.weight = "Weight is required";
    if (!formData.length.trim()) newErrors.length = "Length is required";
    if (!formData.breadth.trim()) newErrors.breadth = "Breadth is required";
    if (!formData.height.trim()) newErrors.height = "Height is required";
    return newErrors;
  };
  const [ratePrice, setRatePrice] = useState([]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0)
    {
      try {
        setLoading(true);
        const url = `${RateConfig.RateCalculator}`;
        const res = await api.post(url, formData);
        setShowForwardReverse(true);
        setRatePrice(res?.data?.data?.rows || []);
      } catch (error) {
        console.error("API Error:", error);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  const [planData, setPlanData] = useState({});
  const fetchplanname = async () => {
    try {
      const response = await api.get(companyDetailsConfig.companyDetails);
      setPlanData(response?.data?.data?.companyDetails || {});
    } catch (error) {
      console.error("Company Details Fetch Error:", error);
      setPlanData({});
    }
  };

  const [planChartData, setPlanChartData] = useState([]);
  const fetchplanchart = async () => {
    try {
        const response = await api.get(RateConfig.Plan_chart);
        const chartData = response?.data?.data?.result || response?.data?.result || [];
        console.log("Fetched Plan Chart:", chartData);
        const grouped = chartData.reduce((acc, row) => {
        const key = `${row.courier_name} ${row.weight}`;
        if (!acc[key]) acc[key] = { courier: row.courier_name, weight: row.weight, data: {} };
        acc[key].data[row.type.toLowerCase()] = row; // forward, weight, rto
        return acc;
        }, {});
        setPlanChartData(Object.values(grouped));
        } catch (error) {
        console.error("Plan Details Fetch Error:", error);
        setPlanChartData([]);
        }
    };
    useEffect(() => {
      fetchplanname();
    }, []);
    useEffect(() => {
    fetchplanchart();
    }, []);

  return (
    <div className='row'>
        <div className="col-6">
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title">Rate Calculator</h4>
                    <p className="card-description">Check Your Price As Per Your Conditions</p>
                    <hr></hr>
                    <form className="forms-sample" onSubmit={handleSubmit} noValidate>
                        <div className="row">
                            <div className="form-group col-md-4">
                            <label className="cmp_required">Origin</label>
                            <input
                                type="text"
                                name="origin"
                                maxLength={6}
                                pattern="\d*"
                                className="form-control"
                                placeholder="Origin"
                                value={formData.origin}
                                onChange={handleChange}
                            />
                            {errors.origin && <small className="cmp-text-danger">{errors.origin}</small>}
                            </div>
                            <div className="form-group col-md-4">
                            <label className="cmp_required">Destination</label>
                            <input
                                type="text"
                                name="destination"
                                maxLength={6}
                                pattern="\d*"
                                className="form-control"
                                placeholder="Destination"
                                value={formData.destination}
                                onChange={handleChange}
                            />
                            {errors.destination && <small className="cmp-text-danger">{errors.destination}</small>}
                            </div>
                            <div className="form-group col-md-4">
                            <label className="cmp_required">Weight</label>
                            <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text cmp_input_gm">GM</span>
                                    </div>
                                    <input
                                        type="text"
                                        name="weight"
                                        className="form-control"
                                        placeholder="Weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                    />
                            </div>
                            {errors.weight && <small className="cmp-text-danger">{errors.weight}</small>}
                            </div>
                        </div>
                        <div className="row">
                            {["length", "breadth", "height"].map((field) => (
                            <div key={field} className="form-group col-md-4">
                                <label className="cmp_required">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text cmp_input_lbh">CM</span>
                                    </div>
                                    <input type="text" name={field} className="form-control" placeholder={field} value={formData[field]} onChange={handleChange}/>
                                </div>
                                {errors[field] && <small className="cmp-text-danger">{errors[field]}</small>}
                            </div>
                            ))}
                        </div>
                        <div className="row">
                            <div className="form-group col-md-6">
                            <label>Payment Method</label>
                            <select
                                name="paymentType"
                                className="form-select"
                                value={formData.paymentType}
                                onChange={handleChange}
                            >
                                <option value="">Payment Method</option>
                                <option value="cod">COD</option>
                                <option value="prepaid">PREPAID</option>
                            </select>
                            </div>

                            <div className="form-group col-md-6">
                            <label>Amount</label>
                            <input
                                type="text"
                                name="amount"
                                className="form-control"
                                placeholder="Total Amount"
                                value={formData.amount}
                                onChange={handleChange}
                            />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                            {loading ? "Calculating..." : "Calculate Price"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => {
                            setFormData({
                                origin: "",
                                destination: "",
                                weight: "",
                                length: "",
                                breadth: "",
                                height: "",
                                paymentType: "",
                                amount: ""
                            });
                            setErrors({});
                            }}
                        >
                            Clear
                        </button>
                    </form>
                </div>
            </div>
            <div className="col-md-12 mt-5">
                <div className="h-100">
                    <div className="card border p-3">
                        <h4 className="card-title">Rate Price</h4>
                        <p className="card-description">Check Your Price As Per Your Conditions</p>
                        <hr></hr>
                        {showForwardReverse && (
                            <div className="forward_reverse">
                                
                                {ratePrice.length > 0 ? (
                                    ratePrice.map((row, index) => (
                                <div className="volume_price" key={index}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="courier-title-heading">{row.courier_name}</span>
                                            <div className="courier-box">
                                                <div className="courier-box-rs">
                                                    <sup>₹</sup><span className="price">{row.total}</span>
                                                </div>
                                                <span className="delivery_in">/ {row.zone})</span>
                                            </div>
                                        </div>
                                        <i className="ti ti-truck" style={{fontSize: "50px"}}></i>
                                    </div>
                                    <div className="form-text ">
                                        <i className="ti ti-info-circle menu-icon"></i>Freight Charges : ₹ {row.freight_charge} + COD Charges: ₹ {row.cod_charge ?? "0"}
                                    </div>
                                </div>
                                )))
                            : ({

                            })}
                            </div>
                        )}
                    </div>
                </div>    
            </div>
        </div>
        <div className="col-6">
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title">Rate Card</h4>
                    <form className="form-sample">
                    <p className="card-description">
                        {{
                        1: "Bronze",
                        2: "Silver",
                        3: "Gold",
                        4: "Platinum"
                    }[planData?.pricingPlanId] || "Custom Plan"}
                    </p>
                    </form>
                    <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="bg-gray-200">
                        <tr>
                            <th>Courier</th>
                            <th>Z 1</th>
                            <th>Z 2</th>
                            <th>Z 3</th>
                            <th>Z 4</th>
                            <th>Z 5</th>
                            <th>COD / %</th>
                        </tr>
                        </thead>
                        <tbody>
                            {planChartData.length > 0 ? (
                                planChartData.map((row, i) => (
                                <tr key={i}>
                                <td className="text-left font-medium">
                                    {row.courier} / {row.type}
                                </td>
                                <td>
                                    <div>FWD: {row.data.forward?.zone1 || "-"}</div>
                                    <div>WT: {row.data.weight?.zone1 || "-"}</div>
                                    <div>RTO: {row.data.rto?.zone1 || "-"}</div>
                                </td>
                                <td>
                                    <div>FWD: {row.data.forward?.zone2 || "-"}</div>
                                    <div>WT: {row.data.weight?.zone2 || "-"}</div>
                                    <div>RTO: {row.data.rto?.zone2 || "-"}</div>
                                </td>
                                <td>
                                    <div>FWD: {row.data.forward?.zone3 || "-"}</div>
                                    <div>WT: {row.data.weight?.zone3 || "-"}</div>
                                    <div>RTO: {row.data.rto?.zone3 || "-"}</div>
                                </td>
                                <td>
                                    <div>FWD: {row.data.forward?.zone4 || "-"}</div>
                                    <div>WT: {row.data.weight?.zone4 || "-"}</div>
                                    <div>RTO: {row.data.rto?.zone4 || "-"}</div>
                                </td>
                                <td>
                                    <div>FWD: {row.data.forward?.zone5 || "-"}</div>
                                    <div>WT: {row.data.weight?.zone5 || "-"}</div>
                                    <div>RTO: {row.data.rto?.zone5 || "-"}</div>
                                </td>
                                <td>
                                    {row.data.forward?.cod || 0} / {row.data.forward?.cod_percentage || 0}%
                                </td>
                                </tr>
                            ))
                            ) : (
                            <tr>
                                <td colSpan="9" className="text-center text-gray-500">
                                No Data Found
                                </td>
                            </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
export default index