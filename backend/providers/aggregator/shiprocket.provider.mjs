import axios from "axios";
import https from "https";
import {
  SHIPROCKET_LOGIN_URL,
  SHIPROCKET_EMAIL,
  SHIPROCKET_PASSWORD,
} from "../../configurations/base.config.mjs";

class ShiprocketProvider {
  constructor() {
    this.agent = new https.Agent({
      rejectUnauthorized: false
    });
    this.token = null;
    this.tokenExpiry = 0;
  }
  async getToken() {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }
    try {
      const response = await axios.post(
        SHIPROCKET_LOGIN_URL,
        {
          email: SHIPROCKET_EMAIL,
          password: SHIPROCKET_PASSWORD
        },
        {
          httpsAgent: this.agent,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      console.log("🔐 Shiprocket Auth Response:");
      console.log(response.data);
      const token = response.data?.token;
      if (!token) {
        console.log("❌ Shiprocket token missing");
        return null;
      }
      this.token = token;
      this.tokenExpiry = Date.now() + (1000 * 60 * 60 * 8);
      console.log("✅ Shiprocket token generated");
      return token;
    } catch (error) {
      console.log("❌ Shiprocket token generation failed");
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
      return null;
    }
  }
}
export default new ShiprocketProvider();