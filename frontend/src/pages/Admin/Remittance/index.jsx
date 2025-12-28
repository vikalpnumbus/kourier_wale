import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

function Remittance() {
    const navData = [
        {
            id: "payable",
            path: "payable",
            title: "Seller Payable",
            icon: "ti-user text-danger me-2",
        },
        {
            id: "seller",
            path: "seller",
            title: "Remittance Seller",
            icon: "ti-home text-info me-2",
        },
    ];
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Detect active tab from URL
    const activeTab =
        navData.find((tab) =>
            pathname.includes(`/remittance/${tab.path}`)
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
                            Remittance
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
                                <div className="row mt-3">
                                    <div className="col-12">
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
            </div>
        </div>
        // <div className="row">
        //     <div className="col-md-12 grid-margin stretch-card d-md-flex">
        //         <div className="card">
        //             <div className="card-body">
        //                 <div className="row">
        //                     <div className="col-md-4">
        //                         <h4 className="card-title">Remittance
        //                         </h4>
        //                     </div>
        //                 </div>
        //                 <div className="row mt-3">
        //                     <div className="col-12">
        //                         <div className="tab-content tab-content-vertical">
        //                             <div className="tab-pane fade show active" role="tabpanel">
        //                                 <Outlet />
        //                             </div>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>
    )
}

export default Remittance
