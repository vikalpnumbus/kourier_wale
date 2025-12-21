const apiUrl = import.meta.env.VITE_API_URL;
const walletTransactionConfig = {
    walletTransaction: apiUrl + "/payments/history",
};
export default walletTransactionConfig;
