import { Routes, Route } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import AdminRoutes from "./routes/AdminRoutes";

import Login from "./Component/Auth/Login/Login";
// import Login from "./Component/Auth/Login/tempLogin";
import Register from "./Component/Auth/Register/Register";
import ForgotPassword from "./Component/Auth/Login/ForgotPassword";
import ResetPassword from "./Component/Auth/Login/ResetPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import { WalletProvider } from "./context/WalletContext";

function App() {
  return (
    <WalletProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/admin/*"
        element={<ProtectedRoute element={<AdminRoutes />} allowedRole="admin" />}
      />
      <Route
        path="/*"
        element={<ProtectedRoute element={<AppRoutes />} allowedRole="user" />}
      />
    </Routes>
    </WalletProvider>
  );
}

export default App;
