const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
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
    from: process.env.GMAIL_EMAIL,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📨 Email sent to", to);
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error.message);
    throw new Error("Không thể gửi email");
  }
};

module.exports = sendEmail;
