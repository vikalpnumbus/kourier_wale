import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminNavbar from "../Component/AdminNavbar";
import AdminSidebar from "../Component/AdminSidebar";
function AdminLayout({ children }) {
  const [sideNavActive, setSideNavActive] = useState(false);
  const location = useLocation();

  const isAuthPage = useMemo(() => {
    const authPaths = [
      "/login",
      "/register",
      "/otp",
      "/forgot-password",
      "/reset-password",
    ];
    return authPaths.some((path) => location.pathname.includes(path));
  }, [location.pathname]);
  return (
    <>
      <div className="container-scroller">
        <div className={`container-fluid page-body-wrapper `}>
          {!isAuthPage && (
            <>
              <AdminNavbar
                setSideNavActive={setSideNavActive}
                sideNavActive={sideNavActive}
              />
              <AdminSidebar
                sideNavActive={sideNavActive}
                setSideNavActive={setSideNavActive}
              />
            </>
          )}
          <div className={`main-panel`}>
            <div className={`content-wrapper p-4`}>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLayout;
