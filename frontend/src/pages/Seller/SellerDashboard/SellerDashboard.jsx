import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import DashStats from './DashStats';
import DateRange from '../../../Component/DateRange';
import { getLastNDaysRange } from '../../../middleware/CommonFunctions';
import CourierWiseLoad from './CourierWiseLoad';
import CourierWise from './CourierWise';
import TopDestinationStats from './TopDestinationStats';
import PaymentModeWise from './PaymentModeWise';

function SellerDashboard() {
    const navigate = useNavigate();
    const [defaultStart, defaultEnd] = useMemo(() => getLastNDaysRange(7), [window.location.search]);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return null;
        }
    }, []);
    return (
        <>
            <div className="row">
                <div className="col-sm-12">
                    <div className="home-tab">
                        <div className="tab-content tab-content-basic">
                            <div
                                className="tab-pane fade show active"
                                id="overview"
                                role="tabpanel"
                                aria-labelledby="overview"
                            >
                                <div className='row'>
                                    <div className="col-md-3 mb-3">
                                        <DateRange />
                                    </div>
                                </div>
                                <DashStats defaultStart={defaultStart} defaultEnd={defaultEnd} />
                                <CourierWise defaultStart={defaultStart} defaultEnd={defaultEnd} />
                                <div className="row">
                                    <TopDestinationStats defaultStart={defaultStart} defaultEnd={defaultEnd} />
                                    <PaymentModeWise defaultStart={defaultStart} defaultEnd={defaultEnd} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SellerDashboard
