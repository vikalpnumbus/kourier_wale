import React, { useEffect, useState } from "react";
import axios from "axios";
import { data, Link } from "react-router-dom";

const FormFieldError = ({ text }) => {
  return text != "" && <span className="text-danger form-text">{text}</span>;
};

export default function KYCDetails() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState({ save: false, dataList: false });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [editSubmit, setEditSubmit] = useState(false);

  const [dataList, setDataList] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateErrors = () => {
    const newErrors = {};
    const alphanumericRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!formData.panCardNumber || formData.panCardNumber.trim().length === 0) {
      newErrors.panCardNumber = "Pan card number is required.";
    } else if (formData.panCardNumber.trim().length !== 10) {
      newErrors.panCardNumberLength =
        "Pan card number must be 10 characters long.";
    } else if (!alphanumericRegex.test(formData.panCardNumber.trim())) {
      newErrors.panCardNumberAlphanumeric =
        "Pan card number must be alphanumeric. Example: ABCDE1234F";
    }

    if (!formData.nameOnPanCard || formData.nameOnPanCard.trim().length === 0) {
      newErrors.nameOnPanCard = "Name on Pan card is required.";
    }

    if (!formData.panCardImage) {
      newErrors.panCardImage = "Pan card image is required.";
    }

    if (!formData.documentType) {
      newErrors.documentType = "Document type is required.";
    }

    if (!formData.documentId || formData.documentId.trim().length === 0) {
      newErrors.documentId = "Document ID is required.";
    } else if (formData.documentType == "Aadhar") {
      const value = /^[2-9]{1}[0-9]{11}$/.test(formData.documentId.trim());
      newErrors.documentId = value
        ? ""
        : "Invalid Aadhar number. Example: 291234567890";
    } else if (formData.documentType == "Driving License") {
      const value = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(
        formData.documentId.trim()
      );
      newErrors.documentId = value
        ? ""
        : "Invalid DL format. Example: MH1220190001234";
    } else if (formData.documentType == "Passport") {
      const value = /^[A-PR-WYa-pr-wy][0-9]{7}$/.test(
        formData.documentId.trim()
      );
      newErrors.documentId = value
        ? ""
        : "Invalid Passport format. Example: A1234567";
    } else if (formData.documentType == "Voter ID") {
      const value = /^[A-Z]{3}[0-9]{7}$/.test(formData.documentId.trim());
      newErrors.documentId = value
        ? ""
        : "Invalid Voter ID format. Example: ABC1234567";
    } else if (formData.documentType == "Electricity Bill") {
      const value = /^[0-9]{5,13}$/.test(formData.documentId.trim());
      newErrors.documentId = value
        ? ""
        : "Invalid number. Must be 5–13 digits.";
    }

    if (
      !formData.nameOnDocument ||
      formData.nameOnDocument.trim().length === 0
    ) {
      newErrors.nameOnDocument = "Document name is required.";
    }

    if (!formData.documentFrontImage) {
      if (
        formData.kycType === "private limited company" ||
        formData.kycType === "public limited company"
      ) {
        newErrors.documentFrontImage = "Document Image is required.";
      } else {
        newErrors.documentFrontImage = "Front Image is required.";
      }
    }

    if (
      formData.kycType !== "private limited company" &&
      formData.kycType !== "public limited company" &&
      !formData.documentBackImage
    ) {
      newErrors.documentBackImage = "Back Image is required.";
    }

    if (
      formData.kycType === "partnership" ||
      formData.kycType === "limited liability partnership" ||
      formData.kycType === "limited liability partnership"
    ) {
      if (!formData.partnershipDeedImage)
        newErrors.partnershipDeedImage = "Partnership Deed is required.";
    }

    if (
      formData.kycType === "public limited company" ||
      formData.kycType === "private limited company"
    ) {
      if (!formData.coiNumber || formData.coiNumber.trim().length === 0)
        newErrors.coiNumber = "COI number is required.";
    }
    if (formData.kycType !== "sole proprietorship") {
      if (!formData.gstNumber || formData.gstNumber.trim().length === 0) {
        newErrors.gstNumber = "GST number is required.";
      } else if (!gstRegex.test(formData.gstNumber.trim())) {
        newErrors.gstNumber = "Invalid GST format. Example: 22AAAAA0000A1Z5";
      }
      if (!formData.gstImage) newErrors.gstImage = "GST Image is required.";
      if (!formData.gstName || formData.gstName.trim().length === 0) {
        newErrors.gstName = "GST name is required.";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      return true;
    } else {
      return Object.values(newErrors).every((val) => val === "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateErrors()) return;
    try {
      const payload = new FormData();

      if (formData.kycType) payload.append("kycType", formData.kycType);
      if (formData.panCardNumber)
        payload.append("panCardNumber", formData.panCardNumber);
      if (formData.nameOnPanCard)
        payload.append("nameOnPanCard", formData.nameOnPanCard);
      if (formData.documentType)
        payload.append("documentType", formData.documentType);
      if (formData.documentId)
        payload.append("documentId", formData.documentId);
      if (formData.nameOnDocument)
        payload.append("nameOnDocument", formData.nameOnDocument);
      if (formData.gstNumber) payload.append("gstNumber", formData.gstNumber);
      if (formData.gstName) payload.append("gstName", formData.gstName);
      if (formData.panCardImage)
        payload.append("panCardImage", formData.panCardImage);
      if (formData.partnershipDeedImage)
        payload.append("partnershipDeedImage", formData.partnershipDeedImage);
      if (formData.gstImage) payload.append("gstImage", formData.gstImage);
      if (formData.documentFrontImage)
        payload.append("documentFrontImage", formData.documentFrontImage);
      if (formData.documentBackImage)
        payload.append("documentBackImage", formData.documentBackImage);
      if (formData.coiNumber) payload.append("coiNumber", formData.coiNumber);

      const response = await axios[editSubmit ? "patch" : "post"](
        "http://localhost:3001/api/v1/kyc",
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(editSubmit ? response.data.data : response.data.data.message);
      handleFetchData();
      setEditSubmit(false);
    } catch (err) {
      const messages = err.response?.data?.message;
      if (Array.isArray(messages)) {
        const newErrors = {};
        messages.forEach((msg) => {
          newErrors[msg.field] = msg.message;
        });
        setErrors((prev) => ({ ...prev, ...newErrors }));
      } else if (typeof messages === "string") {
        alert(messages);
      } else {
        alert("Something went wrong.");
      }
    }
  };

  const handleFetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/v1/kyc", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDataList(response?.data?.data);
      setFormData(response?.data?.data);
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setDataList({});
      setFormData({});
      setIsSubmitted(false);
    }
  };

  useEffect(() => {
    setErrors({});
    const data = {};
    data.kycType = formData.kycType;
    if (formData.kycType?.toLowerCase() == "sole proprietorship") {
      data.panCardNumber = dataList?.panCardNumber;
      data.nameOnPanCard = dataList?.nameOnPanCard;
      data.documentType = dataList?.documentType;
      data.documentId = dataList?.documentId;
      data.nameOnDocument = dataList?.nameOnDocument;
      // data.panCardImage = Array.isArray(dataList?.panCardImage)
      //   ? dataList.panCardImage[0]
      //   : dataList?.panCardImage || null;

      // data.documentFrontImage = Array.isArray(dataList?.documentFrontImage)
      //   ? dataList.documentFrontImage[0]
      //   : dataList?.documentFrontImage || null;

      // data.documentBackImage = Array.isArray(dataList?.documentBackImage)
      //   ? dataList.documentBackImage[0]
      //   : dataList?.documentBackImage || null;
    }
    if (formData.kycType?.toLowerCase() == "partnership") {
      data.panCardNumber = dataList?.panCardNumber;
      data.nameOnPanCard = dataList?.nameOnPanCard;
      data.documentType = dataList?.documentType;
      data.documentId = dataList?.documentId;
      data.nameOnDocument = dataList?.nameOnDocument;
      data.gstName = dataList?.gstName;
      data.gstNumber = dataList?.gstNumber;
      // data.panCardImage = Array.isArray(dataList?.panCardImage)
      //   ? dataList.panCardImage[0]
      //   : dataList?.panCardImage || null;

      // data.documentFrontImage = Array.isArray(dataList?.documentFrontImage)
      //   ? dataList.documentFrontImage[0]
      //   : dataList?.documentFrontImage || null;

      // data.documentBackImage = Array.isArray(dataList?.documentBackImage)
      //   ? dataList.documentBackImage[0]
      //   : dataList?.documentBackImage || null;

      // data.partnershipDeedImage = Array.isArray(dataList?.partnershipDeedImage)
      //   ? dataList.partnershipDeedImage[0]
      //   : dataList?.partnershipDeedImage || null;

      // data.gstImage = Array.isArray(dataList?.gstImage)
      //   ? dataList.gstImage[0]
      //   : dataList?.gstImage || null;
    }
    if (formData.kycType?.toLowerCase() == "limited liability partnership") {
      data.panCardNumber = dataList?.panCardNumber;
      data.nameOnPanCard = dataList?.nameOnPanCard;
      data.documentType = dataList?.documentType;
      data.documentId = dataList?.documentId;
      data.nameOnDocument = dataList?.nameOnDocument;
      data.gstName = dataList?.gstName;
      data.gstNumber = dataList?.gstNumber;
      // data.panCardImage = Array.isArray(dataList?.panCardImage)
      //   ? dataList.panCardImage[0]
      //   : dataList?.panCardImage || null;

      // data.documentFrontImage = Array.isArray(dataList?.documentFrontImage)
      //   ? dataList.documentFrontImage[0]
      //   : dataList?.documentFrontImage || null;

      // data.documentBackImage = Array.isArray(dataList?.documentBackImage)
      //   ? dataList.documentBackImage[0]
      //   : dataList?.documentBackImage || null;

      // data.partnershipDeedImage = Array.isArray(dataList?.partnershipDeedImage)
      //   ? dataList.partnershipDeedImage[0]
      //   : dataList?.partnershipDeedImage || null;

      // data.gstImage = Array.isArray(dataList?.gstImage)
      //   ? dataList.gstImage[0]
      //   : dataList?.gstImage || null;
    }
    if (
      formData.kycType?.toLowerCase() == "public limited company" ||
      formData.kycType?.toLowerCase() == "private limited company"
    ) {
      data.panCardNumber = dataList?.panCardNumber;
      data.nameOnPanCard = dataList?.nameOnPanCard;
      data.coiNumber = dataList?.coiNumber;
      data.documentId = dataList?.documentId;
      data.nameOnDocument = dataList?.nameOnDocument;
    }

    const documentType = dataList?.documentType;
    if (
      formData.kycType?.toLowerCase() == "public limited company" ||
      formData.kycType?.toLowerCase() == "private limited company"
    ) {
      if (
        documentType == "Electricity Bill" ||
        documentType == "Lease / Rent Agreement" ||
        documentType == "Telephone or Broadband Bill"
      ) {
        data.documentType = documentType;
      }
    } else if (
      documentType == "Electricity Bill" ||
      documentType == "Lease / Rent Agreement" ||
      documentType == "Telephone or Broadband Bill"
    ) {
      data.documentType = "";
    }

    setFormData(data);
  }, [formData.kycType]);

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <>
      <div
        className="row d-flex justify-content-center main-signin-wrapper py-5"
        style={{ minHeight: "100vh" }}
      >
        <div className="col-xl-6">
          <div className="card custom-card">
            <div className="card-header justify-content-between">
              <div className="card-title">KYC Details</div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className=" mt-3">
                  <div className="form-row">
                    <div className="form-group col-md-12">
                      <label>Select Type of KYC</label>
                      <select
                        disabled={isSubmitted}
                        className="form-control form-select"
                        name="kycType"
                        value={formData.kycType || ""}
                        onChange={handleChange}
                      >
                        <option value="" onChange={handleChange}>
                          Select Type
                        </option>
                        <option
                          value="sole proprietorship"
                          onChange={handleChange}
                        >
                          Sole Proprietorship
                        </option>
                        <option value="partnership" onChange={handleChange}>
                          Partnership
                        </option>
                        <option
                          value="limited liability partnership"
                          onChange={handleChange}
                        >
                          Limited Liability Partnership
                        </option>
                        <option
                          value="public limited company"
                          onChange={handleChange}
                        >
                          Public Limited Company
                        </option>
                        <option
                          value="private limited company"
                          onChange={handleChange}
                        >
                          Private Limited Company
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                {formData.kycType != undefined && formData.kycType !== "" && (
                  <div className="row">
                    <div className="form-row">
                      <div className="form-group col-md-12">
                        <label className="control-label">
                          Document 1 -{" "}
                          {formData.kycType == "partnership" ||
                          formData.kycType == "limited liability partnership" ||
                          formData.kycType == "public limited company" ||
                          formData.kycType == "private limited company"
                            ? "Company "
                            : ""}
                          PAN Card Number{" "}
                          <span className="text-red font-bold">*</span>
                        </label>
                        <input
                          disabled={isSubmitted}
                          type="text"
                          name="panCardNumber"
                          className="form-control"
                          maxLength={10}
                          value={formData.panCardNumber || ""}
                          onChange={(e) => {
                            const { value } = e.target;
                            const regex = /^[a-zA-Z0-9]*$/; // Allows only letters and numbers
                            if (!regex.test(value)) {
                              return alert(
                                "Only letters and numbers are allowed in this field"
                              );
                            }
                            e.target.value = e.target.value.toUpperCase();
                            handleChange(e);
                          }}
                        />

                        <FormFieldError
                          text={
                            errors.panCardNumber ||
                            errors.panCardNumberLength ||
                            errors.panCardNumberAlphanumeric
                          }
                        />
                      </div>
                      <div className="form-group ">
                        <label className="control-label">
                          Enter Name on Pan Card{" "}
                          <span className="text-red font-bold">*</span>
                        </label>
                        <input
                          disabled={isSubmitted}
                          type="text"
                          name="nameOnPanCard"
                          className="form-control"
                          value={formData.nameOnPanCard || ""}
                          onChange={(e) => handleChange(e)}
                        />
                        <FormFieldError text={errors.nameOnPanCard} />
                      </div>

                      <div className="form-group ">
                        <label className="control-label">
                          Upload Pan Card Image{" "}
                          <span className="text-red font-bold">*</span>
                        </label>
                        {isSubmitted ? (
                          <img
                            height={100}
                            width={100}
                            src={`http://localhost:3001/api/v1${dataList.panCardImage[0]}`}
                            alt=""
                          />
                        ) : (
                          <input
                            disabled={isSubmitted}
                            type="file"
                            className="form-control"
                            name="panCardImage"
                            id="formFile"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                panCardImage: e.target.files[0],
                              }));
                              setErrors((prev) => ({
                                ...prev,
                                panCardImage: "",
                              }));
                            }}
                          />
                        )}

                        <FormFieldError text={errors.panCardImage} />
                      </div>

                      {(formData.kycType == "public limited company" ||
                        formData.kycType == "private limited company") && (
                        <>
                          <div className="form-group ">
                            <label className="control-label">
                              Enter COI No.
                            </label>
                            <input
                              disabled={isSubmitted}
                              type="text"
                              name="coiNumber"
                              className="form-control"
                              value={formData.coiNumber || ""}
                              onChange={(e) => handleChange(e)}
                            />
                            <FormFieldError text={errors.coiNumber} />
                          </div>
                          <div className="form-group ">
                            <div className="d-flex justify-content-between align-items-center">
                              <label className="control-label">
                                Upload COI Image
                              </label>
                            </div>
                            {isSubmitted ? (
                              <img
                                height={100}
                                width={100}
                                src={`http://localhost:3001/api/v1${dataList.documentFrontImage[0]}`}
                                alt=""
                              />
                            ) : (
                              <input
                                disabled={isSubmitted}
                                type="file"
                                className="form-control"
                                name="documentFrontImage"
                                id="formFile"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    documentFrontImage: e.target.files[0],
                                  }));
                                  setErrors((prev) => ({
                                    ...prev,
                                    documentFrontImage: "",
                                  }));
                                }}
                              />
                            )}

                            <FormFieldError text={errors.documentFrontImage} />
                          </div>
                        </>
                      )}
                      {(formData.kycType == "partnership" ||
                        formData.kycType ==
                          "limited liability partnership") && (
                        <div className="form-group ">
                          <label className="control-label">
                            Upload Partnership Deed{" "}
                            <span className="text-red font-bold">*</span>
                          </label>
                          {isSubmitted ? (
                            <img
                              height={100}
                              width={100}
                              src={`http://localhost:3001/api/v1${dataList.partnershipDeedImage[0]}`}
                              alt=""
                            />
                          ) : (
                            <input
                              disabled={isSubmitted}
                              type="file"
                              className="form-control"
                              name="partnershipDeedImage"
                              id="formFile"
                              accept=".jpg,.jpeg,.png"
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  partnershipDeedImage: e.target.files[0],
                                }));
                                setErrors((prev) => ({
                                  ...prev,
                                  partnershipDeedImage: "",
                                }));
                              }}
                            />
                          )}
                          <FormFieldError text={errors.partnershipDeedImage} />
                        </div>
                      )}

                      {formData.kycType !== "sole proprietorship" && (
                        <>
                          <div className="form-group ">
                            <label className="control-label">
                              Enter GST No.
                              <span className="text-red font-bold">*</span>
                            </label>
                            <input
                              disabled={isSubmitted}
                              type="text"
                              name="gstNumber"
                              className="form-control"
                              value={formData.gstNumber || ""}
                              onChange={(e) => handleChange(e)}
                              maxLength={15}
                            />
                            <FormFieldError text={errors.gstNumber} />
                          </div>
                          <div className="form-group ">
                            <label className="control-label">
                              Enter Name on GST{" "}
                              <span className="text-red font-bold">*</span>
                            </label>
                            <input
                              disabled={isSubmitted}
                              type="text"
                              name="gstName"
                              className="form-control"
                              value={formData.gstName || ""}
                              onChange={(e) => handleChange(e)}
                            />
                            <FormFieldError text={errors.gstName} />
                          </div>
                          <div className="form-group ">
                            <label className="control-label">
                              Upload GST Image{" "}
                              <span className="text-red font-bold">*</span>
                            </label>
                            {isSubmitted ? (
                              <img
                                height={100}
                                width={100}
                                src={`http://localhost:3001/api/v1${dataList.gstImage[0]}`}
                                alt=""
                              />
                            ) : (
                              <input
                                disabled={isSubmitted}
                                type="file"
                                className="form-control"
                                name="gstImage"
                                id="formFile"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    gstImage: e.target.files[0],
                                  }));
                                  setErrors((prev) => ({
                                    ...prev,
                                    gstImage: "",
                                  }));
                                }}
                              />
                            )}
                            <FormFieldError text={errors.gstImage} />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="bg-dark text-light my-2">
                      <h5 className="my-3 text-center">Second Section</h5>
                    </div>

                    <div className="form-row ">
                      <div className="form-group col-md-12">
                        <label className="control-label">
                          Document Type{" "}
                          <span className="text-red font-bold">*</span>
                        </label>
                        <select
                          disabled={isSubmitted}
                          className="form-control form-select"
                          name="documentType"
                          value={formData.documentType || ""}
                          onChange={(e) => handleChange(e)}
                        >
                          {formData.kycType == "public limited company" ||
                          formData.kycType == "private limited company" ? (
                            <>
                              <option value="">Select Document Type</option>
                              <option value="Electricity Bill">
                                Electricity Bill
                              </option>
                              <option value="Lease / Rent Agreement">
                                Lease / Rent Agreement
                              </option>
                              <option value="Telephone or Broadband Bill">
                                Telephone / Broadband Bill
                              </option>
                            </>
                          ) : (
                            <>
                              <option value="">Select Document Type</option>
                              <option value="Aadhar">Aadhar Card</option>
                              <option value="Driving License">
                                Driving License
                              </option>
                              <option value="Passport">Valid Passport</option>
                              <option value="Voter ID">Voter Id Card</option>
                            </>
                          )}
                        </select>
                        <FormFieldError text={errors.documentType} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group ">
                        <label className="control-label">
                          Document ID{" "}
                          <span className="text-red font-bold">*</span>
                        </label>
                        <input
                          disabled={isSubmitted}
                          type="text"
                          name="documentId"
                          className="form-control"
                          value={formData.documentId || ""}
                          onChange={(e) => handleChange(e)}
                        />
                        <FormFieldError text={errors.documentId} />
                      </div>
                      <div className="form-group ">
                        <label className="control-label">
                          Name on Document{" "}
                          <span className="text-red font-bold">*</span>
                        </label>
                        <input
                          disabled={isSubmitted}
                          type="text"
                          name="nameOnDocument"
                          className="form-control"
                          value={formData.nameOnDocument || ""}
                          onChange={(e) => handleChange(e)}
                        />
                        <FormFieldError text={errors.nameOnDocument} />
                      </div>
                    </div>

                    {formData.kycType != "public limited company" &&
                      formData.kycType != "private limited company" && (
                        <div className="form-row">
                          <div className="form-group ">
                            <label className="control-label">
                              Upload Document Front Image{" "}
                              <span className="text-red font-bold">*</span>
                            </label>

                            {isSubmitted ? (
                              <img
                                height={100}
                                width={100}
                                src={`http://localhost:3001/api/v1${dataList.documentFrontImage[0]}`}
                                alt=""
                              />
                            ) : (
                              <input
                                disabled={isSubmitted}
                                type="file"
                                className="form-control"
                                name="documentFrontImage"
                                id="formFile"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    documentFrontImage: e.target.files[0],
                                  }));
                                  setErrors((prev) => ({
                                    ...prev,
                                    documentFrontImage: "",
                                  }));
                                }}
                              />
                            )}

                            <FormFieldError text={errors.documentFrontImage} />
                          </div>

                          <div className="form-group ">
                            <label className="control-label">
                              Upload Document Back Image{" "}
                              <span className="text-red font-bold">*</span>
                            </label>
                            {isSubmitted ? (
                              <img
                                height={100}
                                width={100}
                                src={`http://localhost:3001/api/v1${dataList.documentBackImage[0]}`}
                                alt=""
                              />
                            ) : (
                              <input
                                disabled={isSubmitted}
                                type="file"
                                className="form-control"
                                name="documentBackImage"
                                id="formFile"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    documentBackImage: e.target.files[0],
                                  }));
                                  setErrors((prev) => ({
                                    ...prev,
                                    documentBackImage: "",
                                  }));
                                }}
                              />
                            )}

                            <FormFieldError text={errors.documentBackImage} />
                          </div>
                        </div>
                      )}

                    {(formData.kycType == "public limited company" ||
                      formData.kycType == "private limited company") && (
                      <div className="form-row">
                        <div className="form-group ">
                          <label className="control-label">
                            Upload Document Image{" "}
                            <span className="text-red font-bold">*</span>
                          </label>
                          {isSubmitted ? (
                            <img
                              height={100}
                              width={100}
                              src={`http://localhost:3001/api/v1${dataList.documentBackImage[0]}`}
                              alt=""
                            />
                          ) : (
                            <input
                              disabled={isSubmitted}
                              type="file"
                              className="form-control"
                              name="documentBackImage"
                              id="formFile"
                              accept=".jpg,.jpeg,.png"
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  documentBackImage: e.target.files[0],
                                }));
                                setErrors((prev) => ({
                                  ...prev,
                                  documentBackImage: "",
                                }));
                              }}
                            />
                          )}

                          <FormFieldError text={errors.documentBackImage} />
                        </div>
                      </div>
                    )}
                    <div className="form-group">
                      {isSubmitted ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setIsSubmitted(false);
                            setEditSubmit(true);
                          }}
                        >
                          Edit
                        </button>
                      ) : (
                        <>
                          <button
                            disabled={isSubmitted}
                            type="submit"
                            className="btn btn-primary"
                          >
                            Save Changes
                          </button>
                          {editSubmit && (
                            <button
                              type="button"
                              className="btn btn-secondary ms-2"
                              onClick={() => {
                                setEditSubmit(false);
                                handleFetchData();
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
