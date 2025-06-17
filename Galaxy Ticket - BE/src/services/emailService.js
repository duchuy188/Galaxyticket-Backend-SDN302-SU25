const emailjs = require('@emailjs/nodejs');
require('dotenv').config();

const sendMovieTicket = async (userEmail, ticketData) => {
    try {
        console.log('Starting to send email to:', userEmail);

        // Sử dụng biến môi trường
        const serviceId = process.env.EMAILJS_SERVICE_ID;
        const templateId = process.env.EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.EMAILJS_PUBLIC_KEY;
        const privateKey = process.env.EMAILJS_PRIVATE_KEY;

        // Kiểm tra các biến môi trường
        const requiredEnvVars = {
            'EMAILJS_SERVICE_ID': serviceId,
            'EMAILJS_TEMPLATE_ID': templateId,
            'EMAILJS_PUBLIC_KEY': publicKey,
            'EMAILJS_PRIVATE_KEY': privateKey
        };

        const missingVars = Object.entries(requiredEnvVars)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        // Định dạng thời gian chiếu để hiển thị chính xác giờ UTC (15:17)
        const screeningDate = new Date(ticketData.screeningTime);
        const day = screeningDate.getUTCDate();
        const month = screeningDate.getUTCMonth() + 1; // getUTCMonth trả về 0-11
        const year = screeningDate.getUTCFullYear();
        const hours = screeningDate.getUTCHours();
        const minutes = screeningDate.getUTCMinutes();

        const formattedDay = day < 10 ? '0' + day : day;
        const formattedMonth = month < 10 ? '0' + month : month;
        const formattedHours = hours < 10 ? '0' + hours : hours;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

        const formattedScreeningTime = `Ngày: ${formattedDay}/${formattedMonth}/${year} vào lúc: ${formattedHours}:${formattedMinutes}`;

        // Định dạng tổng tiền
        const formattedTotalPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(ticketData.totalPrice);

        console.log('EmailJS Configuration:', {
            serviceId,
            templateId,
            hasPublicKey: !!publicKey,
            hasPrivateKey: !!privateKey
        });

        const templateParams = {
            to_email: userEmail,
            movie_name: ticketData.movieName,
            screening_time: formattedScreeningTime, // Sử dụng thời gian đã định dạng
            seat_numbers: ticketData.seatNumbers.join(', '),
            cinema_name: ticketData.cinemaName,
            hall_name: ticketData.hallName,
            booking_code: ticketData.bookingCode,
            total_price: formattedTotalPrice, // Sử dụng tổng tiền đã định dạng
            qr_code_url: ticketData.qrCodeUrl
        };

        console.log('Template parameters:', templateParams);

        const result = await emailjs.send(
            serviceId,
            templateId,
            templateParams,
            {
                publicKey: publicKey,
                privateKey: privateKey
            }
        );

        console.log('Email sent successfully:', result);

        return {
            success: true,
            message: 'Ticket email sent successfully',
            data: result
        };
    } catch (error) {
        console.error('Detailed error in sendMovieTicket:', error);
        console.error('Error stack:', error.stack);
        throw new Error(`Failed to send ticket email: ${error.message}`);
    }
};

module.exports = {
    sendMovieTicket
}; 