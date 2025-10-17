import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Seller/Home";
import Theme from "../pages/Seller/Theme";
import KYCDetails from "../pages/Seller/KYC/KYCDetails";
import BankDetailsForm from "../pages/Seller/BankDetails/BankDetailsForm";
import BankDetails from "../pages/Seller/BankDetails/BankDetails";
import CompanyDetails from "../pages/Seller/CompanyDetails/CompanyDetails";
import Profile from "../pages/Seller/Profile";
import Warehouse from "../pages/Seller/Warehouse";
import WarehouseTable from "../pages/Seller/Warehouse/WarehouseTable";
import WarehouseForm from "../pages/Seller/Warehouse/WarehouseForm";
import Products from "../pages/Seller/Products";
import ProductsTable from "../pages/Seller/Products/ProductsTable";
import ProductsForm from "../pages/Seller/Products/ProductsForm";
import Orders from "../pages/Seller/Orders";
import OrdersTable from "../pages/Seller/Orders/OrdersTable";
import OrdersForm from "../pages/Seller/Orders/OrdersForm";
import RateCalculator from "../pages/Seller/RateCalculator/index";
import ShippingCharges from "../pages/Seller/Billing/shippingcharges";
import Cod_Remittance from "../pages/Seller/Billing/cod_remittance";
import OrderView from "../pages/Seller/Orders/OrderView";
import SellerLayout from "../layouts/SellerLayout";
import LabelSettings from "../pages/Seller/Settings/LabelSettings";
function AppRoutes() {
  return (
    <>
      <SellerLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/theme" element={<Theme />} />

          <Route path="/profile" element={<Profile />}>
            <Route index element={<KYCDetails />} />
            <Route path="kyc" element={<KYCDetails />} />
            <Route path="bank" element={<BankDetails />} />
            <Route path="bank/add" element={<BankDetailsForm />} />
            <Route path="bank/edit/:id" element={<BankDetailsForm />} />
            <Route path="company" element={<CompanyDetails />} />
          </Route>

          <Route path="/warehouse" element={<Warehouse />}>
            <Route index element={<WarehouseTable />} />
            <Route path="add" element={<WarehouseForm />} />
            <Route path="edit/:id" element={<WarehouseForm />} />
          </Route>

          <Route path="/products" element={<Products />}>
            <Route index element={<ProductsTable />} />
            <Route path="add" element={<ProductsForm />} />
            <Route path="edit/:id" element={<ProductsForm />} />
          </Route>

          <Route path="/orders" element={<Orders />}>
            <Route index element={<OrdersTable />} />
            <Route path="add" element={<OrdersForm />} />
            <Route path="edit/:id" element={<OrdersForm />} />
            <Route path="clone/:id" element={<OrdersForm />} />
            <Route path="view/:id" element={<OrderView />} />
          </Route>

          <Route path="/rate_calculator" element={<RateCalculator />}></Route>
          <Route path="/shippingcharges" element={<ShippingCharges />}></Route>
          <Route path="/cod_remittance" element={<Cod_Remittance />}></Route>

          <Route path="label_setting" element={<LabelSettings />} />
        </Routes>
      </SellerLayout>
    </>
  );
}

export default AppRoutes;
