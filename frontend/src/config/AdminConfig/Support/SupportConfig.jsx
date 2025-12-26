const apiUrl = import.meta.env.VITE_API_URL_ADMIN;
const SupportConfig = {
    support: apiUrl + "/escalations",
    conversations: apiUrl + "/escalations/conversations"
};
export default SupportConfig;