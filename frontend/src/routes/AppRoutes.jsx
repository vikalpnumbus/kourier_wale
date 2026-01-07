import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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
import ShipmentsTable from "../pages/Seller/Shipment/ShipmentTable";
import OrdersForm from "../pages/Seller/Orders/OrdersForm";
import RateCalculator from "../pages/Seller/RateCalculator/index";
import Cod_Remittance from "../pages/Seller/Billing/cod_remittance";
import OrderView from "../pages/Seller/Orders/OrderView";
import SellerLayout from "../layouts/SellerLayout";
import LabelSettings from "../pages/Seller/Settings/LabelSettings";
import Channel from "../pages/Seller/Channel";
import ChannelTable from "../pages/Seller/Channel/ChannelTable";
import ChannelForm from "../pages/Seller/Channel/ChannelForm";
import Escalation from "../pages/Seller/Escalation";
import EscalationTable from "../pages/Seller/Escalation/EscalationTable";
import EscalationView from "../pages/Seller/Escalation/EscalationView";
import EscalationForm from "../pages/Seller/Escalation/EscalationForm";
import AddChannelPage from "../pages/Seller/Channel/AddChannelPage";
import ShopifyForm from "../pages/Seller/Channel/ShopifyForm";
import Shipments from "../pages/Seller/Shipment";
import ShippingCharge from "../pages/Seller/Billing/ShippingCharge";
import ShippingChargesTable from "../pages/Seller/Billing/ShippingCharge/ShippingChargesTable";
import WalletTransaction from "../pages/Seller/WalletTransaction";
import WalletTransactionTable from "../pages/Seller/WalletTransaction/WalletTransactionTable";
import SellerDashboard from "../pages/Seller/SellerDashboard/SellerDashboard";
function AppRoutes() {
  return (
    <>
      <SellerLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<SellerDashboard />} />
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

          <Route path="/shipments" element={<Shipments />}>
            <Route index element={<ShipmentsTable />} />
            <Route path="view/:id" element={<OrderView />} />
          </Route>

          <Route path="/rate_calculator" element={<RateCalculator />}></Route>
          <Route path="/cod_remittance" element={<Cod_Remittance />}></Route>

          <Route path="/shippingcharges" element={<ShippingCharge />}>
            <Route index element={<ShippingChargesTable />} />
          </Route>

          <Route path="label_setting" element={<LabelSettings />} />

          <Route path="/channel" element={<Channel />}>
            <Route index element={<ChannelTable />} />
            <Route path="add" element={<AddChannelPage />} />
            <Route path="add/shopify" element={<ShopifyForm />} />
            <Route path="edit/shopify/:id" element={<ShopifyForm />} />
          </Route>

          <Route path="/support" element={<Escalation />}>
            <Route index element={<EscalationTable />} />
            <Route path="add" element={<EscalationForm />} />
            <Route path="view/:id" element={<EscalationView />} />
          </Route>
          <Route path="/wallet_history" element={<WalletTransaction />}>
            <Route index element={<WalletTransactionTable />} />
          </Route>
        </Routes>
      </SellerLayout>
    </>
  );
}

export default AppRoutes;
