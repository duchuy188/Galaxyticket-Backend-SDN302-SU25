const { sendEmail } = require('./resendService');
require('dotenv').config();

/**
 * Send movie ticket email using Resend. Constructs a simple HTML ticket email
 * from the provided ticketData.
 */
const sendMovieTicket = async (userEmail, ticketData) => {
    try {
        console.log('Starting to send ticket email to:', userEmail);

        const screeningDate = new Date(ticketData.screeningTime);
        const day = screeningDate.getUTCDate();
        const month = screeningDate.getUTCMonth() + 1;
        const year = screeningDate.getUTCFullYear();
        const hours = screeningDate.getHours();
        const minutes = screeningDate.getMinutes();

        const formattedDay = day < 10 ? '0' + day : day;
        const formattedMonth = month < 10 ? '0' + month : month;
        const formattedHours = hours < 10 ? '0' + hours : hours;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

        const formattedScreeningTime = `Ngày: ${formattedDay}/${formattedMonth}/${year} vào lúc: ${formattedHours}:${formattedMinutes}`;

        const formattedTotalPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(ticketData.totalPrice);

    const subject = `🎬 Vé Xem Phim Galaxy Ticket - ${ticketData.movieName}`;

    // Build a beautiful HTML email template matching the design
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galaxy Ticket</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="color: white; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
                🎬 Galaxy Ticket
            </div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Vé Xem Phim Của Bạn
            </div>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #333; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
                Xin chào!
            </h2>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">
                Cảm ơn bạn đã đặt vé tại Galaxy Ticket. Dưới đây là thông tin vé của bạn:
            </p>

            <!-- Booking Code Box -->
            <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 2px dashed #667eea; border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center;">
                <div style="color: #667eea; font-size: 13px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">
                    Mã đặt vé
                </div>
                <div style="color: #667eea; font-size: 20px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                    ${ticketData.bookingCode || 'N/A'}
                </div>
            </div>

            <!-- Ticket Details -->
            <div style="background-color: #fafafa; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                <div style="margin-bottom: 18px;">
                    <div style="color: #999; font-size: 12px; margin-bottom: 5px;">Tên phim</div>
                    <div style="color: #333; font-size: 16px; font-weight: 600;">${ticketData.movieName}</div>
                </div>

                <div style="margin-bottom: 18px;">
                    <div style="color: #999; font-size: 12px; margin-bottom: 5px;">Thời gian chiếu</div>
                    <div style="color: #333; font-size: 15px; font-weight: 500;">${formattedScreeningTime}</div>
                </div>

                <div style="margin-bottom: 18px;">
                    <div style="color: #999; font-size: 12px; margin-bottom: 5px;">Rạp</div>
                    <div style="color: #333; font-size: 15px; font-weight: 500;">${ticketData.cinemaName}</div>
                </div>

                <div style="margin-bottom: 18px;">
                    <div style="color: #999; font-size: 12px; margin-bottom: 5px;">Phòng chiếu</div>
                    <div style="color: #333; font-size: 15px; font-weight: 500;">${ticketData.hallName}</div>
                </div>

                <div style="margin-bottom: 18px;">
                    <div style="color: #999; font-size: 12px; margin-bottom: 5px;">Ghế ngồi</div>
                    <div style="color: #333; font-size: 15px; font-weight: 500;">${ticketData.seatNumbers.join(', ')}</div>
                </div>

                <div style="border-top: 1px solid #e0e0e0; padding-top: 18px; margin-top: 5px;">
                    <div style="color: #999; font-size: 12px; margin-bottom: 5px;">Tổng thanh toán</div>
                    <div style="color: #667eea; font-size: 20px; font-weight: bold;">${formattedTotalPrice}</div>
                </div>
            </div>

            <!-- QR Code -->
            ${ticketData.qrCodeUrl ? `
            <div style="text-align: center; margin: 30px 0;">
                <div style="color: #333; font-size: 14px; font-weight: 600; margin-bottom: 15px;">
                    Mã QR Code
                </div>
                <div style="background-color: #fff; padding: 20px; border-radius: 8px; display: inline-block; border: 1px solid #e0e0e0;">
                    <img src="${ticketData.qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px; display: block;" />
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 15px; line-height: 1.5;">
                    Vui lòng xuất trình mã QR này khi đến rạp
                </p>
            </div>
            ` : ''}

            <!-- Note -->
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-top: 25px;">
                <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                    ⏰ Vui lòng đến rạp trước ít nhất 15 phút để làm thủ tục.<br>
                    🍿 Chúc bạn xem phim vui vẻ!
                </p>
            </div>
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
    `;        const result = await sendEmail({ to: userEmail, subject, html });

        console.log('Ticket email sent result:', result);

        return {
            success: true,
            message: 'Ticket email sent successfully',
            data: result,
        };
    } catch (error) {
        console.error('Detailed error in sendMovieTicket:', error);
        throw new Error(`Failed to send ticket email: ${error.message}`);
    }
};

module.exports = {
    sendMovieTicket,
};