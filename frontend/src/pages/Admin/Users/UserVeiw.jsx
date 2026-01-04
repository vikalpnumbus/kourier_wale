import React, { useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiAccountBoxOutline, mdiCreditCardScanOutline } from "@mdi/js";
import { useParams, useSearchParams } from "react-router-dom";
import usersConfig from "../../../config/AdminConfig/Users/Users";
import api from "../../../utils/api";
import { formatDateTime } from "../../../middleware/CommonFunctions";
import ApproveRejectModal from "./ApproveRejectModal";
import { useAlert } from "../../../middleware/AlertContext";

function UserView() {
    const [userData, setUserData] = useState(null);
    const [userKycData, setUserKycData] = useState(null);

    const [userDataLoading, setUserDataLoading] = useState(false);
    const [kycDataLoading, setKycDataLoading] = useState(false);

    const [modalData, setModalData] = useState(null);
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const { showSuccess, showError } = useAlert();

    const [isEditingRemit, setIsEditingRemit] = useState(false);
    const [remitCycle, setRemitCycle] = useState("");
    const [remitLoading, setRemitLoading] = useState(false);



    const handleUserData = async () => {
        setUserDataLoading(true);
        try {
            const url = `${usersConfig.userList}/${id}`;
            const { data } = await api.get(url);
            setUserData(data?.data?.result?.[0] || null);
        } catch (err) {
            console.error(err);
            setUserData(null);
        } finally {
            setUserDataLoading(false);
        }
    };

    const handleUserKycData = async () => {
        setKycDataLoading(true);
        try {
            const url = `/admin/kyc/${id}`;
            const { data } = await api.get(url);
            setUserKycData(data?.data || null);
        } catch (err) {
            console.error(err);
            setUserKycData(null);
        } finally {
            setKycDataLoading(false);
        }
    };

    const handleRemittanceCycle = async () => {
        if (!remitCycle.trim()) return;

        try {
            setRemitLoading(true);

            await api.patch(
                `${usersConfig.userApi}/${id}`,
                { seller_remit_cycle: remitCycle.trim() }
            );

            setUserData((prev) =>
                prev
                    ? { ...prev, seller_remit_cycle: remitCycle.trim() }
                    : prev
            );

            showSuccess("Remittance cycle updated successfully");
            setIsEditingRemit(false);
        } catch (error) {
            console.error(error);
            showError("Failed to update remittance cycle");
        } finally {
            setRemitLoading(false);
        }
    };

    useEffect(() => {
        handleUserData();
        handleUserKycData();
    }, [id, searchParams]);


    useEffect(() => {
        if (!isEditingRemit && userData?.seller_remit_cycle) {
            setRemitCycle(userData.seller_remit_cycle);
        }
    }, [userData, isEditingRemit]);




    const Skeleton = () => (
        <div className="placeholder-glow">
            <div className="placeholder col-12 mb-2" style={{ height: 20 }} />
            <div className="placeholder col-10 mb-2" style={{ height: 20 }} />
            <div className="placeholder col-8 mb-2" style={{ height: 20 }} />
            <div className="placeholder col-6 mb-2" style={{ height: 20 }} />
            <div className="placeholder col-4 mb-2" style={{ height: 20 }} />
        </div>
    );

    // Image Helper
    const imgBase = import.meta.env.VITE_API_URL;

    return (
        <>
            <div className="px-4">
                <div className="row mt-3">

                    {/* ---------------- Seller Details ---------------- */}
                    <div className="col-12 col-md-6">
                        <div className="card p-3 mb-3 border">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <Icon path={mdiAccountBoxOutline} size={0.9} />
                                <h5 className="card-title mb-0">Seller Details</h5>
                            </div>

                            {userDataLoading ? (
                                <Skeleton />
                            ) : !userData ? (
                                <p>No user data available.</p>
                            ) : (
                                <ul className="p-0" style={{ listStyleType: "none" }}>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Seller Id:</strong> {userData.id}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Name:</strong> {userData.fname} {userData.lname}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Phone:</strong> {userData.phone}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Email:</strong> {userData.email}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Shipping Volume:</strong> {userData.shippingVolume}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2">
                                        <strong>Pricing Plan:</strong>
                                        {userData.pricingPlanId === 1
                                            ? "Bronze"
                                            : userData.pricingPlanId === 2
                                                ? "Silver"
                                                : userData.pricingPlanId === 3
                                                    ? "Gold"
                                                    : userData.pricingPlanId === 4
                                                        ? "Platinum"
                                                        : "Custom"}
                                    </li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Signup Date:</strong> {formatDateTime(userData.createdAt)}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Website:</strong> {userData.website}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Company Name:</strong> {userData.companyName}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Address:</strong> {userData.companyAddress}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>City:</strong> {userData.companyCity}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>State:</strong> {userData.companyState}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Pincode:</strong> {userData.companyPincode}</li>
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* ---------------- KYC Details ---------------- */}
                    <div className="col-12 col-md-6">
                        <div className="card p-3 mb-3 border">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <Icon path={mdiCreditCardScanOutline} size={0.9} />
                                <h5 className="card-title mb-0">KYC Details</h5>

                                {userKycData?.status === "approved" ? (
                                    <div className="badge badge-opacity-success ms-2">Approved</div>
                                ) : userKycData?.status === "rejected" ? (
                                    <div className="badge badge-opacity-danger ms-2">Rejected</div>
                                ) : userKycData?.status === "pending" ?
                                    <div className="badge badge-opacity-warning ms-2">Pending</div> : null
                                }
                            </div>

                            {
                                !kycDataLoading && userKycData?.remarks && userKycData?.status === "rejected" && (
                                    <div className="alert alert-warning mb-2"><strong>KYC Remarks: </strong>{userKycData?.remarks}</div>
                                )
                            }

                            {kycDataLoading ? (
                                <Skeleton />
                            ) : !userKycData ? (
                                <p>No KYC data available.</p>
                            ) : (
                                <ul className="p-0 m-0" style={{ listStyleType: "none" }}>

                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>KYC Type:</strong> {userKycData.kycType?.toUpperCase()}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>PAN Number:</strong> {userKycData.panCardNumber}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Name on PAN:</strong> {userKycData.nameOnPanCard}</li>

                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Document:</strong> {userKycData.documentType}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Document ID:</strong> {userKycData.documentId}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>Name on Document:</strong> {userKycData.nameOnDocument}</li>

                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>GST Number:</strong> {userKycData.gstNumber}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>GST Name:</strong> {userKycData.gstName}</li>
                                    <li className="d-flex justify-content-between border-bottom py-2"><strong>COI Number:</strong> {userKycData.coiNumber}</li>

                                    {/* IMAGES */}
                                    <li className="d-flex justify-content-between border-bottom py-2">
                                        <strong>PAN Image:</strong>
                                        <img height={100} width={100} src={imgBase + (userKycData.panCardImage?.[0] || "")} alt="" />
                                    </li>

                                    <li className="d-flex justify-content-between border-bottom py-2">
                                        <strong>Document Front:</strong>
                                        <img height={100} width={100} src={imgBase + (userKycData.documentFrontImage?.[0] || "")} alt="" />
                                    </li>

                                    <li className="d-flex justify-content-between border-bottom py-2">
                                        <strong>Document Back:</strong>
                                        <img height={100} width={100} src={imgBase + (userKycData.documentBackImage?.[0] || "")} alt="" />
                                    </li>

                                    {userKycData.partnershipDeedImage?.[0] && (
                                        <li className="d-flex justify-content-between border-bottom py-2">
                                            <strong>Partnership Deed:</strong>
                                            <img height={100} width={100} src={imgBase + userKycData.partnershipDeedImage[0]} alt="" />
                                        </li>
                                    )}

                                    {/* ACTION BUTTONS */}
                                    {userKycData.status === "pending" && (
                                        <li className="d-flex justify-content-end py-2 mt-2">
                                            <button
                                                className="btn btn-light btn-md py-2 px-4 me-2"
                                                onClick={() => setModalData({ id: userKycData.userId, action: "reject" })}
                                            >
                                                Reject
                                            </button>

                                            <button
                                                className="btn btn-dark btn-md py-2 px-4"
                                                onClick={() => setModalData({ id: userKycData.userId, action: "approve" })}
                                            >
                                                Approve
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="card p-3 mb-3 border">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <Icon path={mdiAccountBoxOutline} size={0.9} />
                                <h5 className="card-title mb-0">Remittance</h5>
                            </div>

                            {userDataLoading || remitLoading ? (
                                <Skeleton />
                            ) : !userData ? (
                                <p>No user data available.</p>
                            ) : (
                                <ul className="p-0" style={{ listStyleType: "none" }}>
                                    <li className="d-flex justify-content-between align-items-center border-bottom py-2">
                                        <strong>Remittance Cycle:</strong>

                                        {!isEditingRemit ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <span>{userData.seller_remit_cycle || "-"}</span>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setIsEditingRemit(true)}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={remitCycle}
                                                    onChange={(e) => setRemitCycle(e.target.value)}
                                                    disabled={remitLoading}
                                                    style={{ width: 160 }}
                                                />

                                                <button
                                                    className="btn btn-sm btn-dark"
                                                    disabled={remitLoading}
                                                    onClick={handleRemittanceCycle}
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    disabled={remitLoading}
                                                    onClick={() => {
                                                        setRemitCycle(userData.seller_remit_cycle);
                                                        setIsEditingRemit(false);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>



                </div>
            </div>

            {/* Approve/Reject Modal */}
            {modalData && (
                <ApproveRejectModal
                    userId={modalData.id}
                    action={modalData.action}
                    onClose={(refresh) => {
                        setModalData(null);
                        if (refresh) handleUserKycData();
                    }}
                />
            )}
        </>
    );
}

export default UserView;
