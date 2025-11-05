const { sendOTP } = require('../services/resendService');
require('dotenv').config();

/**
 * sendEmail wrapper used previously for OTPs via EmailJS.
 * Now delegates to Resend via src/services/resendService.sendOTP
 */
const sendEmail = async ({ to, subject, otp, expiresIn, resetLink, supportEmail, text, html }) => {
  try {
    // If caller provided html/text, prefer them; otherwise build an OTP email via sendOTP helper.
    if (html || text) {
      const bodyHtml = html || `<p>${text}</p>`;
      return await require('../services/resendService').sendEmail({ to, subject: subject || 'Thông báo', html: bodyHtml, text });
    }

    // Use sendOTP convenience helper
    return await sendOTP({ to, otp, expiresIn, supportEmail });
  } catch (error) {
    const composed = error?.message || (typeof error === 'string' ? error : '') || (error && JSON.stringify(error));
    throw new Error(`Không thể gửi email OTP: ${composed || 'Unknown error'}`);
  }
};

module.exports = sendEmail;
