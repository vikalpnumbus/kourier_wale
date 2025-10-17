import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { useAlert } from "../../../middleware/AlertContext";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import a4Image from "../../../assets/image/size-a4.png";
import thermalImage from "../../../assets/image/thermal-label.png";


function LabelSettings() {
  const [selectedLabel, setSelectedLabel] = useState("thermal");
  const { showError, showSuccess } = useAlert();

  const handleChange = (e) => {
    setSelectedLabel(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(companyDetailsConfig.labelSettingConfig, {
        paper_size: selectedLabel,
      });

      if (response?.data?.status === 201) {
        showSuccess(
          response.data?.data?.message || "Label type updated successfully!"
        );
      } else {
        showError(response.data?.data?.message || "Something went wrong!");
      }
    } catch (err) {
      showError(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Something went wrong"
      );
    }
  };

  const handleFetchData = async () => {
    try {
      const response = await api.get(companyDetailsConfig.companyDetails);
      setSelectedLabel(
        response?.data?.data?.companyDetails?.label_settings?.paper_size || ""
      );
    } catch (error) {
      console.error("Company Details Fetch Error:", error);
      setSelectedLabel("");
    }
  };
  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-12">
                <h4 className="card-title">Label Setting</h4>
                <p className="card-description">
                  Set your shipping label format
                </p>
                <hr />
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 border-end">
                      <label className="card ">
                        <div className="card-header border-bottom">
                          <div className="d-flex align-items-center">
                            <input
                              type="radio"
                              className="mx-2 form-check-input mt-0"
                              value="standard"
                              checked={selectedLabel === "standard"}
                              onChange={handleChange}
                            />
                            <p className="mb-0">
                              Standard Desktop Printers - Size A4 (8"X11")
                              <br />
                              <small className="d-block fw-500">
                                (Four Label Printed on one Sheet)
                              </small>
                            </p>
                          </div>
                        </div>

                        <div className="card-body" style={{backgroundColor: "#1f1f1f08"}}>
                          <div className="d-flex justify-content-center mt-4">
                            <img src={a4Image} width={200} alt="A4" />
                          </div>
                        </div>
                      </label>
                    </div>
                      
                    <div className="col-md-6">
                      <label className="card">
                        <div className="card-header border-bottom">
                          <div className="d-flex align-items-center">
                            <input
                              type="radio"
                              className="mx-2 form-check-input mt-0"
                              value="thermal"
                              checked={selectedLabel === "thermal"}
                              onChange={handleChange}
                            />
                            <p className="mb-0">
                              Thermal Label Printers - Size (4"X6")
                              <br />
                              <small className="d-block fw-500">
                                (Single Label on one Sheet)
                              </small>
                            </p>
                          </div>
                        </div>
                        <div className="card-body" style={{backgroundColor: "#1f1f1f08"}}>
                          <div className="d-flex justify-content-center mt-4">
                            <img src={thermalImage} width={200} alt="A4" />
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="row justify-content-center m-0 mt-3">
                    <button
                      type="submit"
                      className="btn btn-dark py-3 px-4 col-md-2"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabelSettings;
