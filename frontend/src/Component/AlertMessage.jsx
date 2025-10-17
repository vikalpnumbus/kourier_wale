import React, { useEffect } from "react";
import Icon from "@mdi/react";
import { mdiClose } from "@mdi/js";

const AlertMessage = ({ messages, setMessages }) => {
  useEffect(() => {
    const timers = [];

    ["error", "success"].forEach((type) => {
      if (messages[type]) {
        const timer = setTimeout(() => {
          setMessages((m) => ({ ...m, [type]: "" }));
        }, 5000); // 5 seconds
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [messages, setMessages]);

  return (
    <>
      {["error", "success"].map((type) =>
        messages[type] ? (
          <div
            key={type}
            className={`alert alert-${
              type === "error" ? "danger" : "success"
            } d-flex justify-content-between align-items-center`}
          >
            <span>{messages[type]}</span>
            <Icon
              style={{ cursor: "pointer" }}
              path={mdiClose}
              size={0.7}
              onClick={() => setMessages((m) => ({ ...m, [type]: "" }))}
            />
          </div>
        ) : null
      )}
    </>
  );
};

export default AlertMessage;
