import axios from "axios";

class Service {
  constructor() {
    this.error = null;
  }

  async view(pincode) {
    try {
      const result = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      const { PostOffice } = result.data[0];
      const name = PostOffice?.[0]?.["Name"];
      const city = PostOffice?.[0]?.["District"];
      const state = PostOffice?.[0]?.["State"];
      return { data: PostOffice ? { name, city, state, pincode } : [] };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const PincodeService = new Service();
export default PincodeService;
