import { Outlet } from "react-router-dom";
import "../../../assets/wallettransaction/wallettransaction.css";

function WalletTransaction() {
    return (
        <div className="layout">
            <div className="page-header">
                <div>
                    <div className="page-eyebrow">Billing</div>
                    <div className="page-title">Wallet History</div>
                    <div className="page-subtitle">
                        All credits, debits and balance movements.
                    </div>
                </div>

                <div className="page-hdr-right">
                    <button className="btn btn-ghost">
                        Export CSV
                    </button>

                    <button className="btn btn-primary">
                        Add Money
                    </button>
                </div>
            </div>

            {/* WALLET HERO CARD */}
            <div className="wallet-hero">
                <div className="wh-balance-block">
                    <div className="wh-lbl">Available Balance</div>

                    <div className="wh-balance">
                        <div className="wh-currency">₹</div>
                        <div className="wh-amount">10,53,613</div>
                    </div>

                    <div className="wh-amount-sub">
                        Live balance · Updated now
                    </div>
                </div>

                <div className="wh-v-div"></div>

                <div className="wh-stats">
                    <div className="wh-stat">
                        <div className="wh-stat-val">₹ 4,800</div>
                        <div className="wh-stat-lbl">Credits</div>
                    </div>

                    <div className="wh-stat">
                        <div className="wh-stat-val">₹ 3,24,218</div>
                        <div className="wh-stat-lbl">Debits</div>
                    </div>

                    <div className="wh-stat">
                        <div className="wh-stat-val">38</div>
                        <div className="wh-stat-lbl">Transactions</div>
                    </div>
                </div>

                <div className="wh-spacer"></div>

                <div className="wh-cta">
                    <button className="wh-recharge-btn">
                        Add Money
                    </button>
                </div>
            </div>
            <div className="filters-bar">
                <div className="search-wrap">
                    <input
                        type="text"
                        className="search-inp"
                        placeholder="Search transactions..."
                    />
                </div>
                <div className="type-pills">
                    <button className="tp-btn active-all">All</button>
                    <button className="tp-btn">Credit</button>
                    <button className="tp-btn">Debit</button>
                </div>
                <div className="f-spacer"></div>
                <button className="btn btn-ghost btn-sm">
                    Export
                </button>
            </div>
            <div className="mt-3">
                <Outlet />
            </div>

        </div>
    );
}
export default WalletTransaction;