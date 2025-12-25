import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDateTime } from "../../../middleware/CommonFunctions";
import api from "../../../utils/api";
import SupportConfig from "../../../config/AdminConfig/Support/SupportConfig";
import SupportConversation from "./SupportConversation";

function SupportView() {
    const { id } = useParams();
    const [escalationData, setEscalationData] = useState({});
    const [conversationData, setConversationData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`${SupportConfig.support}/${id}`);
            const resData = response?.data?.data?.result?.[0] || {};
            setEscalationData(resData);
            handleFetchConversation(resData.id);
        } catch (error) {
            console.error("Error fetching orders:", error);
            return {};
        } finally {
            setLoading(false);
        }
    };
    const handleFetchConversation = async (escalation_id) => {
        try {
            const response = await api.get(
                `${SupportConfig.conversations}?escalation_id=${escalation_id}`
            );
            const resData = response?.data?.data?.result || [];
            setConversationData(resData);
        } catch (error) {
            console.error("Error fetching orders:", error);
            return {};
        }
    };
    useEffect(() => {
        handleFetchData();
    }, [id]);
    if (loading) {
        return (
            <div className="dot-opacity-loader">
                <span></span>
                <span></span>
                <span></span>
            </div>
        );
    }
    return (
        <>
            <h4>
                #{escalationData?.id || ""} - {escalationData?.type || ""}
            </h4>
            <hr />
            <div className="row">
                <div className="col-md-8">
                    <div className="row">
                        {conversationData?.length > 0 && (
                            <>
                                <div className="col-md-12">
                                    <ul className="list-group mt-3">
                                        {conversationData?.length > 0 ? (
                                            conversationData.map((item) => (
                                                <li key={item.id} className="list-group-item">
                                                    <div className="row g-2 align-items-center ">
                                                        <div>
                                                            <b>{item?.to || ""}</b>{" "}
                                                            {item?.updatedAt
                                                                ? formatDateTime(item?.updatedAt)
                                                                : ""}
                                                        </div>
                                                        <div>{item?.message || ""}</div>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <></>
                                        )}
                                    </ul>
                                </div>
                            </>
                        )}

                        <div className="col-md-12">
                            <SupportConversation
                                escalationId={escalationData.id}
                                handleFetchConversation={handleFetchConversation}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card card-rounded mt-3 bg-light">
                        <div className="card-body ">
                            <h4 className="card-title card-title-dash  mb-2">
                                Escalation Status
                            </h4>
                            <div>
                                Raised at:{" "}
                                <b>
                                    {escalationData?.createdAt
                                        ? formatDateTime(escalationData?.createdAt)
                                        : ""}
                                </b>
                            </div>
                            <div>
                                Status : <b>Status</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SupportView
