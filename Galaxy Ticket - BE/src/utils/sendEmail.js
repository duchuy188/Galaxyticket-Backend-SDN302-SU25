const emailjs = require('@emailjs/nodejs');
require('dotenv').config();

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_ID_OTP = process.env.EMAILJS_TEMPLATE_ID_OTP;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

if (!SERVICE_ID || !TEMPLATE_ID_OTP || !PUBLIC_KEY || !PRIVATE_KEY) {
  console.warn('Missing EmailJS env: EMAILJS_SERVICE_ID / EMAILJS_TEMPLATE_ID_OTP / EMAILJS_PUBLIC_KEY / EMAILJS_PRIVATE_KEY');
}

const sendEmail = async ({ to, subject, otp, expiresIn, resetLink, supportEmail, text, html }) => {
  try {
    const templateParams = {
      to_email: to,
      user_email: to,
      subject: subject || 'Mã OTP đặt lại mật khẩu',
      otp,
      expires_in: expiresIn ?? 15,
      reset_link: resetLink || '',
      support_email: supportEmail || '',
      from_email: process.env.EMAILJS_FROM_EMAIL || '', // đặt đúng Gmail đã connect, hoặc để trống nếu template set sẵn
      reply_to: to,
      html_content: html || (text ? `<p>${text}</p>` : ''),
      text_content: text || '',
    };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID_OTP, templateParams, { publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY });
  } catch (error) {
    const composed = error?.message || error?.text || (typeof error === 'string' ? error : '') || (error && JSON.stringify(error));
    throw new Error(`Không thể gửi email OTP: ${composed || 'Unknown error'}`);
  }
};

module.exports = sendEmail;
