import React, { useEffect, useState } from 'react';
import { formatDateTime } from '../../../middleware/CommonFunctions';
import ShipmentConfig from '../../../config/AdminConfig/Shipment/ShipmentConfig';
import api from '../../../utils/api';
import RemittanceConfig from '../../../config/AdminConfig/Remittance/RemittanceConfig';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../../middleware/AlertContext';


function RemittanceAwbListModal({ onClose, awbList }) {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAwb, setSelectedAwb] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { showError, showSuccess } = useAlert();

    const handleFetchAwbData = async () => {
        setLoading(true);
        try {
            const url = `${ShipmentConfig.shippingListApi}?awb_number=${awbList}`;
            const { data } = await api.get(url);
            let awbData = data?.data?.result || [];
            awbData = awbData.filter(
                (item) => item?.remittance_status?.toLowerCase() !== 'paid'
            );
            setDataList(awbData);
        } catch (error) {
            setDataList([]);
            console.error("Fetch orders error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetchAwbData();
    }, [awbList]);


    const handleCheckboxChange = (awb) => {
        setSelectedAwb((prev) =>
            prev.includes(awb)
                ? prev.filter((item) => item !== awb)
                : [...prev, awb]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allAwb = dataList.map((item) => item.awb_number);
            setSelectedAwb(allAwb);
        } else {
            setSelectedAwb([]);
        }
    };

    const handleCreateRemittance = async () => {
        if (selectedAwb.length === 0) {
            alert("Please select at least one AWB");
            return;
        }

        setSubmitting(true);
        try {
            await api.post(RemittanceConfig.remittanceCreateApi, {
                awb_numbers: selectedAwb.join(',')
            });
            showSuccess('Remittance created successfully');
            navigate('/admin/remittance/seller');
            setSelectedAwb([]);
            onClose();
        } catch (error) {
            console.error('Create remittance error:', error);
            showError('Failed to create remittance');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="modal fade show modal-lg"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-xl"
                role="document"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">

                    {/* Header */}
                    <div className="modal-header py-2">
                        <h5 className="modal-title">AWB List</h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span>×</span>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="table-responsive" style={{ maxHeight: "50vh" }}>
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={
                                                dataList.length > 0 &&
                                                selectedAwb.length === dataList.length
                                            }
                                        />
                                    </th>
                                    <th>Shipment Date</th>
                                    <th>Courier Name</th>
                                    <th>AWB Number</th>
                                    <th>Amount</th>
                                    <th>Delivered Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            <div className="dot-opacity-loader">
                                                <span></span><span></span><span></span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : dataList.length > 0 ? (
                                    dataList.map((data) => (
                                        <tr key={data.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAwb.includes(data.awb_number)}
                                                    onChange={() =>
                                                        handleCheckboxChange(data.awb_number)
                                                    }
                                                />
                                            </td>
                                            <td>{data?.createdAt ? formatDateTime(data.createdAt) : ""}</td>
                                            <td>{data?.courier_name || ""}</td>
                                            <td>{data?.awb_number || ""}</td>
                                            <td>{data?.collectableAmount || ""}</td>
                                            <td>
                                                {data?.delivered_date
                                                    ? formatDateTime(data.delivered_date)
                                                    : ""}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            No records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer py-2">
                        {/* <button
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Close
                        </button> */}
                        <button
                            className="btn btn-dark"
                            onClick={handleCreateRemittance}
                            disabled={submitting || selectedAwb.length === 0}
                        >
                            {submitting ? 'Creating...' : 'Create Remittance'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default RemittanceAwbListModal;
