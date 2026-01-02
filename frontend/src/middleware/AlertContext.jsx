import React, { createContext, useContext, useState, useCallback } from "react";
import AlertMessage from "../Component/AlertMessage";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [messages, setMessages] = useState({ error: "", success: "" });

  const showError = useCallback((msg) => {
    setMessages({ error: msg, success: "" });
  }, []);

  const showSuccess = useCallback((msg) => {
    setMessages({ error: "", success: msg });
  }, []);

  return (
    <AlertContext.Provider value={{ showError, showSuccess }}>
      {/* render your alerts globally */}
      <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 9999, minWidth: "300px", width: "60%" }}>
        <AlertMessage messages={messages} setMessages={setMessages} />
      </div>

      {children}
    </AlertContext.Provider>
  );
};
