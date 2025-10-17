import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAlert } from "../middleware/AlertContext";
import { decrypt } from "../middleware/Encryption";

function ProtectedRoute({ element, allowedRole }) {
  const storedRole = localStorage.getItem("role");
  const role = storedRole ? decrypt(storedRole) : null;
  const { showError } = useAlert();
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    if (!role) {
      localStorage.clear();
      setRedirect("/login");
      return;
    }

    if (role === allowedRole) {
      setRedirect(null); 
      return;
    }

    const redirectPath =
      role === "admin" ? "/admin" : role === "user" ? "/" : "/login";

    showError("You are not authorized to access this page");
    setRedirect(redirectPath);
  }, [role, allowedRole]);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  if (role && role === allowedRole) {
    return element;
  }

  return null;
}

export default ProtectedRoute;
