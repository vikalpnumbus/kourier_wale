class Class {
  async sendEmail(data) {
    console.info("Email Service", { data: data });
  }
}

const NotificationService = new Class();
export default NotificationService;
