import { Outlet, useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const navData = [
    {
      id: "kyc",
      path: "kyc",
      title: "KYC",
      icon: "ti-user text-danger me-2",
    },
    {
      id: "bank",
      path: "bank",
      title: "Bank Details",
      icon: "ti-home text-info me-2",
    },
    {
      id: "company",
      path: "company",
      title: "Company Details",
      icon: "ti-email text-success me-2",
    },
  ];
  const activeTab =
    navData.find((tab) => location.pathname.includes(`/profile/${tab.path}`)) ||
    navData[0];
  const handleTabClick = (tab) => {
    if (activeTab?.id !== tab?.id) navigate(tab.path);
  };
  return (
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card d-md-flex">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Profile - {activeTab.title}</h4>
            <div className="row">
              <div className="col-md-2 col-sm-4">
                <ul className="nav nav-tabs nav-tabs-vertical" role="tablist">
                  {navData?.map((tab) => {
                    return (
                      <li
                        className="nav-item"
                        onClick={() => handleTabClick(tab)}
                        key={tab.id}
                      >
                        <button
                          className={`nav-link w-100 text-start ${
                            activeTab?.id === tab?.id ? "active" : ""
                          }`}
                        >
                          <i className={tab.icon}></i>
                          {tab?.title}
                          
                        </button>
                      </li>
                    );
                  })}
                  {/* <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link w-100 text-start ${
                            activeTab === "home" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("home")}
                          role="tab"
                        >
                          Home
                          <i className="ti-home text-info ms-2"></i>
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link w-100 text-start ${
                            activeTab === "profile" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("profile")}
                          role="tab"
                        >
                          Profile
                          <i className="ti-user text-danger ms-2"></i>
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link w-100 text-start ${
                            activeTab === "contact" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("contact")}
                          role="tab"
                        >
                          Reach
                          <i className="ti-email text-success ms-2"></i>
                        </button>
                      </li> */}
                </ul>
              </div>

              {/* Right side Tab Content */}
              <div className="col-md-10 col-sm-12">
                <div className="tab-content tab-content-vertical">
                  <div className="tab-pane fade show active" role="tabpanel">
                    <Outlet />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
