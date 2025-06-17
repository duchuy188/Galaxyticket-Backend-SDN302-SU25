const Booking = require('../models/Booking');
const Screening = require('../models/Screening');
const Seat = require('../models/Seat');
const Promotion = require('../models/Promotion');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const QRCode = require('qrcode');
const { sendMovieTicket } = require('../services/emailService');
const User = require('../models/User');

const activeBookingTimeouts = {};

// Get all bookings with filters
exports.getBookings = async (req, res) => {
    try {
        const {
            userId,
            screeningId,
            paymentStatus,
            startDate,
            endDate
        } = req.query;

        // Build filter object
        const filter = {};

        if (userId) {
            filter.userId = userId;
        }

        if (screeningId) {
            filter.screeningId = screeningId;
        }

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Get bookings with populated data
        const bookings = await Booking.find(filter)
            .populate({
                path: 'screeningId',
                populate: {
                    path: 'roomId',
                    select: 'name'
                }
            })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Lấy danh sách đặt vé thành công',
            bookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { userId, screeningId, seatNumbers, code } = req.body;

        // Validate required fields
        if (!userId || !screeningId || !seatNumbers) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate if screening exists and populate movie and cinema details
        const screening = await Screening.findById(screeningId)
            .populate('movieId')
            .populate({
                path: 'roomId',
                populate: {
                    path: 'theaterId'
                }
            });

        if (!screening) {
            return res.status(404).json({ message: 'Screening not found' });
        }

        // Validate if seats are available
        const seats = await Seat.find({
            screeningId,
            seatNumber: { $in: seatNumbers }
        });

        if (seats.length !== seatNumbers.length) {
            return res.status(400).json({ message: 'One or more seats not found' });
        }

        // Check if seats are already booked
        const existingBookings = await Booking.find({
            screeningId,
            seatNumbers: { $in: seatNumbers },
            paymentStatus: { $in: ['pending', 'paid'] }
        });

        // Kiểm tra xem ghế có thuộc booking hiện tại không
        const isCurrentBooking = existingBookings.some(booking =>
            booking.userId.toString() === userId.toString()
        );

        if (existingBookings.length > 0 && !isCurrentBooking) {
            return res.status(400).json({ message: 'One or more seats are already booked' });
        }

        // Calculate total price based on screening's ticketPrice and number of seats
        let totalPrice = screening.ticketPrice * seatNumbers.length;

        const bookingData = {
            userId,
            screeningId,
            seatNumbers,
            totalPrice,
            paymentStatus: 'pending'
        };

        if (code) {
            bookingData.code = code;
        }

        const newBooking = await Booking.create(bookingData);

        // After successful booking, send email with ticket details
        try {
            const user = await User.findById(userId);
            if (user && user.email) {
                const ticketData = {
                    movieName: screening.movieId.title,
                    screeningTime: screening.startTime,
                    seatNumbers: seatNumbers,
                    cinemaName: screening.roomId.theaterId.name,
                    hallName: screening.roomId.name,
                    bookingCode: newBooking.code,
                    totalPrice: totalPrice,
                    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${newBooking._id}` // Generate QR code URL
                };

                await sendMovieTicket(user.email, ticketData);
            }
        } catch (emailError) {
            console.error('Error sending ticket email:', emailError);
            // Don't fail the booking if email fails
        }

        // Update seat status to 'reserved'
        await Seat.updateMany(
            {
                screeningId,
                seatNumber: { $in: seatNumbers }
            },
            {
                status: 'reserved',
                reservedAt: new Date()
            }
        );

        // Set timeout to auto-cancel booking after 5 minutes if payment is not successful
        const timeoutId = setTimeout(async () => {
            try {
                const currentBooking = await Booking.findById(newBooking._id);
                if (currentBooking && currentBooking.paymentStatus === 'pending') {
                    // Check if payment was completed during the 5 minutes
                    const transaction = await Transaction.findOne({
                        bookingId: newBooking._id,
                        status: 'success'
                    });

                    if (!transaction) {
                        // If no successful payment found, cancel the booking
                        currentBooking.paymentStatus = 'cancelled';
                        await currentBooking.save();

                        // Reset seat status back to available
                        await Seat.updateMany(
                            {
                                screeningId,
                                seatNumber: { $in: seatNumbers }
                            },
                            {
                                status: 'available',
                                reservedAt: null
                            }
                        );

                        console.log(`Booking ${newBooking._id} automatically cancelled after 5 minutes due to no payment`);
                    }
                }
            } catch (error) {
                console.error('Error in auto-cancellation:', error);
            } finally {
                delete activeBookingTimeouts[newBooking._id]; // Clean up the timeout ID
            }
        }, 5 * 60 * 1000); // 5 minutes

        activeBookingTimeouts[newBooking._id] = timeoutId;

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: newBooking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'screeningId',
                populate: {
                    path: 'roomId',
                    select: 'name'
                }
            });

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy đặt vé' });
        }

        // Only allow cancellation of pending bookings
        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ message: 'Chỉ có thể hủy đặt vé đang chờ thanh toán' });
        }

        booking.paymentStatus = 'cancelled';
        await booking.save();

        // Reset seat status back to available
        await Seat.updateMany(
            {
                screeningId: booking.screeningId,
                seatNumber: { $in: booking.seatNumbers }
            },
            {
                status: 'available',
                reservedAt: null
            }
        );

        res.json({ message: 'Hủy đặt vé thành công', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a booking
exports.updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { seatNumbers, code } = req.body;

        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'screeningId',
                populate: {
                    path: 'roomId',
                    select: 'name'
                }
            });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow updates to pending bookings
        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ message: 'Can only update pending bookings' });
        }

        // If updating seats, validate availability and recalculate totalPrice
        if (seatNumbers) {
            const seats = await Seat.find({
                screeningId: booking.screeningId,
                seatNumber: { $in: seatNumbers }
            });

            if (seats.length !== seatNumbers.length) {
                return res.status(400).json({ message: 'One or more seats not found' });
            }

            const existingBookings = await Booking.find({
                screeningId: booking.screeningId,
                seatNumbers: { $in: seatNumbers },
                _id: { $ne: bookingId },
                paymentStatus: { $in: ['pending', 'paid'] }
            });

            if (existingBookings.length > 0) {
                return res.status(400).json({ message: 'One or more seats are already booked' });
            }

            booking.seatNumbers = seatNumbers;

            // Recalculate totalPrice if seatNumbers are updated
            const screening = await Screening.findById(booking.screeningId);
            if (screening) {
                let newTotalPrice = screening.ticketPrice * seatNumbers.length;

                // Reapply promotion if exists
                if (booking.code) {
                    const promotion = await Promotion.findOne({
                        code: booking.code,
                        isActive: true,
                        status: 'approved',
                        startDate: { $lte: new Date() },
                        endDate: { $gte: new Date() }
                    });

                    if (promotion) {
                        if (promotion.type === 'percent') {
                            newTotalPrice = newTotalPrice * (1 - promotion.value / 100);
                        } else if (promotion.type === 'fixed') {
                            newTotalPrice = Math.max(0, newTotalPrice - promotion.value);
                        }
                    }
                }

                booking.totalPrice = newTotalPrice;
            } else {
                return res.status(500).json({ message: 'Screening not found for booking' });
            }
        }

        if (code !== undefined) {
            const newCode = code ? code.trim().toUpperCase() : null;
            if (newCode !== booking.code) {
                booking.code = newCode;

                // Recalculate price with new promotion code
                const screening = await Screening.findById(booking.screeningId);
                if (screening) {
                    let newTotalPrice = screening.ticketPrice * booking.seatNumbers.length;

                    if (newCode) {
                        const promotion = await Promotion.findOne({
                            code: newCode,
                            isActive: true,
                            status: 'approved',
                            startDate: { $lte: new Date() },
                            endDate: { $gte: new Date() }
                        });

                        if (promotion) {
                            if (promotion.type === 'percent') {
                                newTotalPrice = newTotalPrice * (1 - promotion.value / 100);
                            } else if (promotion.type === 'fixed') {
                                newTotalPrice = Math.max(0, newTotalPrice - promotion.value);
                            }
                        } else {
                            return res.status(400).json({ message: 'Mã khuyến mãi không hợp lệ' });
                        }
                    }

                    booking.totalPrice = newTotalPrice;
                }
            }
        }

        await booking.save();

        // Populate the updated booking
        const updatedBooking = await Booking.findById(bookingId)
            .populate({
                path: 'screeningId',
                populate: {
                    path: 'roomId',
                    select: 'name'
                }
            });

        res.json(updatedBooking);
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy ID của user đang đăng nhập

        // Lấy danh sách booking của user với paymentStatus là 'paid'
        const bookings = await Booking.find({
            userId: userId,
            paymentStatus: 'paid'
        })
            .populate({
                path: 'screeningId',
                populate: [
                    {
                        path: 'movieId',
                        select: 'title poster'
                    },
                    {
                        path: 'roomId',
                        select: 'name'
                    }
                ]
            })
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian đặt mới nhất

        const bookingsWithQrCode = await Promise.all(bookings.map(async booking => {
            const qrContent = [
                `Mã đặt vé: ${booking._id.toString()}`,
                `Phim: ${booking.screeningId.movieId.title}`,
                `Thời gian chiếu phim: Ngày: ${new Date(booking.screeningId.startTime.getTime() - (7 * 60 * 60 * 1000)).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} vào lúc: ${new Date(booking.screeningId.startTime.getTime() - (7 * 60 * 60 * 1000)).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })}`,
                `Phòng: ${booking.screeningId.roomId.name}`,
                `Ghế: ${booking.seatNumbers.join(', ')}`,
                `Tổng tiền: ${booking.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`,
                `Ngày đặt: Ngày: ${new Date(booking.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} vào lúc: ${new Date(booking.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })}`
            ].join('\n');
            const qrCodeDataUrl = await QRCode.toDataURL(qrContent);

            return {
                ...booking.toObject(),
                movieTitle: booking.screeningId.movieId.title,
                moviePoster: booking.screeningId.movieId.poster,
                roomName: booking.screeningId.roomId.name,
                screeningTime: booking.screeningId.startTime,
                seatNumbers: booking.seatNumbers,
                totalPrice: booking.totalPrice,
                bookingDate: booking.createdAt,
                qrCodeDataUrl // Add QR code data URL here
            };
        }));

        res.json({
            message: 'Lấy danh sách vé đã đặt thành công',
            bookings: bookingsWithQrCode
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update booking status after successful payment
exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'screeningId',
                populate: [
                    {
                        path: 'movieId',
                        select: 'title poster'
                    },
                    {
                        path: 'roomId',
                        select: 'name'
                    }
                ]
            }); // Populate để lấy chi tiết phim và phòng cho mã QR

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy đặt vé' });
        }

        // Cập nhật trạng thái đặt vé thành đã thanh toán
        booking.paymentStatus = 'paid';
        await booking.save();

        // Xóa thời gian chờ tự động hủy nếu nó tồn tại
        if (activeBookingTimeouts[bookingId]) {
            clearTimeout(activeBookingTimeouts[bookingId]);
            delete activeBookingTimeouts[bookingId];
            console.log(`Đã xóa thời gian chờ tự động hủy cho đặt vé ${bookingId}`);
        }

        // Cập nhật trạng thái ghế thành đã đặt
        await Seat.updateMany(
            {
                screeningId: booking.screeningId,
                seatNumber: { $in: booking.seatNumbers }
            },
            {
                status: 'booked',
                reservedAt: null
            }
        );

        // Tạo mã QR cho đặt vé đã xác nhận
        const qrContent = [
            `Mã đặt vé: ${booking._id.toString()}`,
            `Phim: ${booking.screeningId.movieId.title}`,
            `Thời gian chiếu phim: Ngày: ${new Date(booking.screeningId.startTime.getTime() - (7 * 60 * 60 * 1000)).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} vào lúc: ${new Date(booking.screeningId.startTime.getTime() - (7 * 60 * 60 * 1000)).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })}`,
            `Phòng: ${booking.screeningId.roomId.name}`,
            `Ghế: ${booking.seatNumbers.join(', ')}`,
            `Tổng tiền: ${booking.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`,
            `Ngày đặt: Ngày: ${new Date(booking.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} vào lúc: ${new Date(booking.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })}`
        ].join('\n');
        const qrCodeDataUrl = await QRCode.toDataURL(qrContent);

        res.json({
            message: 'Cập nhật trạng thái đặt vé thành đã thanh toán thành công',
            booking: {
                ...booking.toObject(), // Chuyển đổi tài liệu mongoose thành đối tượng thuần
                movieTitle: booking.screeningId.movieId.title,
                moviePoster: booking.screeningId.movieId.poster,
                roomName: booking.screeningId.roomId.name,
                screeningTime: booking.screeningId.startTime,
                seatNumbers: booking.seatNumbers,
                totalPrice: booking.totalPrice,
                bookingDate: booking.createdAt,
                qrCodeDataUrl // Bao gồm mã QR đã tạo
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đặt vé:', error);
        res.status(500).json({ message: error.message });
    }
};

// Function để gửi email vé
exports.sendTicketEmail = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.userId;

        console.log('Sending ticket email for booking:', bookingId);
        console.log('User ID:', userId);

        // Tìm booking và populate các thông tin cần thiết
        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'screeningId',
                populate: [
                    {
                        path: 'movieId',
                        select: 'title'
                    },
                    {
                        path: 'roomId',
                        populate: {
                            path: 'theaterId',
                            select: 'name'
                        }
                    }
                ]
            });

        if (!booking) {
            console.log('Booking not found:', bookingId);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy booking'
            });
        }

        // Kiểm tra xem người dùng có quyền xem booking này không
        if (booking.userId.toString() !== userId.toString()) {
            console.log('User not authorized. Booking userId:', booking.userId, 'Request userId:', userId);
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập booking này'
            });
        }

        // Lấy thông tin user
        const user = await User.findById(userId);
        if (!user || !user.email) {
            console.log('User not found or no email:', userId);
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy email của người dùng'
            });
        }

        console.log('Found user email:', user.email);

        // Chuẩn bị dữ liệu để gửi email
        const ticketData = {
            movieName: booking.screeningId.movieId.title,
            screeningTime: booking.screeningId.startTime,
            seatNumbers: booking.seatNumbers,
            cinemaName: booking.screeningId.roomId.theaterId.name,
            hallName: booking.screeningId.roomId.name,
            bookingCode: booking.code,
            totalPrice: booking.totalPrice,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking._id}`
        };

        console.log('Prepared ticket data:', ticketData);

        try {
            // Gửi email
            await sendMovieTicket(user.email, ticketData);
            console.log('Email sent successfully to:', user.email);

            res.json({
                success: true,
                message: 'Đã gửi email vé thành công'
            });
        } catch (emailError) {
            console.error('Error in sendMovieTicket:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi gửi email vé',
                error: emailError.message
            });
        }

    } catch (error) {
        console.error('Error in sendTicketEmail:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xử lý yêu cầu gửi email vé',
            error: error.message
        });
    }
};
