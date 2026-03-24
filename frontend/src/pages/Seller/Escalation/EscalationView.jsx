import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../utils/api";
import { formatDateTime } from "../../../middleware/CommonFunctions";
import ConversationsForm from "./ConversationsForm";
import escalationConfig from "../../../config/Escalation/EscalationConfig";

function EscalationView() {
  const { id } = useParams();

  const [escalationData, setEscalationData] = useState({});
  const [conversationData, setConversationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${escalationConfig.escalationApi}/${id}`);
      const resData = response?.data?.data?.result?.[0] || {};
      setEscalationData(resData);
      handleFetchConversation(resData.id);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchConversation = async (escalation_id) => {
    try {
      const response = await api.get(
        `${escalationConfig.conversationsApi}?escalation_id=${escalation_id}`
      );
      setConversationData(response?.data?.data?.result || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [id]);

  if (loading) return <div className="loader">Loading...</div>;
  console.log("Escalation Data", escalationData);
  console.log("Conversation Data", conversationData);
  return (
    <div className="content">
      <div className="pg-hdr">
        <div className="pg-eye">Support · Ticket Management</div>
        <div className="pg-title">Escalation</div>
      </div>
      <div className="ticket-bar">
        <div className="tb-left">
          <div className="ticket-id-badge">
            #TKT-{escalationData?.id}
          </div>
          <div className="ticket-title">
            {escalationData?.type}
          </div>
        </div>

        <div className="tb-right">
          <div className="pri-badge pb-h">High</div>
          <div className="status-badge st-open">Open</div>
        </div>
      </div>
      <div className="detail-layout">
        <div className="conv-card">
          <div className="conv-hdr">
            <div>
              <div className="conv-hdr-title">Conversation</div>
              <div className="conv-hdr-count">
                {conversationData.length} messages
              </div>
            </div>
          </div>
          <div className="thread">
            {conversationData.map((item) => {
              const isSupport = item.to !== "seller";
              return (
                  <div
                    key={item.id}
                    className={`msg ${isSupport ? "support" : "seller"}`}
                  >
                  <div
                    className={`msg-avatar ${
                      isSupport ? "av-support" : "av-seller"
                    }`}
                  >
                    {isSupport ? "SP" : "SL"}
                  </div>
                  <div className="msg-body">
                    <div className="msg-meta">
                      <div className="msg-sender">
                        {item.to || "User"}
                      </div>
                      <div className="msg-time">
                        {formatDateTime(item.updatedAt)}
                      </div>
                    </div>
                    <div
                      className={`msg-bubble ${
                        isSupport
                          ? "bubble-support"
                          : "bubble-seller"
                      }`}
                    >
                      {item.message}
                    </div>
                    {item.attachments && (
                      <div className="msg-attachment">
                        📎 Attachment
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="remark-box">
            <ConversationsForm
              escalationId={escalationData.id}
              handleFetchConversation={handleFetchConversation}
            />
          </div>
        </div>
        <div>
          <div className="status-card">
          <div className="sc-hdr">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M6.5 3.5v3.5l2 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            Escalation Status
          </div>
          <div className="sc-body">
            <div className="sc-row">
              <div className="sc-key">Ticket ID</div>
              <div className="sc-val mono blue">TKT-#{escalationData.id}</div>
            </div>
            <div className="sc-sep"></div>
            <div className="sc-row">
              <div className="sc-key">Raised At</div>
              <div className="sc-val">{formatDateTime(escalationData.createdAt)}</div>
            </div>
            <div className="sc-sep"></div>
            <div className="sc-row">
              <div className="sc-key">Type</div>
              <div className="sc-val">{escalationData.type}</div>
            </div>
            <div className="sc-sep"></div>
            <div className="sc-row">
              <div className="sc-key">Subject</div>
              <div className="sc-val">{escalationData.query}</div>
            </div>
            <div className="sc-sep"></div>
            <div className="sc-row">
              <div className="sc-key">Priority</div>
              <div className="sc-val"><span style={{display:"inline-flex",alignItems:"center",gap:".3rem",color:"#C8830E",fontWeight:"700"}}><span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#F5A623",display:"inline-block"}}></span>High</span></div>
            </div>
            <div className="sc-sep"></div>
            <div className="sc-row">
              <div className="sc-key">Status</div>
              <div className="sc-val"><span style={{display:"inline-flex",alignItems:"center",gap:".3rem",color:"#E8630A",fontWeight:"700"}}><span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#E8630A",display:"inline-block",animation:"pulse 1.8s ease-in-out infinite"}}></span>{escalationData.status}</span></div>
            </div>
            <div className="sc-sep"></div>
            <div className="sc-row">
              <div className="sc-key">Response SLA</div>
              <div className="sc-val" style={{color:"#2D8A4E",fontWeight:"700"}}>Within 2 Hours</div>
            </div>
            <div className="sc-sep"></div>
            <div className="sc-row">
              <div className="sc-key">Last Updated</div>
              <div className="sc-val">{escalationData.updatedAt}</div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EscalationView;