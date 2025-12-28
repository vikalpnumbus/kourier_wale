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
import PricingPlans from "../pages/Admin/PricingPlans";
import PricingPlansList from "../pages/Admin/PricingPlans/PricingPlansList";
import PricingPlansForm from "../pages/Admin/PricingPlans/PricingPlansForm";
import PricingPlanView from "../pages/Admin/PricingPlans/PricingPlanView";
import PricingPlanEdit from "../pages/Admin/PricingPlans/PricingPlanEdit";
import PricingCourier from "../pages/Admin/Courier/PricingCouriers";
import PricingCourierPage from "../pages/Admin/Courier/PricingCouriers/PricingCourierPage";
import UserView from "../pages/Admin/Users/UserVeiw";
import Weight from "../pages/Admin/Weight";
import UploadWeight from "../pages/Admin/Weight/UploadWeight";
import ManageWeight from "../pages/Admin/Weight/ManageWeight";
import Support from "../pages/Admin/Support";
import SupportTable from "../pages/Admin/Support/SupportTable";
import SupportView from "../pages/Admin/Support/SupportView";
import Remittance from "../pages/Admin/Remittance";
import RemittanceTable from "../pages/Admin/Remittance/RemittanceTable";
import RemittanceSellerTable from "../pages/Admin/Remittance/RemittanceSellerTable";


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
            <Route path="view/:id" element={<UserView />} />
          </Route>

          <Route path="/courier" element={<AdminCouriers />}>
            <Route index element={<CourierList />} />
            <Route path="add" element={<CourierForm />} />
            <Route path="edit/:id" element={<CourierForm />} />
          </Route>

          <Route path="/plans" element={<PricingPlans />}>
            <Route index element={<PricingPlansList />} />
            <Route path="add" element={<PricingPlansForm />} />
            <Route path="edit/:id" element={<PricingPlanEdit />} />
            <Route path="view/:id" element={<PricingPlanView />} />
          </Route>

          <Route path="/pricingCourier" element={<PricingCourier />}>
            <Route index element={<PricingCourierPage />} />
          </Route>
          <Route path="/Weight" element={<Weight />}>
            <Route index element={<UploadWeight />} />
            <Route path="upload" element={<UploadWeight />} />
            <Route path="manage" element={<ManageWeight />} />
          </Route>
          <Route path="/support" element={<Support />}>
            <Route index element={<SupportTable />} />
            <Route path="view/:id" element={<SupportView />} />
          </Route>
          <Route path="/remittance" element={<Remittance />}>
            <Route index element={<RemittanceTable />} />
            <Route path="payable" element={<RemittanceTable />} />
            <Route path="seller" element={<RemittanceSellerTable />} />
          </Route>

        </Routes>
      </AdminLayout>
    </>
  );
}

export default AdminRoutes;
