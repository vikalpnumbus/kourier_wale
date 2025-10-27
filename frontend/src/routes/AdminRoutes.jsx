import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/Admin/Dashboard/AdminDashboard";
import Shipment from "../pages/Admin/Shipment";
import ShipmentTable from "../pages/Admin/Shipment/ShipmentTable";
import AWBList from "../pages/Admin/Courier/AWBList";
import AWBListTable from "../pages/Admin/Courier/AWBList/AWBListTable";
import AWBListForm from "../pages/Admin/Courier/AWBList/AWBListForm";
import Users from "../pages/Admin/Users";
import UsersTable from "../pages/Admin/Users/UsersTable";
import AdminCouriers from "../pages/Admin/Courier/AdminCouriers";
import CourierList from "../pages/Admin/Courier/AdminCouriers/CourierList";
import CourierForm from "../pages/Admin/Courier/AdminCouriers/CourierForm";


function AdminRoutes() {
  return (
    <>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />

          <Route path="/shipment" element={<Shipment />}>
            <Route index element={<ShipmentTable />} />
          </Route>

          <Route path="/awb_list" element={<AWBList />}>
            <Route index element={<AWBListTable />} />
            <Route path="add" element={<AWBListForm />} />
            <Route path="edit/:id" element={<AWBListForm />} />
          </Route>
 
          <Route path="/users" element={<Users />}>
            <Route index element={<UsersTable />} />
          </Route>

          <Route path="/courier" element={<AdminCouriers />}>
            <Route index element={<CourierList />} />
            <Route path="add" element={<CourierForm />} />
          </Route>

        </Routes>
      </AdminLayout>
    </>
  );
}

export default AdminRoutes;
