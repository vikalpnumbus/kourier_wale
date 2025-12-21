import { Outlet, useNavigate, useLocation } from "react-router-dom";

const navData = [
    {
        id: "upload",
        path: "upload",
        title: "Upload Weights",
        icon: "ti-user text-danger me-2",
    },
    {
        id: "manage",
        path: "manage",
        title: "Manage Weights",
        icon: "ti-home text-info me-2",
    },
];

function Profile() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Detect active tab from URL
    const activeTab =
        navData.find((tab) =>
            pathname.includes(`/weight/${tab.path}`)
        ) || navData[0];

    const handleTabClick = (tab) => {
        if (activeTab.id !== tab.id) {
            navigate(tab.path);
        }
    };

    return (
        <div className="row">
            <div className="col-md-12 grid-margin stretch-card d-md-flex">
                <div className="card">
                    <div className="card-body">

                        {/* Header */}
                        <h4 className="card-title">
                            Weight Reconciliation
                        </h4>

                        <div className="row">
                            <div className="col-md-12 col-sm-12">
                                <ul className="nav nav-tabs nav-tabs-horizontal" role="tablist">
                                    {navData.map((tab) => (
                                        <li className="nav-item" key={tab.id}>
                                            <button
                                                type="button"
                                                className={`nav-link w-100 text-start ${activeTab.id === tab.id ? "active" : ""
                                                    }`}
                                                onClick={() => handleTabClick(tab)}
                                            >
                                                {/* <i className={tab.icon}></i> */}
                                                {tab.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <Outlet />

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
