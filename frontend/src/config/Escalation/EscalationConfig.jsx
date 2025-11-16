const apiUrl = import.meta.env.VITE_API_URL;

const escalationConfig = {
  escalationApi: apiUrl + "/escalations",
  conversationsApi: apiUrl + "/escalations/conversations"
};

export default escalationConfig;
