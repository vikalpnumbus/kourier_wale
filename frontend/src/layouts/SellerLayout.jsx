import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../Component/Navbar";
import Sidebar from "../Component/Sidebar";

function SellerLayout({ children }) {
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
              <Navbar
                setSideNavActive={setSideNavActive}
                sideNavActive={sideNavActive}
              />
              <Sidebar
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

export default SellerLayout;

