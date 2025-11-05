const https = require('https');
require('dotenv').config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM = process.env.EMAIL_FROM || 'no-reply@example.com';

if (!RESEND_API_KEY) {
  console.warn('Missing RESEND_API_KEY in environment. Emails will not be sent.');
}

/**
 * Send an email via Resend (https://resend.com/docs/api)
 * @param {{to: string|Array<string>, subject: string, html?: string, text?: string, from?: string}} options
 */
function sendEmail({ to, subject, html, text, from }) {
  return new Promise((resolve, reject) => {
    if (!RESEND_API_KEY) {
      return reject(new Error('RESEND_API_KEY not configured'));
    }

    const payload = {
      from: from || DEFAULT_FROM,
      to: Array.isArray(to) ? to : [to],
      subject: subject || '',
    };

    if (html) payload.html = html;
    if (text) payload.text = text;

    const data = JSON.stringify(payload);

    const options = {
      method: 'POST',
      hostname: 'api.resend.com',
      path: '/emails',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const errMsg = parsed?.error || parsed?.message || body;
            reject(new Error(`Resend API error: ${errMsg}`));
          }
        } catch (err) {
          reject(new Error(`Invalid JSON response from Resend: ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

/**
 * Convenience helper to send OTP emails. Builds a beautiful HTML body matching Galaxy Ticket design.
 */
async function sendOTP({ to, otp, expiresIn = 15, supportEmail }) {
  const subject = '🔐 Mã OTP Xác Thực - Galaxy Ticket';
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mã OTP - Galaxy Ticket</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="color: white; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
                🔐 Galaxy Ticket
            </div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Mã OTP Xác Thực
            </div>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #333; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
                Xin chào!
            </h2>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">
                Mã OTP của bạn để xác thực tài khoản:
            </p>

            <!-- OTP Box -->
            <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 2px solid #667eea; border-radius: 12px; padding: 30px; margin-bottom: 25px; text-align: center;">
                <div style="color: #667eea; font-size: 36px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 8px;">
                    ${otp}
                </div>
            </div>

            <!-- Warning Box -->
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
                <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                    ⏰ Mã có hiệu lực trong <strong>${expiresIn} phút</strong>.<br>
                    🔒 Không chia sẻ mã này với bất kỳ ai.
                </p>
            </div>

            ${supportEmail ? `
            <p style="color: #999; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
                Cần hỗ trợ? Liên hệ: <a href="mailto:${supportEmail}" style="color: #667eea; text-decoration: none;">${supportEmail}</a>
            </p>
            ` : ''}
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 13px;">
                Trân trọng,<br>
                <strong style="color: #667eea;">Galaxy Ticket</strong>
            </p>
            <p style="margin: 0; color: #999; font-size: 11px;">
                Email này được gửi tự động, vui lòng không trả lời.
            </p>
        </div>
    </div>
</body>
</html>
  `;

  return sendEmail({ to, subject, html });
}

module.exports = {
  sendEmail,
  sendOTP,
};
