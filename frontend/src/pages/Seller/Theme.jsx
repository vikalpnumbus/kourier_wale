import React from "react";

function Theme() {
  return (
    <>
      <body className="with-welcome-text">
        <div className="container-scroller">
          <div className="row p-0 m-0 proBanner" id="proBanner">
            <div className="col-md-12 p-0 m-0">
              <div className="card-body card-body-padding px-3 d-flex align-items-center justify-content-between">
                <div className="ps-lg-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="mb-0 fw-medium me-3 buy-now-text">
                      Free 24/7 customer support, updates, and more with this
                      template!
                    </p>
                    <a
                      href="https://www.bootstrapdash.com/product/star-admin-pro/"
                      target="_blank"
                      className="btn me-2 buy-now-btn border-0"
                    >
                      Buy Now
                    </a>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <a href="https://www.bootstrapdash.com/product/star-admin-pro/">
                    <i className="ti-home me-3 text-white"></i>
                  </a>
                  <button id="bannerClose" className="btn border-0 p-0">
                    <i className="ti-close text-white"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <nav className="navbar default-layout col-lg-12 col-12 p-0 fixed-top d-flex align-items-top flex-row">
            <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-start">
              <div className="me-3">
                <button
                  className="navbar-toggler navbar-toggler align-self-center"
                  type="button"
                  data-bs-toggle="minimize"
                >
                  <span className="icon-menu"></span>
                </button>
              </div>
              <div>
                <a className="navbar-brand brand-logo" href="index.html">
                  <img src="../assets/images/logo.svg" alt="logo" />
                </a>
                <a className="navbar-brand brand-logo-mini" href="index.html">
                  <img src="../assets/images/logo-mini.svg" alt="logo" />
                </a>
              </div>
            </div>
            <div className="navbar-menu-wrapper d-flex align-items-top">
              <ul className="navbar-nav">
                <li className="nav-item fw-semibold d-none d-lg-block ms-0">
                  <h1 className="welcome-text">
                    Good Morning,{" "}
                    <span className="text-black fw-bold">John Doe</span>
                  </h1>
                  <h3 className="welcome-sub-text">
                    Your performance summary this week{" "}
                  </h3>
                </li>
              </ul>
              <ul className="navbar-nav ms-auto">
                <li className="nav-item dropdown d-none d-lg-block">
                  <a
                    className="nav-link dropdown-bordered dropdown-toggle dropdown-toggle-split"
                    id="messageDropdown"
                    href="#"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {" "}
                    Select Category{" "}
                  </a>
                  <div
                    className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list pb-0"
                    aria-labelledby="messageDropdown"
                  >
                    <a className="dropdown-item py-3">
                      <p className="mb-0 fw-medium float-start">
                        Select category
                      </p>
                    </a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item preview-item">
                      <div className="preview-item-content flex-grow py-2">
                        <p className="preview-subject ellipsis fw-medium text-dark">
                          Bootstrap Bundle{" "}
                        </p>
                        <p className="fw-light small-text mb-0">
                          This is a Bundle featuring 16 unique dashboards
                        </p>
                      </div>
                    </a>
                    <a className="dropdown-item preview-item">
                      <div className="preview-item-content flex-grow py-2">
                        <p className="preview-subject ellipsis fw-medium text-dark">
                          Angular Bundle
                        </p>
                        <p className="fw-light small-text mb-0">
                          Everything you’ll ever need for your Angular projects
                        </p>
                      </div>
                    </a>
                    <a className="dropdown-item preview-item">
                      <div className="preview-item-content flex-grow py-2">
                        <p className="preview-subject ellipsis fw-medium text-dark">
                          VUE Bundle
                        </p>
                        <p className="fw-light small-text mb-0">
                          Bundle of 6 Premium Vue Admin Dashboard
                        </p>
                      </div>
                    </a>
                    <a className="dropdown-item preview-item">
                      <div className="preview-item-content flex-grow py-2">
                        <p className="preview-subject ellipsis fw-medium text-dark">
                          React Bundle
                        </p>
                        <p className="fw-light small-text mb-0">
                          Bundle of 8 Premium React Admin Dashboard
                        </p>
                      </div>
                    </a>
                  </div>
                </li>
                <li className="nav-item d-none d-lg-block">
                  <div
                    id="datepicker-popup"
                    className="input-group date datepicker navbar-date-picker"
                  >
                    <span className="input-group-addon input-group-prepend border-right">
                      <span className="icon-calendar input-group-text calendar-icon"></span>
                    </span>
                    <input type="text" className="form-control" />
                  </div>
                </li>
                <li className="nav-item">
                  <form className="search-form" action="#">
                    <i className="icon-search"></i>
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search Here"
                      title="Search here"
                    />
                  </form>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link count-indicator"
                    id="notificationDropdown"
                    href="#"
                    data-bs-toggle="dropdown"
                  >
                    <i className="icon-bell"></i>
                    <span className="count"></span>
                  </a>
                  <div
                    className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list pb-0"
                    aria-labelledby="notificationDropdown"
                  >
                    <a className="dropdown-item py-3 border-bottom">
                      <p className="mb-0 fw-medium float-start">
                        You have 4 new notifications{" "}
                      </p>
                      <span className="badge badge-pill badge-primary float-end">
                        View all
                      </span>
                    </a>
                    <a className="dropdown-item preview-item py-3">
                      <div className="preview-thumbnail">
                        <i className="mdi mdi-alert m-auto text-primary"></i>
                      </div>
                      <div className="preview-item-content">
                        <h6 className="preview-subject fw-normal text-dark mb-1">
                          Application Error
                        </h6>
                        <p className="fw-light small-text mb-0"> Just now </p>
                      </div>
                    </a>
                    <a className="dropdown-item preview-item py-3">
                      <div className="preview-thumbnail">
                        <i className="mdi mdi-lock-outline m-auto text-primary"></i>
                      </div>
                      <div className="preview-item-content">
                        <h6 className="preview-subject fw-normal text-dark mb-1">
                          Settings
                        </h6>
                        <p className="fw-light small-text mb-0">
                          {" "}
                          Private message{" "}
                        </p>
                      </div>
                    </a>
                    <a className="dropdown-item preview-item py-3">
                      <div className="preview-thumbnail">
                        <i className="mdi mdi-airballoon m-auto text-primary"></i>
                      </div>
                      <div className="preview-item-content">
                        <h6 className="preview-subject fw-normal text-dark mb-1">
                          New user registration
                        </h6>
                        <p className="fw-light small-text mb-0"> 2 days ago </p>
                      </div>
                    </a>
                  </div>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link count-indicator"
                    id="countDropdown"
                    href="#"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="icon-mail icon-lg"></i>
                  </a>
                  <div
                    className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list pb-0"
                    aria-labelledby="countDropdown"
                  >
                    <a className="dropdown-item py-3">
                      <p className="mb-0 fw-medium float-start">
                        You have 7 unread mails{" "}
                      </p>
                      <span className="badge badge-pill badge-primary float-end">
                        View all
                      </span>
                    </a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item preview-item">
                      <div className="preview-thumbnail">
                        <img
                          src="../assets/images/faces/face10.jpg"
                          alt="image"
                          className="img-sm profile-pic"
                        />
                      </div>
                      <div className="preview-item-content flex-grow py-2">
                        <p className="preview-subject ellipsis fw-medium text-dark">
                          Marian Garner{" "}
                        </p>
                        <p className="fw-light small-text mb-0">
                          {" "}
                          The meeting is cancelled{" "}
                        </p>
                      </div>
                    </a>
                    <a className="dropdown-item preview-item">
                      <div className="preview-thumbnail">
                        <img
                          src="../assets/images/faces/face12.jpg"
                          alt="image"
                          className="img-sm profile-pic"
                        />
                      </div>
                      <div className="preview-item-content flex-grow py-2">
                        <p className="preview-subject ellipsis fw-medium text-dark">
                          David Grey{" "}
                        </p>
                        <p className="fw-light small-text mb-0">
                          {" "}
                          The meeting is cancelled{" "}
                        </p>
                      </div>
                    </a>
                    <a className="dropdown-item preview-item">
                      <div className="preview-thumbnail">
                        <img
                          src="../assets/images/faces/face1.jpg"
                          alt="image"
                          className="img-sm profile-pic"
                        />
                      </div>
                      <div className="preview-item-content flex-grow py-2">
                        <p className="preview-subject ellipsis fw-medium text-dark">
                          Travis Jenkins{" "}
                        </p>
                        <p className="fw-light small-text mb-0">
                          {" "}
                          The meeting is cancelled{" "}
                        </p>
                      </div>
                    </a>
                  </div>
                </li>
                <li className="nav-item dropdown d-none d-lg-block user-dropdown">
                  <a
                    className="nav-link"
                    id="UserDropdown"
                    href="#"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      className="img-xs rounded-circle"
                      src="../assets/images/faces/face8.jpg"
                      alt="Profile image"
                    />{" "}
                  </a>
                  <div
                    className="dropdown-menu dropdown-menu-right navbar-dropdown"
                    aria-labelledby="UserDropdown"
                  >
                    <div className="dropdown-header text-center">
                      <img
                        className="img-md rounded-circle"
                        src="../assets/images/faces/face8.jpg"
                        alt="Profile image"
                      />
                      <p className="mb-1 mt-3 fw-semibold">Allen Moreno</p>
                      <p className="fw-light text-muted mb-0">
                        allenmoreno@gmail.com
                      </p>
                    </div>
                    <a className="dropdown-item">
                      <i className="dropdown-item-icon mdi mdi-account-outline text-primary me-2"></i>{" "}
                      My Profile{" "}
                      <span className="badge badge-pill badge-danger">1</span>
                    </a>
                    <a className="dropdown-item">
                      <i className="dropdown-item-icon mdi mdi-message-text-outline text-primary me-2"></i>
                      Messages
                    </a>
                    <a className="dropdown-item">
                      <i className="dropdown-item-icon mdi mdi-calendar-check-outline text-primary me-2"></i>
                      Activity
                    </a>
                    <a className="dropdown-item">
                      <i className="dropdown-item-icon mdi mdi-help-circle-outline text-primary me-2"></i>
                      FAQ
                    </a>
                    <a className="dropdown-item">
                      <i className="dropdown-item-icon mdi mdi-power text-primary me-2"></i>
                      Sign Out
                    </a>
                  </div>
                </li>
              </ul>
              <button
                className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
                type="button"
                data-bs-toggle="offcanvas"
              >
                <span className="mdi mdi-menu"></span>
              </button>
            </div>
          </nav>
          <div className="container-fluid page-body-wrapper">
            <div className="theme-setting-wrapper">
              <div id="settings-trigger">
                <i className="ti-settings"></i>
              </div>
              <div id="theme-settings" className="settings-panel">
                <i className="settings-close ti-close"></i>
                <p className="settings-heading">SIDEBAR SKINS</p>
                <div
                  className="sidebar-bg-options selected"
                  id="sidebar-light-theme"
                >
                  <div className="img-ss rounded-circle bg-light border me-3"></div>
                  Light
                </div>
                <div className="sidebar-bg-options" id="sidebar-dark-theme">
                  <div className="img-ss rounded-circle bg-dark border me-3"></div>
                  Dark
                </div>
                <p className="settings-heading mt-2">HEADER SKINS</p>
                <div className="color-tiles mx-0 px-4">
                  <div className="tiles success"></div>
                  <div className="tiles warning"></div>
                  <div className="tiles danger"></div>
                  <div className="tiles info"></div>
                  <div className="tiles dark"></div>
                  <div className="tiles default"></div>
                </div>
              </div>
            </div>
            <div id="right-sidebar" className="settings-panel">
              <i className="settings-close ti-close"></i>
              <ul
                className="nav nav-tabs border-top"
                id="setting-panel"
                role="tablist"
              >
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    id="todo-tab"
                    data-bs-toggle="tab"
                    href="#todo-section"
                    role="tab"
                    aria-controls="todo-section"
                    aria-expanded="true"
                  >
                    TO DO LIST
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    id="chats-tab"
                    data-bs-toggle="tab"
                    href="#chats-section"
                    role="tab"
                    aria-controls="chats-section"
                  >
                    CHATS
                  </a>
                </li>
              </ul>
              <div className="tab-content" id="setting-content">
                <div
                  className="tab-pane fade show active scroll-wrapper"
                  id="todo-section"
                  role="tabpanel"
                  aria-labelledby="todo-section"
                >
                  <div className="add-items d-flex px-3 mb-0">
                    <form className="form w-100">
                      <div className="form-group d-flex">
                        <input
                          type="text"
                          className="form-control todo-list-input"
                          placeholder="Add To-do"
                        />
                        <button
                          type="submit"
                          className="add btn btn-primary todo-list-add-btn"
                          id="add-task"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="list-wrapper px-3">
                    <ul className="d-flex flex-column-reverse todo-list">
                      <li>
                        <div className="form-check">
                          <label className="form-check-label">
                            <input className="checkbox" type="checkbox" />
                            Team review meeting at 3.00 PM
                          </label>
                        </div>
                        <i className="remove ti-close"></i>
                      </li>
                      <li>
                        <div className="form-check">
                          <label className="form-check-label">
                            <input className="checkbox" type="checkbox" />
                            Prepare for presentation
                          </label>
                        </div>
                        <i className="remove ti-close"></i>
                      </li>
                      <li>
                        <div className="form-check">
                          <label className="form-check-label">
                            <input className="checkbox" type="checkbox" />
                            Resolve all the low priority tickets due today
                          </label>
                        </div>
                        <i className="remove ti-close"></i>
                      </li>
                      <li className="completed">
                        <div className="form-check">
                          <label className="form-check-label">
                            <input
                              className="checkbox"
                              type="checkbox"
                              checked
                            />
                            Schedule meeting for next week
                          </label>
                        </div>
                        <i className="remove ti-close"></i>
                      </li>
                      <li className="completed">
                        <div className="form-check">
                          <label className="form-check-label">
                            <input
                              className="checkbox"
                              type="checkbox"
                              checked
                            />
                            Project review
                          </label>
                        </div>
                        <i className="remove ti-close"></i>
                      </li>
                    </ul>
                  </div>
                  <h4 className="px-3 text-muted mt-5 fw-light mb-0">Events</h4>
                  <div className="events pt-4 px-3">
                    <div className="wrapper d-flex mb-2">
                      <i className="ti-control-record text-primary me-2"></i>
                      <span>Feb 11 2018</span>
                    </div>
                    <p className="mb-0 fw-thin text-gray">
                      Creating component page build a js
                    </p>
                    <p className="text-gray mb-0">
                      The total number of sessions
                    </p>
                  </div>
                  <div className="events pt-4 px-3">
                    <div className="wrapper d-flex mb-2">
                      <i className="ti-control-record text-primary me-2"></i>
                      <span>Feb 7 2018</span>
                    </div>
                    <p className="mb-0 fw-thin text-gray">Meeting with Alisa</p>
                    <p className="text-gray mb-0 ">Call Sarah Graves</p>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="chats-section"
                  role="tabpanel"
                  aria-labelledby="chats-section"
                >
                  <div className="d-flex align-items-center justify-content-between border-bottom">
                    <p className="settings-heading border-top-0 mb-3 pl-3 pt-0 border-bottom-0 pb-0">
                      Friends
                    </p>
                    <small className="settings-heading border-top-0 mb-3 pt-0 border-bottom-0 pb-0 pr-3 fw-normal">
                      See All
                    </small>
                  </div>
                  <ul className="chat-list">
                    <li className="list active">
                      <div className="profile">
                        <img
                          src="../assets/images/faces/face1.jpg"
                          alt="image"
                        />
                        <span className="online"></span>
                      </div>
                      <div className="info">
                        <p>Thomas Douglas</p>
                        <p>Available</p>
                      </div>
                      <small className="text-muted my-auto">19 min</small>
                    </li>
                    <li className="list">
                      <div className="profile">
                        <img
                          src="../assets/images/faces/face2.jpg"
                          alt="image"
                        />
                        <span className="offline"></span>
                      </div>
                      <div className="info">
                        <div className="wrapper d-flex">
                          <p>Catherine</p>
                        </div>
                        <p>Away</p>
                      </div>
                      <div className="badge badge-success badge-pill my-auto mx-2">
                        4
                      </div>
                      <small className="text-muted my-auto">23 min</small>
                    </li>
                    <li className="list">
                      <div className="profile">
                        <img
                          src="../assets/images/faces/face3.jpg"
                          alt="image"
                        />
                        <span className="online"></span>
                      </div>
                      <div className="info">
                        <p>Daniel Russell</p>
                        <p>Available</p>
                      </div>
                      <small className="text-muted my-auto">14 min</small>
                    </li>
                    <li className="list">
                      <div className="profile">
                        <img
                          src="../assets/images/faces/face4.jpg"
                          alt="image"
                        />
                        <span className="offline"></span>
                      </div>
                      <div className="info">
                        <p>James Richardson</p>
                        <p>Away</p>
                      </div>
                      <small className="text-muted my-auto">2 min</small>
                    </li>
                    <li className="list">
                      <div className="profile">
                        <img
                          src="../assets/images/faces/face5.jpg"
                          alt="image"
                        />
                        <span className="online"></span>
                      </div>
                      <div className="info">
                        <p>Madeline Kennedy</p>
                        <p>Available</p>
                      </div>
                      <small className="text-muted my-auto">5 min</small>
                    </li>
                    <li className="list">
                      <div className="profile">
                        <img
                          src="../assets/images/faces/face6.jpg"
                          alt="image"
                        />
                        <span className="online"></span>
                      </div>
                      <div className="info">
                        <p>Sarah Graves</p>
                        <p>Available</p>
                      </div>
                      <small className="text-muted my-auto">47 min</small>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <nav className="sidebar sidebar-offcanvas" id="sidebar">
              <ul className="nav">
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#dashboards"
                    aria-expanded="false"
                    aria-controls="dashboards"
                  >
                    <i className="mdi mdi-grid-large menu-icon"></i>
                    <span className="menu-title">Dashboard</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="dashboards">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a className="nav-link active" href="index.html">
                          Default
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/dashboards/crm.html"
                        >
                          CRM
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/dashboards/purple.html"
                        >
                          Purple
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/dashboards/sales.html"
                        >
                          Sale
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/dashboards/hr.html"
                        >
                          HR
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/dashboards/analytics.html"
                        >
                          Analytics
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/dashboards/modern.html"
                        >
                          Modern
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/dashboards/ecommerce.html"
                        >
                          E-commerce
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="./pages/widgets/widgets.html">
                    <i className="mdi mdi-book menu-icon"></i>
                    <span className="menu-title">Widgets</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="./pages/page-layouts/rtl.html">
                    <i className="mdi mdi-cube-outline menu-icon"></i>
                    <span className="menu-title">RTL</span>
                  </a>
                </li>
                <li className="nav-item nav-category">UI Elements</li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#ui-basic"
                    aria-expanded="false"
                    aria-controls="ui-basic"
                  >
                    <i className="menu-icon mdi mdi-floor-plan"></i>
                    <span className="menu-title">UI Elements</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="ui-basic">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/accordions.html"
                        >
                          Accordions
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/buttons.html"
                        >
                          Buttons
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/badges.html"
                        >
                          Badges
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/breadcrumbs.html"
                        >
                          Breadcrumbs
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/dropdowns.html"
                        >
                          Dropdowns
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/modals.html"
                        >
                          Modals
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/progress.html"
                        >
                          Progress bar
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/pagination.html"
                        >
                          Pagination
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/tabs.html"
                        >
                          Tabs
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/typography.html"
                        >
                          Typography
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/tooltips.html"
                        >
                          Tooltips
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#ui-advanced"
                    aria-expanded="false"
                    aria-controls="ui-advanced"
                  >
                    <i className="menu-icon mdi mdi-arrow-down-drop-circle-outline"></i>
                    <span className="menu-title">Advanced UI</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="ui-advanced">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/dragula.html"
                        >
                          Dragula
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/clipboard.html"
                        >
                          Clipboard
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/context-menu.html"
                        >
                          Context menu
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/slider.html"
                        >
                          Sliders
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/carousel.html"
                        >
                          Carousel
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/colcade.html"
                        >
                          Colcade
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/ui-features/loaders.html"
                        >
                          Loaders
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item nav-category">Forms and Datas</li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#form-elements"
                    aria-expanded="false"
                    aria-controls="form-elements"
                  >
                    <i className="menu-icon mdi mdi-card-text-outline"></i>
                    <span className="menu-title">Form elements</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="form-elements">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          href="./pages/forms/basic_elements.html"
                        >
                          Basic Elements
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          href="./pages/forms/advanced_elements.html"
                        >
                          Advanced Elements
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          href="./pages/forms/validation.html"
                        >
                          Validation
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          href="./pages/forms/wizard.html"
                        >
                          Wizard
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#editors"
                    aria-expanded="false"
                    aria-controls="editors"
                  >
                    <i className="menu-icon mdi mdi-code-braces"></i>
                    <span className="menu-title">Editors</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="editors">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          href="./pages/forms/text_editor.html"
                        >
                          Text editors
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          href="./pages/forms/code_editor.html"
                        >
                          Code editors
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#charts"
                    aria-expanded="false"
                    aria-controls="charts"
                  >
                    <i className="menu-icon mdi mdi-chart-line"></i>
                    <span className="menu-title">Charts</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="charts">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/charts/chartjs.html"
                        >
                          ChartJs
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/charts/morris.html"
                        >
                          Morris
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/charts/flot-chart.html"
                        >
                          Flot
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/charts/google-charts.html"
                        >
                          Google charts
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/charts/sparkline.html"
                        >
                          Sparkline js
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a className="nav-link" href="./pages/charts/c3.html">
                          C3 charts
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/charts/chartist.html"
                        >
                          Chartists
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/charts/justGage.html"
                        >
                          JustGage
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#tables"
                    aria-expanded="false"
                    aria-controls="tables"
                  >
                    <i className="menu-icon mdi mdi-table"></i>
                    <span className="menu-title">Tables</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="tables">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/tables/basic-table.html"
                        >
                          Basic table
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/tables/data-table.html"
                        >
                          Data table
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/tables/js-grid.html"
                        >
                          Js-grid
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/tables/sortable-table.html"
                        >
                          Sortable table
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="./pages/ui-features/popups.html"
                  >
                    <i className="menu-icon mdi mdi-alert-outline"></i>
                    <span className="menu-title">Popups</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="./pages/ui-features/notifications.html"
                  >
                    <i className="menu-icon mdi mdi-bell-alert-outline"></i>
                    <span className="menu-title">Notifications</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#icons"
                    aria-expanded="false"
                    aria-controls="icons"
                  >
                    <i className="menu-icon mdi mdi-layers-outline"></i>
                    <span className="menu-title">Icons</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="icons">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/icons/flag-icons.html"
                        >
                          Flag icons
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a className="nav-link" href="./pages/icons/mdi.html">
                          Mdi icons
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/icons/font-awesome.html"
                        >
                          Font Awesome
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/icons/simple-line-icon.html"
                        >
                          Simple line icons
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/icons/themify.html"
                        >
                          Themify icons
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#maps"
                    aria-expanded="false"
                    aria-controls="maps"
                  >
                    <i className="menu-icon mdi mdi-google-maps"></i>
                    <span className="menu-title">Maps</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="maps">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a className="nav-link" href="./pages/maps/mapael.html">
                          Mapael
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/maps/vector-map.html"
                        >
                          Vector Map
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/maps/google-maps.html"
                        >
                          Google Map
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item nav-category">pages</li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#auth"
                    aria-expanded="false"
                    aria-controls="auth"
                  >
                    <i className="menu-icon mdi mdi-account-circle-outline"></i>
                    <span className="menu-title">User Pages</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="auth">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/login.html"
                        >
                          {" "}
                          Login{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/login-2.html"
                        >
                          {" "}
                          Login 2{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/register.html"
                        >
                          {" "}
                          Register{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/register-2.html"
                        >
                          {" "}
                          Register 2{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/lock-screen.html"
                        >
                          {" "}
                          Lockscreen{" "}
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#error"
                    aria-expanded="false"
                    aria-controls="error"
                  >
                    <i className="menu-icon mdi mdi-stop-circle-outline"></i>
                    <span className="menu-title">Error pages</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="error">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/error-404.html"
                        >
                          {" "}
                          404{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/error-500.html"
                        >
                          {" "}
                          500{" "}
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#general-pages"
                    aria-expanded="false"
                    aria-controls="general-pages"
                  >
                    <i className="menu-icon mdi mdi-book-open"></i>
                    <span className="menu-title">General Pages</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="general-pages">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/blank-page.html"
                        >
                          {" "}
                          Blank Page{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/profile.html"
                        >
                          {" "}
                          Profile{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a className="nav-link" href="./pages/samples/faq.html">
                          {" "}
                          FAQ{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/faq-2.html"
                        >
                          {" "}
                          FAQ 2{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/news-grid.html"
                        >
                          {" "}
                          News grid{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/timeline.html"
                        >
                          {" "}
                          Timeline{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/search-results.html"
                        >
                          {" "}
                          Search Results{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/portfolio.html"
                        >
                          {" "}
                          Portfolio{" "}
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    href="#e-commerce"
                    aria-expanded="false"
                    aria-controls="e-commerce"
                  >
                    <i className="menu-icon mdi mdi-cart-arrow-down"></i>
                    <span className="menu-title">E-commerce</span>
                    <i className="menu-arrow"></i>
                  </a>
                  <div className="collapse" id="e-commerce">
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/invoice.html"
                        >
                          {" "}
                          Invoice{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/pricing-table.html"
                        >
                          {" "}
                          Pricing Table{" "}
                        </a>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <a
                          className="nav-link"
                          href="./pages/samples/orders.html"
                        >
                          {" "}
                          Orders{" "}
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item nav-category">Apps</li>
                <li className="nav-item">
                  <a className="nav-link" href="./pages/apps/email.html">
                    <i className="menu-icon mdi mdi-email-outline"></i>
                    <span className="menu-title">E-mail</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="./pages/apps/calendar.html">
                    <i className="menu-icon mdi mdi-calendar"></i>
                    <span className="menu-title">Calendar</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="./pages/apps/todo.html">
                    <i className="menu-icon mdi mdi-format-list-bulleted"></i>
                    <span className="menu-title">Todo List</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="./pages/apps/gallery.html">
                    <i className="menu-icon mdi mdi-file-image-outline"></i>
                    <span className="menu-title">Gallery</span>
                  </a>
                </li>
                <li className="nav-item nav-category">help</li>
                <li className="nav-item">
                  <a className="nav-link" href="../../docs/documentation.html">
                    <i className="menu-icon mdi mdi-file-document"></i>
                    <span className="menu-title">Documentation</span>
                  </a>
                </li>
              </ul>
            </nav>
            <div className="main-panel">
              <div className="content-wrapper">
                <div className="row">
                  <div className="col-sm-12">
                    <div className="home-tab">
                      <div className="d-sm-flex align-items-center justify-content-between border-bottom">
                        <ul className="nav nav-tabs" role="tablist">
                          <li className="nav-item">
                            <a
                              className="nav-link active ps-0"
                              id="home-tab"
                              data-bs-toggle="tab"
                              href="#overview"
                              role="tab"
                              aria-controls="overview"
                              aria-selected="true"
                            >
                              Overview
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className="nav-link"
                              id="profile-tab"
                              data-bs-toggle="tab"
                              href="#audiences"
                              role="tab"
                              aria-selected="false"
                            >
                              Audiences
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className="nav-link"
                              id="contact-tab"
                              data-bs-toggle="tab"
                              href="#demographics"
                              role="tab"
                              aria-selected="false"
                            >
                              Demographics
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className="nav-link border-0"
                              id="more-tab"
                              data-bs-toggle="tab"
                              href="#more"
                              role="tab"
                              aria-selected="false"
                            >
                              More
                            </a>
                          </li>
                        </ul>
                        <div>
                          <div className="btn-wrapper">
                            <a
                              href="#"
                              className="btn btn-otline-dark align-items-center"
                            >
                              <i className="icon-share"></i> Share
                            </a>
                            <a href="#" className="btn btn-otline-dark">
                              <i className="icon-printer"></i> Print
                            </a>
                            <a
                              href="#"
                              className="btn btn-primary text-white me-0"
                            >
                              <i className="icon-download"></i> Export
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="tab-content tab-content-basic">
                        <div
                          className="tab-pane fade show active"
                          id="overview"
                          role="tabpanel"
                          aria-labelledby="overview"
                        >
                          <div className="row">
                            <div className="col-sm-12">
                              <div className="statistics-details d-flex align-items-center justify-content-between">
                                <div>
                                  <p className="statistics-title">
                                    Bounce Rate
                                  </p>
                                  <h3 className="rate-percentage">32.53%</h3>
                                  <p className="text-danger d-flex">
                                    <i className="mdi mdi-menu-down"></i>
                                    <span>-0.5%</span>
                                  </p>
                                </div>
                                <div>
                                  <p className="statistics-title">Page Views</p>
                                  <h3 className="rate-percentage">7,682</h3>
                                  <p className="text-success d-flex">
                                    <i className="mdi mdi-menu-up"></i>
                                    <span>+0.1%</span>
                                  </p>
                                </div>
                                <div>
                                  <p className="statistics-title">
                                    New Sessions
                                  </p>
                                  <h3 className="rate-percentage">68.8</h3>
                                  <p className="text-danger d-flex">
                                    <i className="mdi mdi-menu-down"></i>
                                    <span>68.8</span>
                                  </p>
                                </div>
                                <div className="d-none d-md-block">
                                  <p className="statistics-title">
                                    Avg. Time on Site
                                  </p>
                                  <h3 className="rate-percentage">2m:35s</h3>
                                  <p className="text-success d-flex">
                                    <i className="mdi mdi-menu-down"></i>
                                    <span>+0.8%</span>
                                  </p>
                                </div>
                                <div className="d-none d-md-block">
                                  <p className="statistics-title">
                                    New Sessions
                                  </p>
                                  <h3 className="rate-percentage">68.8</h3>
                                  <p className="text-danger d-flex">
                                    <i className="mdi mdi-menu-down"></i>
                                    <span>68.8</span>
                                  </p>
                                </div>
                                <div className="d-none d-md-block">
                                  <p className="statistics-title">
                                    Avg. Time on Site
                                  </p>
                                  <h3 className="rate-percentage">2m:35s</h3>
                                  <p className="text-success d-flex">
                                    <i className="mdi mdi-menu-down"></i>
                                    <span>+0.8%</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-8 d-flex flex-column">
                              <div className="row flex-grow">
                                <div className="col-12 col-lg-4 col-lg-12 grid-margin stretch-card">
                                  <div className="card card-rounded">
                                    <div className="card-body">
                                      <div className="d-sm-flex justify-content-between align-items-start">
                                        <div>
                                          <h4 className="card-title card-title-dash">
                                            Performance Line Chart
                                          </h4>
                                          <h5 className="card-subtitle card-subtitle-dash">
                                            Lorem Ipsum is simply dummy text of
                                            the printing
                                          </h5>
                                        </div>
                                        <div id="performanceLine-legend"></div>
                                      </div>
                                      <div className="chartjs-wrapper mt-4">
                                        <canvas
                                          id="performanceLine"
                                          width=""
                                        ></canvas>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 d-flex flex-column">
                              <div className="row flex-grow">
                                <div className="col-md-6 col-lg-12 grid-margin stretch-card">
                                  <div className="card bg-primary card-rounded">
                                    <div className="card-body pb-0">
                                      <h4 className="card-title card-title-dash text-white mb-4">
                                        Status Summary
                                      </h4>
                                      <div className="row">
                                        <div className="col-sm-4">
                                          <p className="status-summary-ight-white mb-1">
                                            Closed Value
                                          </p>
                                          <h2 className="text-info">357</h2>
                                        </div>
                                        <div className="col-sm-8">
                                          <div className="status-summary-chart-wrapper pb-4">
                                            <canvas id="status-summary"></canvas>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6 col-lg-12 grid-margin stretch-card">
                                  <div className="card card-rounded">
                                    <div className="card-body">
                                      <div className="row">
                                        <div className="col-lg-6">
                                          <div className="d-flex justify-content-between align-items-center mb-2 mb-sm-0">
                                            <div className="circle-progress-width">
                                              <div
                                                id="totalVisitors"
                                                className="progressbar-js-circle pr-2"
                                              ></div>
                                            </div>
                                            <div>
                                              <p className="text-small mb-2">
                                                Total Visitors
                                              </p>
                                              <h4 className="mb-0 fw-bold">
                                                26.80%
                                              </h4>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-lg-6">
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div className="circle-progress-width">
                                              <div
                                                id="visitperday"
                                                className="progressbar-js-circle pr-2"
                                              ></div>
                                            </div>
                                            <div>
                                              <p className="text-small mb-2">
                                                Visits per day
                                              </p>
                                              <h4 className="mb-0 fw-bold">
                                                9065
                                              </h4>
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
                          <div className="row">
                            <div className="col-lg-8 d-flex flex-column">
                              <div className="row flex-grow">
                                <div className="col-12 grid-margin stretch-card">
                                  <div className="card card-rounded">
                                    <div className="card-body">
                                      <div className="d-sm-flex justify-content-between align-items-start">
                                        <div>
                                          <h4 className="card-title card-title-dash">
                                            Market Overview
                                          </h4>
                                          <p className="card-subtitle card-subtitle-dash">
                                            Lorem ipsum dolor sit amet
                                            consectetur adipisicing elit
                                          </p>
                                        </div>
                                        <div>
                                          <div className="dropdown">
                                            <button
                                              className="btn btn-light dropdown-toggle toggle-dark btn-lg mb-0 me-0"
                                              type="button"
                                              id="dropdownMenuButton2"
                                              data-bs-toggle="dropdown"
                                              aria-haspopup="true"
                                              aria-expanded="false"
                                            >
                                              {" "}
                                              This month{" "}
                                            </button>
                                            <div
                                              className="dropdown-menu"
                                              aria-labelledby="dropdownMenuButton2"
                                            >
                                              <h6 className="dropdown-header">
                                                Settings
                                              </h6>
                                              <a
                                                className="dropdown-item"
                                                href="#"
                                              >
                                                Action
                                              </a>
                                              <a
                                                className="dropdown-item"
                                                href="#"
                                              >
                                                Another action
                                              </a>
                                              <a
                                                className="dropdown-item"
                                                href="#"
                                              >
                                                Something else here
                                              </a>
                                              <div className="dropdown-divider"></div>
                                              <a
                                                className="dropdown-item"
                                                href="#"
                                              >
                                                Separated link
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="d-sm-flex align-items-center mt-1 justify-content-between">
                                        <div className="d-sm-flex align-items-center mt-4 justify-content-between">
                                          <h2 className="me-2 fw-bold">
                                            $36,2531.00
                                          </h2>
                                          <h4 className="me-2">USD</h4>
                                          <h4 className="text-success">
                                            (+1.37%)
                                          </h4>
                                        </div>
                                        <div className="me-3">
                                          <div id="marketingOverview-legend"></div>
                                        </div>
                                      </div>
                                      <div className="chartjs-bar-wrapper mt-3">
                                        <canvas id="marketingOverview"></canvas>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row flex-grow">
                                <div className="col-12 grid-margin stretch-card">
                                  <div className="card card-rounded table-darkBGImg">
                                    <div className="card-body">
                                      <div className="col-sm-8">
                                        <h3 className="text-white upgrade-info mb-0">
                                          Enhance your{" "}
                                          <span className="fw-bold">
                                            Campaign
                                          </span>{" "}
                                          for better outreach
                                        </h3>
                                        <a
                                          href="#"
                                          className="btn btn-info upgrade-btn"
                                        >
                                          Upgrade Account!
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row flex-grow">
                                <div className="col-12 grid-margin stretch-card">
                                  <div className="card card-rounded">
                                    <div className="card-body">
                                      <div className="d-sm-flex justify-content-between align-items-start">
                                        <div>
                                          <h4 className="card-title card-title-dash">
                                            Pending Requests
                                          </h4>
                                          <p className="card-subtitle card-subtitle-dash">
                                            You have 50+ new requests
                                          </p>
                                        </div>
                                        <div>
                                          <button
                                            className="btn btn-primary btn-lg text-white mb-0 me-0"
                                            type="button"
                                          >
                                            <i className="mdi mdi-account-plus"></i>
                                            Add new member
                                          </button>
                                        </div>
                                      </div>
                                      <div className="table-responsive  mt-1">
                                        <table className="table select-table">
                                          <thead>
                                            <tr>
                                              <th>
                                                <div className="form-check form-check-flat mt-0">
                                                  <label className="form-check-label">
                                                    <input
                                                      type="checkbox"
                                                      className="form-check-input"
                                                      aria-checked="false"
                                                      id="check-all"
                                                    />
                                                    <i className="input-helper"></i>
                                                  </label>
                                                </div>
                                              </th>
                                              <th>Customer</th>
                                              <th>Company</th>
                                              <th>Progress</th>
                                              <th>Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              <td>
                                                <div className="form-check form-check-flat mt-0">
                                                  <label className="form-check-label">
                                                    <input
                                                      type="checkbox"
                                                      className="form-check-input"
                                                      aria-checked="false"
                                                    />
                                                    <i className="input-helper"></i>
                                                  </label>
                                                </div>
                                              </td>
                                              <td>
                                                <div className="d-flex ">
                                                  <img
                                                    src="../assets/images/faces/face1.jpg"
                                                    alt=""
                                                  />
                                                  <div>
                                                    <h6>Brandon Washington</h6>
                                                    <p>Head admin</p>
                                                  </div>
                                                </div>
                                              </td>
                                              <td>
                                                <h6>Company name 1</h6>
                                                <p>company type</p>
                                              </td>
                                              <td>
                                                <div>
                                                  <div className="d-flex justify-content-between align-items-center mb-1 max-width-progress-wrap">
                                                    <p className="text-success">
                                                      79%
                                                    </p>
                                                    <p>85/162</p>
                                                  </div>
                                                  <div className="progress progress-md">
                                                    <div
                                                      className="progress-bar bg-success"
                                                      role="progressbar"
                                                      style={{ width: "85%" }}
                                                      aria-valuenow="25"
                                                      aria-valuemin="0"
                                                      aria-valuemax="100"
                                                    ></div>
                                                  </div>
                                                </div>
                                              </td>
                                              <td>
                                                <div className="badge badge-opacity-warning">
                                                  In progress
                                                </div>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <div className="form-check form-check-flat mt-0">
                                                  <label className="form-check-label">
                                                    <input
                                                      type="checkbox"
                                                      className="form-check-input"
                                                      aria-checked="false"
                                                    />
                                                    <i className="input-helper"></i>
                                                  </label>
                                                </div>
                                              </td>
                                              <td>
                                                <div className="d-flex">
                                                  <img
                                                    src="../assets/images/faces/face2.jpg"
                                                    alt=""
                                                  />
                                                  <div>
                                                    <h6>Laura Brooks</h6>
                                                    <p>Head admin</p>
                                                  </div>
                                                </div>
                                              </td>
                                              <td>
                                                <h6>Company name 1</h6>
                                                <p>company type</p>
                                              </td>
                                              <td>
                                                <div>
                                                  <div className="d-flex justify-content-between align-items-center mb-1 max-width-progress-wrap">
                                                    <p className="text-success">
                                                      65%
                                                    </p>
                                                    <p>85/162</p>
                                                  </div>
                                                  <div className="progress progress-md">
                                                    <div
                                                      className="progress-bar bg-success"
                                                      role="progressbar"
                                                      style={{ width: "65%" }}
                                                      aria-valuenow="65"
                                                      aria-valuemin="0"
                                                      aria-valuemax="100"
                                                    ></div>
                                                  </div>
                                                </div>
                                              </td>
                                              <td>
                                                <div className="badge badge-opacity-warning">
                                                  In progress
                                                </div>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <div className="form-check form-check-flat mt-0">
                                                  <label className="form-check-label">
                                                    <input
                                                      type="checkbox"
                                                      className="form-check-input"
                                                      aria-checked="false"
                                                    />
                                                    <i className="input-helper"></i>
                                                  </label>
                                                </div>
                                              </td>
                                              <td>
                                                <div className="d-flex">
                                                  <img
                                                    src="../assets/images/faces/face3.jpg"
                                                    alt=""
                                                  />
                                                  <div>
                                                    <h6>Wayne Murphy</h6>
                                                    <p>Head admin</p>
                                                  </div>
                                                </div>
                                              </td>
                                              <td>
                                                <h6>Company name 1</h6>
                                                <p>company type</p>
                                              </td>
                                              <td>
                                                <div>
                                                  <div className="d-flex justify-content-between align-items-center mb-1 max-width-progress-wrap">
                                                    <p className="text-success">
                                                      65%
                                                    </p>
                                                    <p>85/162</p>
                                                  </div>
                                                  <div className="progress progress-md">
                                                    <div
                                                      className="progress-bar bg-warning"
                                                      role="progressbar"
                                                      style={{ width: "38%" }}
                                                      aria-valuenow="38"
                                                      aria-valuemin="0"
                                                      aria-valuemax="100"
                                                    ></div>
                                                  </div>
                                                </div>
                                              </td>
                                              <td>
                                                <div className="badge badge-opacity-warning">
                                                  In progress
                                                </div>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <div className="form-check form-check-flat mt-0">
                                                  <label className="form-check-label">
                                                    <input
                                                      type="checkbox"
                                                      className="form-check-input"
                                                      aria-checked="false"
                                                    />
                                                    <i className="input-helper"></i>
                                                  </label>
                                                </div>
                                              </td>
                                              <td>
                                                <div className="d-flex">
                                                  <img
                                                    src="../assets/images/faces/face4.jpg"
                                                    alt=""
                                                  />
                                                  <div>
                                                    <h6>Matthew Bailey</h6>
                                                    <p>Head admin</p>
                                                  </div>
                                                </div>
                                              </td>
                                              <td>
                                                <h6>Company name 1</h6>
                                                <p>company type</p>
                                              </td>
                                              <td>
                                                <div>
                                                  <div className="d-flex justify-content-between align-items-center mb-1 max-width-progress-wrap">
                                                    <p className="text-success">
                                                      65%
                                                    </p>
                                                    <p>85/162</p>
                                                  </div>
                                                  <div className="progress progress-md">
                                                    <div
                                                      className="progress-bar bg-danger"
                                                      role="progressbar"
                                                      style={{ width: "15%" }}
                                                      aria-valuenow="15"
                                                      aria-valuemin="0"
                                                      aria-valuemax="100"
                                                    ></div>
                                                  </div>
                                                </div>
                                              </td>
                                              <td>
                                                <div className="badge badge-opacity-danger">
                                                  Pending
                                                </div>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <div className="form-check form-check-flat mt-0">
                                                  <label className="form-check-label">
                                                    <input
                                                      type="checkbox"
                                                      className="form-check-input"
                                                      aria-checked="false"
                                                    />
                                                    <i className="input-helper"></i>
                                                  </label>
                                                </div>
                                              </td>
                                              <td>
                                                <div className="d-flex">
                                                  <img
                                                    src="../assets/images/faces/face5.jpg"
                                                    alt=""
                                                  />
                                                  <div>
                                                    <h6>Katherine Butler</h6>
                                                    <p>Head admin</p>
                                                  </div>
                                                </div>
                                              </td>
                                              <td>
                                                <h6>Company name 1</h6>
                                                <p>company type</p>
                                              </td>
                                              <td>
                                                <div>
                                                  <div className="d-flex justify-content-between align-items-center mb-1 max-width-progress-wrap">
                                                    <p className="text-success">
                                                      65%
                                                    </p>
                                                    <p>85/162</p>
                                                  </div>
                                                  <div className="progress progress-md">
                                                    <div
                                                      className="progress-bar bg-success"
                                                      role="progressbar"
                                                      style={{ width: "65%" }}
                                                      aria-valuenow="65"
                                                      aria-valuemin="0"
                                                      aria-valuemax="100"
                                                    ></div>
                                                  </div>
                                                </div>
                                              </td>
                                              <td>
                                                <div className="badge badge-opacity-success">
                                                  Completed
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row flex-grow">
                                <div className="col-md-6 col-lg-6 grid-margin stretch-card">
                                  <div className="card card-rounded">
                                    <div className="card-body card-rounded">
                                      <h4 className="card-title  card-title-dash">
                                        Recent Events
                                      </h4>
                                      <div className="list align-items-center border-bottom py-2">
                                        <div className="wrapper w-100">
                                          <p className="mb-2 fw-medium">
                                            Change in Directors
                                          </p>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                              <i className="mdi mdi-calendar text-muted me-1"></i>
                                              <p className="mb-0 text-small text-muted">
                                                Mar 14, 2019
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="list align-items-center border-bottom py-2">
                                        <div className="wrapper w-100">
                                          <p className="mb-2 fw-medium">
                                            Other Events
                                          </p>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                              <i className="mdi mdi-calendar text-muted me-1"></i>
                                              <p className="mb-0 text-small text-muted">
                                                Mar 14, 2019
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="list align-items-center border-bottom py-2">
                                        <div className="wrapper w-100">
                                          <p className="mb-2 fw-medium">
                                            Quarterly Report
                                          </p>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                              <i className="mdi mdi-calendar text-muted me-1"></i>
                                              <p className="mb-0 text-small text-muted">
                                                Mar 14, 2019
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="list align-items-center border-bottom py-2">
                                        <div className="wrapper w-100">
                                          <p className="mb-2 fw-medium">
                                            Change in Directors
                                          </p>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                              <i className="mdi mdi-calendar text-muted me-1"></i>
                                              <p className="mb-0 text-small text-muted">
                                                Mar 14, 2019
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="list align-items-center pt-3">
                                        <div className="wrapper w-100">
                                          <p className="mb-0">
                                            <a
                                              href="#"
                                              className="fw-bold text-primary"
                                            >
                                              Show all{" "}
                                              <i className="mdi mdi-arrow-right ms-2"></i>
                                            </a>
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6 col-lg-6 grid-margin stretch-card">
                                  <div className="card card-rounded">
                                    <div className="card-body">
                                      <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h4 className="card-title card-title-dash">
                                          Activities
                                        </h4>
                                        <p className="mb-0">
                                          20 finished, 5 remaining
                                        </p>
                                      </div>
                                      <ul className="bullet-line-list">
                                        <li>
                                          <div className="d-flex justify-content-between">
                                            <div>
                                              <span className="text-light-green">
                                                Ben Tossell
                                              </span>{" "}
                                              assign you a task
                                            </div>
                                            <p>Just now</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="d-flex justify-content-between">
                                            <div>
                                              <span className="text-light-green">
                                                Oliver Noah
                                              </span>{" "}
                                              assign you a task
                                            </div>
                                            <p>1h</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="d-flex justify-content-between">
                                            <div>
                                              <span className="text-light-green">
                                                Jack William
                                              </span>{" "}
                                              assign you a task
                                            </div>
                                            <p>1h</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="d-flex justify-content-between">
                                            <div>
                                              <span className="text-light-green">
                                                Leo Lucas
                                              </span>{" "}
                                              assign you a task
                                            </div>
                                            <p>1h</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="d-flex justify-content-between">
                                            <div>
                                              <span className="text-light-green">
                                                Thomas Henry
                                              </span>{" "}
                                              assign you a task
                                            </div>
                                            <p>1h</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="d-flex justify-content-between">
                                            <div>
                                              <span className="text-light-green">
                                                Ben Tossell
                                              </span>{" "}
                                              assign you a task
                                            </div>
                                            <p>1h</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="d-flex justify-content-between">
                                            <div>
                                              <span className="text-light-green">
                                                Ben Tossell
                                              </span>{" "}
                                              assign you a task
                                            </div>
                                            <p>1h</p>
                                          </div>
                                        </li>
                                      </ul>
                                      <div className="list align-items-center pt-3">
                                        <div className="wrapper w-100">
                                          <p className="mb-0">
                                            <a
                                              href="#"
                                              className="fw-bold text-primary"
                                            >
                                              Show all{" "}
                                              <i className="mdi mdi-arrow-right ms-2"></i>
                                            </a>
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 d-flex flex-column">
                              <div className="row flex-grow">
                                <div className="col-12 grid-margin stretch-card">
                                  <div className="card card-rounded">
                                    <div className="card-body">
                                      <div className="row">
                                        <div className="col-lg-12">
                                          <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="card-title card-title-dash">
                                              Todo list
                                            </h4>
                                            <div className="add-items d-flex mb-0">
                                              <input
                                                type="text"
                                                className="form-control todo-list-input"
                                                placeholder="What do you need to do today?"
                                              />
                                              <button className="add btn btn-icons btn-rounded btn-primary todo-list-add-btn text-white me-0 pl-12p">
                                                <i className="mdi mdi-plus"></i>
                                              </button>
                                            </div>
                                          </div>
                                          <div className="list-wrapper">
                                            <ul className="todo-list todo-list-rounded">
                                              <li className="d-block">
                                                <div className="form-check w-100">
                                                  <label className="form-check-label">
                                                    <input
                                                      className="checkbox"
                                                      type="checkbox"
                                                    />{" "}
                                                    Lorem Ipsum is simply dummy
                                                    text of the printing{" "}
                                                    <i className="input-helper rounded"></i>
                                                  </label>
                                                  <div className="d-flex mt-2">
                                                    <div className="ps-4 text-small me-3">
                                                      24 June 2020
                                                    </div>
                                                    <div className="badge badge-opacity-warning me-3">
                                                      Due tomorrow
                                                    </div>
                                                    <i className="mdi mdi-flag ms-2 flag-color"></i>
                                                  </div>
                                                </div>
                                              </li>
                                              <li className="d-block">
                                                <div className="form-check w-100">
                                                  <label className="form-check-label">
                                                    <input
                                                      className="checkbox"
                                                      type="checkbox"
                                                    />{" "}
                                                    Lorem Ipsum is simply dummy
                                                    text of the printing{" "}
                                                    <i className="input-helper rounded"></i>
                                                  </label>
                                                  <div className="d-flex mt-2">
                                                    <div className="ps-4 text-small me-3">
                                                      23 June 2020
                                                    </div>
                                                    <div className="badge badge-opacity-success me-3">
                                                      Done
                                                    </div>
                                                  </div>
                                                </div>
                                              </li>
                                              <li>
                                                <div className="form-check w-100">
                                                  <label className="form-check-label">
                                                    <input
                                                      className="checkbox"
                                                      type="checkbox"
                                                    />{" "}
                                                    Lorem Ipsum is simply dummy
                                                    text of the printing{" "}
                                                    <i className="input-helper rounded"></i>
                                                  </label>
                                                  <div className="d-flex mt-2">
                                                    <div className="ps-4 text-small me-3">
                                                      24 June 2020
                                                    </div>
                                                    <div className="badge badge-opacity-success me-3">
                                                      Done
                                                    </div>
                                                  </div>
                                                </div>
                                              </li>
                                              <li className="border-bottom-0">
                                                <div className="form-check w-100">
                                                  <label className="form-check-label">
                                                    <input
                                                      className="checkbox"
                                                      type="checkbox"
                                                    />{" "}
                                                    Lorem Ipsum is simply dummy
                                                    text of the printing{" "}
                                                    <i className="input-helper rounded"></i>
                                                  </label>
                                                  <div className="d-flex mt-2">
                                                    <div className="ps-4 text-small me-3">
                                                      24 June 2020
                                                    </div>
                                                    <div className="badge badge-opacity-danger me-3">
                                                      Expired
                                                    </div>
                                                  </div>
                                                </div>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row flex-grow">
                                <div className="col-12 grid-margin stretch-card">
                                  <div className="card card-rounded">
                                    <div className="card-body">
                                      <div className="row">
                                        <div className="col-lg-12">
                                          <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h4 className="card-title card-title-dash">
                                              Type By Amount
                                            </h4>
                                          </div>
                                          <div>
                                            <canvas
                                              className="my-auto"
                                              id="doughnutChart"
                                            ></canvas>
                                          </div>
                                          <div
                                            id="doughnutChart-legend"
                                            className="mt-5 text-center"
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row flex-grow">
                                <div className="col-12 grid-margin stretch-card">
                                  <div className="card card-rounded">
                                    <div className="card-body">
                                      <div className="row">
                                        <div className="col-lg-12">
                                          <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                              <h4 className="card-title card-title-dash">
                                                Leave Report
                                              </h4>
                                            </div>
                                            <div>
                                              <div className="dropdown">
                                                <button
                                                  className="btn btn-light dropdown-toggle toggle-dark btn-lg mb-0 me-0"
                                                  type="button"
                                                  id="dropdownMenuButton3"
                                                  data-bs-toggle="dropdown"
                                                  aria-haspopup="true"
                                                  aria-expanded="false"
                                                >
                                                  {" "}
                                                  Month Wise{" "}
                                                </button>
                                                <div
                                                  className="dropdown-menu"
                                                  aria-labelledby="dropdownMenuButton3"
                                                >
                                                  <h6 className="dropdown-header">
                                                    week Wise
                                                  </h6>
                                                  <a
                                                    className="dropdown-item"
                                                    href="#"
                                                  >
                                                    Year Wise
                                                  </a>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="mt-3">
                                            <canvas id="leaveReport"></canvas>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row flex-grow">
                                <div className="col-12 grid-margin stretch-card">
                                  <div className="card card-rounded">
                                    <div className="card-body">
                                      <div className="row">
                                        <div className="col-lg-12">
                                          <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                              <h4 className="card-title card-title-dash">
                                                Top Performer
                                              </h4>
                                            </div>
                                          </div>
                                          <div className="mt-3">
                                            <div className="wrapper d-flex align-items-center justify-content-between py-2 border-bottom">
                                              <div className="d-flex">
                                                <img
                                                  className="img-sm rounded-10"
                                                  src="../assets/images/faces/face1.jpg"
                                                  alt="profile"
                                                />
                                                <div className="wrapper ms-3">
                                                  <p className="ms-1 mb-1 fw-bold">
                                                    Brandon Washington
                                                  </p>
                                                  <small className="text-muted mb-0">
                                                    162543
                                                  </small>
                                                </div>
                                              </div>
                                              <div className="text-muted text-small">
                                                1h ago
                                              </div>
                                            </div>
                                            <div className="wrapper d-flex align-items-center justify-content-between py-2 border-bottom">
                                              <div className="d-flex">
                                                <img
                                                  className="img-sm rounded-10"
                                                  src="../assets/images/faces/face2.jpg"
                                                  alt="profile"
                                                />
                                                <div className="wrapper ms-3">
                                                  <p className="ms-1 mb-1 fw-bold">
                                                    Wayne Murphy
                                                  </p>
                                                  <small className="text-muted mb-0">
                                                    162543
                                                  </small>
                                                </div>
                                              </div>
                                              <div className="text-muted text-small">
                                                1h ago
                                              </div>
                                            </div>
                                            <div className="wrapper d-flex align-items-center justify-content-between py-2 border-bottom">
                                              <div className="d-flex">
                                                <img
                                                  className="img-sm rounded-10"
                                                  src="../assets/images/faces/face3.jpg"
                                                  alt="profile"
                                                />
                                                <div className="wrapper ms-3">
                                                  <p className="ms-1 mb-1 fw-bold">
                                                    Katherine Butler
                                                  </p>
                                                  <small className="text-muted mb-0">
                                                    162543
                                                  </small>
                                                </div>
                                              </div>
                                              <div className="text-muted text-small">
                                                1h ago
                                              </div>
                                            </div>
                                            <div className="wrapper d-flex align-items-center justify-content-between py-2 border-bottom">
                                              <div className="d-flex">
                                                <img
                                                  className="img-sm rounded-10"
                                                  src="../assets/images/faces/face4.jpg"
                                                  alt="profile"
                                                />
                                                <div className="wrapper ms-3">
                                                  <p className="ms-1 mb-1 fw-bold">
                                                    Matthew Bailey
                                                  </p>
                                                  <small className="text-muted mb-0">
                                                    162543
                                                  </small>
                                                </div>
                                              </div>
                                              <div className="text-muted text-small">
                                                1h ago
                                              </div>
                                            </div>
                                            <div className="wrapper d-flex align-items-center justify-content-between pt-2">
                                              <div className="d-flex">
                                                <img
                                                  className="img-sm rounded-10"
                                                  src="../assets/images/faces/face5.jpg"
                                                  alt="profile"
                                                />
                                                <div className="wrapper ms-3">
                                                  <p className="ms-1 mb-1 fw-bold">
                                                    Rafell John
                                                  </p>
                                                  <small className="text-muted mb-0">
                                                    Alaska, USA
                                                  </small>
                                                </div>
                                              </div>
                                              <div className="text-muted text-small">
                                                1h ago
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <footer className="footer">
                <div className="d-sm-flex justify-content-center justify-content-sm-between">
                  <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">
                    Premium{" "}
                    <a href="https://www.bootstrapdash.com/" target="_blank">
                      Bootstrap admin template
                    </a>{" "}
                    from BootstrapDash.
                  </span>
                  <span className="float-none float-sm-end d-block mt-1 mt-sm-0 text-center">
                    Copyright © 2023. All rights reserved.
                  </span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </body>
    </>
  );
}

export default Theme;
