import nodemailer from "nodemailer";
import {
  EMAIL_HOST,
  EMAIL_PASS,
  EMAIL_PORT,
  EMAIL_USER,
} from "../configurations/base.config.mjs";

class Class {
  async sendEmail({ email, subject, message, html }) {
    console.info("Email Service", { data: { email, subject, message, html } });

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) console.error("SMTP connection failed:", error);
      else console.info("SMTP server ready to send:", success);
    });

    const mailOptions = {
      to: email,
      from: `Kourier Wale <${EMAIL_USER}>`,
      subject: subject,
      text: message,
      html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.info("✅ Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Email send failed:", error);
      throw error;
    }
  }
}

const NotificationService = new Class();
export default NotificationService;
