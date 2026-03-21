import React from 'react'
import { Outlet } from 'react-router-dom'
import "../../../../assets/Billing/codremittance.css"

function Remittance() {
    return (
        <>
        <div className="page-header">
            <div>
                <div className="page-eyebrow">Billing · Payout Ledger</div>
                <h1 className="page-title">COD Remittance</h1>
                <p className="page-subtitle">Cash-on-delivery payouts, cycle tracking &amp; early settlement requests</p>
            </div>
            <div className="page-header-right">
                <button className="btn btn-ghost">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
                </button>
                <button className="btn btn-ghost">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Date Range
                </button>
                <button className="btn btn-primary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Request Early COD
                </button>
            </div>
        </div>
        <div className="kpi-strip">
        <div className="kpi-card">
            <div className="kpi-card-accent" style="background: linear-gradient(90deg, var(--mercury), var(--uranus));"></div>
            <div className="kpi-label">Total COD Collected</div>
            <div className="kpi-value">₹1,80,000</div>
            <div className="kpi-sub">Across all shipments</div>
            <div className="kpi-icon-bg" style="color:var(--mercury);">COD</div>
        </div>
        <div className="kpi-card">
            <div className="kpi-card-accent" style="background: linear-gradient(90deg, var(--venus), #48d984);"></div>
            <div className="kpi-label">Remittance Paid</div>
            <div className="kpi-value venus-val">₹1,56,230</div>
            <div className="kpi-sub">Successfully transferred</div>
            <div className="kpi-icon-bg" style="color:var(--venus);">PAID</div>
        </div>
        <div className="kpi-card">
            <div className="kpi-card-accent" style="background: linear-gradient(90deg, var(--gold), #ffd580);"></div>
            <div className="kpi-label">Early COD Available</div>
            <div className="kpi-value gold-val">₹12,540</div>
            <div className="kpi-sub">Eligible for early payout</div>
            <div className="kpi-icon-bg" style="color:var(--gold);">FAST</div>
        </div>
        <div className="kpi-card">
            <div className="kpi-card-accent" style="background: linear-gradient(90deg, var(--uranus), var(--mercury));"></div>
            <div className="kpi-label">Remittance Cycle</div>
            <div className="kpi-value cycle-val">7 Days</div>
            <div className="kpi-sub">Next payout: Mar 20, 2026</div>
            <div className="kpi-icon-bg" style="color:var(--uranus);">7D</div>
        </div>
        </div>
        <div className="early-cod-banner">
        <div className="banner-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div>
            <div className="banner-title">Early COD Settlement Available</div>
            <div className="banner-sub">₹12,540 is eligible for instant payout. Standard cycle resumes March 20, 2026. A 0.5% processing fee applies.</div>
        </div>
        <div className="banner-cta">
            <button className="btn" style="background:var(--gold-dim);color:#fff;box-shadow:0 4px 12px rgba(200,131,14,0.3); height:34px; font-size:0.78rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Claim Early Payout →
            </button>
        </div>
        </div>
        <div className="summary-strip">
        <div className="sum-item">
            <div className="sum-label">Total Collected</div>
            <div className="sum-val">₹ 1,80,000.00</div>
        </div>
        <div className="sum-divider"></div>
        <div className="sum-item">
            <div className="sum-label">Total Remitted</div>
            <div className="sum-val paid-val">₹ 1,56,230.00</div>
        </div>
        <div className="sum-divider"></div>
        <div className="sum-item">
            <div className="sum-label">Pending Payout</div>
            <div className="sum-val pending-val">₹ 11,230.45</div>
        </div>
        <div className="sum-divider"></div>
        <div className="sum-item">
            <div className="sum-label">Remittance Cycle</div>
            <div className="sum-val cycle-val">7 Days</div>
        </div>
        <div className="sum-badge">
            <span className="sum-badge-pill">2 entries · Dec 2025</span>
        </div>
        </div>
        <div className="filters-bar">
        <div className="search-wrap">
            <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" className="search-input" placeholder="Search by Transaction ID or UTR…"/>
        </div>
        <div className="filter-divider"></div>
        <select className="filter-select">
            <option>All Statuses</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Failed</option>
        </select>
        <select className="filter-select">
            <option>All Months</option>
            <option>March 2026</option>
            <option>February 2026</option>
            <option>January 2026</option>
            <option>December 2025</option>
        </select>
        <div className="filter-divider"></div>
        <button className="btn btn-ghost" style="height:34px; font-size:0.75rem; padding:0 0.875rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter
        </button>
        </div>
        <div className="mt-3">
            <Outlet />
        </div>
    </>
    )
}
export default Remittance
