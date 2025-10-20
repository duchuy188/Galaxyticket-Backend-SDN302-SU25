const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.verify().then(() => {
  console.log("SMTP server is ready to take messages");
}).catch(err => {
  console.error("SMTP verify failed:", err);
});

/**
 * Gửi email
 * @param {Object} param0
 * @param {string} param0.to - Email người nhận
 * @param {string} param0.subject - Tiêu đề
 * @param {string} param0.text - Nội dung dạng text
 * @param {string} param0.html - Nội dung HTML
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Galaxy Ticket" <${process.env.GMAIL_EMAIL}>`,
    to, subject, text, html,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
