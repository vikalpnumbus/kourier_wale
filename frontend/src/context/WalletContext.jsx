import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import companyDetailsConfig from "../config/CompanyDetails/CompanyDetailsConfig";
const WalletContext = createContext();
export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(0);
  const fetchWallet = async () => {
    try {
      const res = await api.get(companyDetailsConfig.companyDetails);
      const balance = res?.data?.data?.companyDetails?.wallet_balance || 0;
      setWallet(balance);
    } catch (err) {
      console.error("Wallet fetch error", err);
    }
  };
  useEffect(() => {
    fetchWallet();
  }, []);
  return (
    <WalletContext.Provider value={{ wallet, setWallet, fetchWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};