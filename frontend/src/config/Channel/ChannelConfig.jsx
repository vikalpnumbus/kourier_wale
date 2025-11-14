const apiUrl = import.meta.env.VITE_API_URL;
const ChannelConfig = {
  channelApi: apiUrl + "/channel",
  channelFetchApi: apiUrl + "/channel/fetch",
};
export default ChannelConfig;