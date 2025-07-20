const Booking = require('../models/Booking');
const Screening = require('../models/Screening');
const Seat = require('../models/Seat');
const Promotion = require('../models/Promotion');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const QRCode = require('qrcode');
const { sendMovieTicket } = require('../services/emailService');
const User = require('../models/User');
const PromotionUsage = require('../models/PromotionUsage');

const activeBookingTimeouts = {};

// Get all bookings with filters
exports.getBookings = async(req, res) => {
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

        // Format bookings để đảm bảo totalPrice luôn có giá trị
        const formattedBookings = bookings.map(booking => ({
            ...booking.toObject(),
            totalPrice: booking.totalPrice || 0
        }));

        res.json({
            success: true,
            message: 'Lấy danh sách đặt vé thành công',
            data: {
                bookings: formattedBookings
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: {
                bookings: [],
                totalPrice: 0
            }
        });
    }
};

// Create a new booking
exports.createBooking = async(req, res) => {
    try {
        const { screeningId, seatNumbers: rawSeatNumbers, code, paymentMethod } = req.body; // Thêm paymentMethod
        const userId = req.user.userId; // Get userId from authenticated user

        // Validate required fields
        if (!screeningId || !rawSeatNumbers) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại'
            });
        }

        // Đảm bảo seatNumbers là một mảng
        const processedSeatNumbers = Array.isArray(rawSeatNumbers) ? rawSeatNumbers : [rawSeatNumbers];

        // Kiểm tra số lượng ghế tối đa
        if (processedSeatNumbers.length > 4) {
            return res.status(400).json({
                success: false,
                message: 'Bạn chỉ có thể đặt tối đa 4 ghế trong một lần đặt'
            });
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
            seatNumber: { $in: processedSeatNumbers }
        });

        if (seats.length !== processedSeatNumbers.length) {
            return res.status(400).json({ message: 'One or more seats not found' });
        }

        // Check if seats are already booked
        const existingBookings = await Booking.find({
            screeningId,
            seatNumbers: { $in: processedSeatNumbers },
            paymentStatus: { $in: ['pending', 'paid'] }
        });

        // Kiểm tra xem ghế có thuộc booking hiện tại không
        const isCurrentBooking = existingBookings.some(booking =>
            booking.userId.toString() === userId.toString()
        );

        if (existingBookings.length > 0 && !isCurrentBooking) {
            return res.status(400).json({ message: 'One or more seats are already booked' });
        } // Get all seats for this screening to check the single seat rule
        const allSeats = await Seat.find({
            screeningId,
            status: { $in: ['available', 'booked', 'reserved'] }
        });

        // Organize seats by row
        const seatsByRow = {};
        allSeats.forEach(seat => {
            const row = seat.seatNumber.charAt(0);
            if (!seatsByRow[row]) {
                seatsByRow[row] = [];
            }
            seatsByRow[row].push({
                seatNumber: seat.seatNumber,
                status: seat.status,
                numericPart: parseInt(seat.seatNumber.substring(1))
            });
        });

        // Sort seats in each row
        Object.keys(seatsByRow).forEach(row => {
            seatsByRow[row].sort((a, b) => a.numericPart - b.numericPart);
        });

        // Group selected seats by row
        const selectedSeatsByRow = {};
        processedSeatNumbers.forEach(seatNumber => {
            const row = seatNumber.charAt(0);
            if (!selectedSeatsByRow[row]) {
                selectedSeatsByRow[row] = [];
            }
            selectedSeatsByRow[row].push(seatNumber);
        });

        // Kiểm tra ghế lẻ cho mỗi hàng
        let singleSeatViolation = false;
        let violationDetails = '';

        Object.keys(selectedSeatsByRow).forEach(row => {
            if (singleSeatViolation) return;

            const rowSeats = seatsByRow[row];
            const selectedInRow = selectedSeatsByRow[row];

            // Kiểm tra từng ghế được chọn
            for (const seatNum of selectedInRow) {
                const currentSeat = rowSeats.find(s => s.seatNumber === seatNum);
                const currentIndex = rowSeats.indexOf(currentSeat);

                // Kiểm tra trạng thái ghế
                const isSeatOccupied = (index) => {
                    if (index < 0 || index >= rowSeats.length) return true;
                    const seat = rowSeats[index];
                    return seat.status === 'booked' || seat.status === 'reserved';
                };

                const isSelectedSeat = (index) => {
                    if (index < 0 || index >= rowSeats.length) return false;
                    return selectedInRow.includes(rowSeats[index].seatNumber);
                };

                // Tìm tất cả các ghế trống liên tiếp chứa ghế hiện tại
                let leftBound = currentIndex;
                while (leftBound > 0 && !isSeatOccupied(leftBound - 1)) {
                    leftBound--;
                }

                let rightBound = currentIndex;
                while (rightBound < rowSeats.length - 1 && !isSeatOccupied(rightBound + 1)) {
                    rightBound++;
                }

                // Kiểm tra xem việc chọn ghế có tạo ra ghế lẻ ở hai bên không
                for (let i = leftBound; i <= rightBound; i++) {
                    // Bỏ qua ghế đang được chọn
                    if (isSelectedSeat(i)) continue;

                    // Nếu là ghế trống, kiểm tra xem có bị cô lập không
                    if (rowSeats[i].status === 'available') {
                        const leftSideOccupied = i === 0 || isSeatOccupied(i - 1) || isSelectedSeat(i - 1);
                        const rightSideOccupied = i === rowSeats.length - 1 || isSeatOccupied(i + 1) || isSelectedSeat(i + 1);

                        if (leftSideOccupied && rightSideOccupied) {
                            singleSeatViolation = true;
                            violationDetails = `Không thể để ghế ${rowSeats[i].seatNumber} thành ghế đơn lẻ`;
                            return;
                        }
                    }
                }

                // Kiểm tra thêm trường hợp tạo ra ghế lẻ ở rìa của dãy ghế được chọn
                if (leftBound > 0 && rowSeats[leftBound - 1].status === 'available') {
                    const isLeftSeatIsolated = leftBound <= 1 || isSeatOccupied(leftBound - 2);
                    if (isLeftSeatIsolated) {
                        singleSeatViolation = true;
                        violationDetails = `Không thể để ghế ${rowSeats[leftBound - 1].seatNumber} thành ghế đơn lẻ`;
                        return;
                    }
                }

                if (rightBound < rowSeats.length - 1 && rowSeats[rightBound + 1].status === 'available') {
                    const isRightSeatIsolated = rightBound >= rowSeats.length - 2 || isSeatOccupied(rightBound + 2);
                    if (isRightSeatIsolated) {
                        singleSeatViolation = true;
                        violationDetails = `Không thể để ghế ${rowSeats[rightBound + 1].seatNumber} thành ghế đơn lẻ`;
                        return;
                    }
                }
            }
        });

        if (singleSeatViolation) {
            return res.status(400).json({
                success: false,
                message: violationDetails
            });
        }

        // Calculate total price based on screening's ticketPrice and number of seats
        let totalPrice = screening.ticketPrice * processedSeatNumbers.length;
        let promotionId = null;

        // Apply promotion code if provided
        if (code) {
            const promotion = await Promotion.findOne({
                code: code,
                isActive: true,
                status: 'approved',
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            });

            if (!promotion) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã khuyến mãi không hợp lệ',
                    data: {
                        totalPrice: screening.ticketPrice * processedSeatNumbers.length
                    }
                });
            }

            // Kiểm tra số lượng đã sử dụng
            if (promotion.currentUsage >= promotion.maxUsage) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã khuyến mãi đã hết lượt sử dụng',
                    data: {
                        totalPrice: screening.ticketPrice * processedSeatNumbers.length
                    }
                });
            }

            // Kiểm tra xem user đã sử dụng mã khuyến mãi này chưa
            const existingUsage = await PromotionUsage.findOne({
                userId: userId,
                promotionId: promotion._id
            });

            if (existingUsage) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn đã sử dụng mã khuyến mãi này rồi',
                    data: {
                        totalPrice: screening.ticketPrice * processedSeatNumbers.length
                    }
                });
            }

            promotionId = promotion._id;

            if (promotion.type === 'percent') {
                totalPrice = totalPrice * (1 - promotion.value / 100);
            } else if (promotion.type === 'fixed') {
                totalPrice = Math.max(0, totalPrice - promotion.value);
            }
            // Làm tròn số tiền đến hàng nghìn gần nhất
            totalPrice = Math.round(totalPrice / 1000) * 1000;
        }

        const bookingData = {
            userId,
            screeningId,
            seatNumbers: processedSeatNumbers,
            totalPrice: totalPrice || 0, // Đảm bảo totalPrice luôn có giá trị
            paymentStatus: 'pending',
            promotionId, // Thêm promotionId vào booking data
            paymentMethod // Thêm paymentMethod vào booking data
        };

        if (code) {
            bookingData.code = code;
        }

        const newBooking = await Booking.create(bookingData);

        // Update seat status to 'reserved'
        await Seat.updateMany({
            screeningId,
            seatNumber: { $in: processedSeatNumbers }
        }, {
            status: 'reserved',
            reservedAt: new Date()
        });

        // Set timeout to auto-cancel booking after 2 minutes if payment is not successful
        const timeoutId = setTimeout(async() => {
            try {
                const currentBooking = await Booking.findById(newBooking._id);
                if (currentBooking && currentBooking.paymentStatus === 'pending') {
                    const transaction = await Transaction.findOne({
                        bookingId: newBooking._id,
                        status: 'success'
                    });

                    if (!transaction) {
                        currentBooking.paymentStatus = 'cancelled';
                        await currentBooking.save();

                        // Lấy danh sách ghế hiện tại của booking để nhả
                        await Seat.updateMany({
                            screeningId,
                            seatNumber: { $in: currentBooking.seatNumbers }
                        }, {
                            status: 'available',
                            reservedAt: null
                        });

                        console.log(`Booking ${newBooking._id} automatically cancelled after 2 minutes due to no payment`);
                    }
                }
            } catch (error) {
                console.error('Error in auto-cancellation:', error);
            } finally {
                delete activeBookingTimeouts[newBooking._id];
            }
        }, 2 * 60 * 1000); // 2 phút
        activeBookingTimeouts[newBooking._id] = timeoutId;

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                ...newBooking.toObject(),
                totalPrice: newBooking.totalPrice || 0 // Đảm bảo totalPrice luôn có giá trị
            }
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message,
            data: {
                totalPrice: 0 // Trả về 0 trong trường hợp lỗi
            }
        });
    }
};

// Cancel a booking
exports.cancelBooking = async(req, res) => {
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
        await Seat.updateMany({
            screeningId: booking.screeningId,
            seatNumber: { $in: booking.seatNumbers }
        }, {
            status: 'available',
            reservedAt: null
        });

        res.json({
            success: true,
            message: 'Hủy đặt vé thành công',
            data: {
                ...booking.toObject(),
                totalPrice: booking.totalPrice || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a booking
exports.updateBooking = async(req, res) => {
    try {
        const { bookingId } = req.params;
        const { seatNumbers, code, paymentMethod } = req.body; // Thêm paymentMethod

        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'screeningId',
                populate: {
                    path: 'roomId',
                    select: 'name'
                }
            });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đặt vé'
            });
        }

        // Only allow updates to pending bookings
        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể cập nhật đặt vé đang chờ thanh toán'
            });
        }

        // If updating seats, validate availability and recalculate totalPrice
        if (seatNumbers) {
            // Kiểm tra số lượng ghế tối đa
            if (seatNumbers.length > 4) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn chỉ có thể đặt tối đa 4 ghế trong một lần đặt'
                });
            }

            // Kiểm tra sự tồn tại của ghế
            const seats = await Seat.find({
                screeningId: booking.screeningId,
                seatNumber: { $in: seatNumbers }
            });

            if (seats.length !== seatNumbers.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Một hoặc nhiều ghế không tồn tại'
                });
            }

            // Kiểm tra ghế đã được đặt chưa
            const existingBookings = await Booking.find({
                screeningId: booking.screeningId,
                seatNumbers: { $in: seatNumbers },
                _id: { $ne: bookingId },
                paymentStatus: { $in: ['pending', 'paid'] }
            });

            if (existingBookings.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Một hoặc nhiều ghế đã được đặt'
                });
            }

            // Xác định ghế cũ cần giải phóng và ghế mới cần đặt
            const oldSeats = booking.seatNumbers.filter(seat => !seatNumbers.includes(seat));
            const newSeats = seatNumbers.filter(seat => !booking.seatNumbers.includes(seat));

            // Kiểm tra quy tắc ghế lẻ
            const allSeats = await Seat.find({
                screeningId: booking.screeningId,
                status: { $in: ['available', 'booked', 'reserved'] }
            });

            // Organize seats by row
            const seatsByRow = {};
            allSeats.forEach(seat => {
                const row = seat.seatNumber.charAt(0);
                if (!seatsByRow[row]) {
                    seatsByRow[row] = [];
                }
                seatsByRow[row].push({
                    seatNumber: seat.seatNumber,
                    status: seat.status,
                    numericPart: parseInt(seat.seatNumber.substring(1))
                });
            });

            // Sort seats in each row
            Object.keys(seatsByRow).forEach(row => {
                seatsByRow[row].sort((a, b) => a.numericPart - b.numericPart);
            });

            // Group selected seats by row
            const selectedSeatsByRow = {};
            seatNumbers.forEach(seatNumber => {
                const row = seatNumber.charAt(0);
                if (!selectedSeatsByRow[row]) {
                    selectedSeatsByRow[row] = [];
                }
                selectedSeatsByRow[row].push(seatNumber);
            });

            // Kiểm tra ghế lẻ cho mỗi hàng
            let singleSeatViolation = false;
            let violationDetails = '';

            Object.keys(selectedSeatsByRow).forEach(row => {
                if (singleSeatViolation) return;

                const rowSeats = seatsByRow[row];
                const selectedInRow = selectedSeatsByRow[row];

                for (const seatNum of selectedInRow) {
                    const currentSeat = rowSeats.find(s => s.seatNumber === seatNum);
                    const currentIndex = rowSeats.indexOf(currentSeat);

                    const isSeatOccupied = (index) => {
                        if (index < 0 || index >= rowSeats.length) return true;
                        const seat = rowSeats[index];
                        return seat.status === 'booked' || (seat.status === 'reserved' && !oldSeats.includes(seat.seatNumber));
                    };

                    const isSelectedSeat = (index) => {
                        if (index < 0 || index >= rowSeats.length) return false;
                        return selectedInRow.includes(rowSeats[index].seatNumber);
                    };

                    let leftBound = currentIndex;
                    while (leftBound > 0 && !isSeatOccupied(leftBound - 1)) {
                        leftBound--;
                    }

                    let rightBound = currentIndex;
                    while (rightBound < rowSeats.length - 1 && !isSeatOccupied(rightBound + 1)) {
                        rightBound++;
                    }

                    for (let i = leftBound; i <= rightBound; i++) {
                        if (isSelectedSeat(i)) continue;

                        if (rowSeats[i].status === 'available' || oldSeats.includes(rowSeats[i].seatNumber)) {
                            const leftSideOccupied = i === 0 || isSeatOccupied(i - 1) || isSelectedSeat(i - 1);
                            const rightSideOccupied = i === rowSeats.length - 1 || isSeatOccupied(i + 1) || isSelectedSeat(i + 1);

                            if (leftSideOccupied && rightSideOccupied) {
                                singleSeatViolation = true;
                                violationDetails = `Không thể để ghế ${rowSeats[i].seatNumber} thành ghế đơn lẻ`;
                                return;
                            }
                        }
                    }
                }
            });

            if (singleSeatViolation) {
                return res.status(400).json({
                    success: false,
                    message: violationDetails
                });
            }

            // Giải phóng ghế cũ
            if (oldSeats.length > 0) {
                await Seat.updateMany({
                    screeningId: booking.screeningId,
                    seatNumber: { $in: oldSeats }
                }, {
                    status: 'available',
                    reservedAt: null
                });
            }

            // Đặt ghế mới
            if (newSeats.length > 0) {
                await Seat.updateMany({
                    screeningId: booking.screeningId,
                    seatNumber: { $in: newSeats }
                }, {
                    status: 'reserved',
                    reservedAt: new Date()
                });
            }

            booking.seatNumbers = seatNumbers;

            // Tính lại giá tiền
            const screening = await Screening.findById(booking.screeningId);
            if (screening) {
                let newTotalPrice = screening.ticketPrice * seatNumbers.length;

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
                        newTotalPrice = Math.round(newTotalPrice / 1000) * 1000;
                    }
                }

                booking.totalPrice = newTotalPrice;
            }
        }

        // Xử lý mã khuyến mãi mới (nếu có)
        if (code !== undefined) {
            const newCode = code ? code.trim().toUpperCase() : null;
            if (newCode !== booking.code) {
                if (newCode) {
                    const promotion = await Promotion.findOne({
                        code: newCode,
                        isActive: true,
                        status: 'approved',
                        startDate: { $lte: new Date() },
                        endDate: { $gte: new Date() }
                    });

                    if (!promotion) {
                        return res.status(400).json({
                            success: false,
                            message: 'Mã khuyến mãi không hợp lệ'
                        });
                    }

                    // Kiểm tra số lượng đã sử dụng
                    if (promotion.currentUsage >= promotion.maxUsage) {
                        return res.status(400).json({
                            success: false,
                            message: 'Mã khuyến mãi đã hết lượt sử dụng'
                        });
                    }

                    // Kiểm tra xem user đã sử dụng mã khuyến mãi này chưa
                    const existingUsage = await PromotionUsage.findOne({
                        userId: booking.userId,
                        promotionId: promotion._id
                    });

                    if (existingUsage) {
                        return res.status(400).json({
                            success: false,
                            message: 'Bạn đã sử dụng mã khuyến mãi này rồi'
                        });
                    }

                    booking.code = newCode;

                    // Tính lại giá với mã khuyến mãi mới
                    const screening = await Screening.findById(booking.screeningId);
                    let newTotalPrice = screening.ticketPrice * booking.seatNumbers.length;

                    if (promotion.type === 'percent') {
                        newTotalPrice = newTotalPrice * (1 - promotion.value / 100);
                    } else if (promotion.type === 'fixed') {
                        newTotalPrice = Math.max(0, newTotalPrice - promotion.value);
                    }
                    booking.totalPrice = Math.round(newTotalPrice / 1000) * 1000;
                } else {
                    booking.code = null;
                    const screening = await Screening.findById(booking.screeningId);
                    booking.totalPrice = screening.ticketPrice * booking.seatNumbers.length;
                }
            }
        }

        // Nếu truyền paymentMethod thì cập nhật
        if (paymentMethod) {
            booking.paymentMethod = paymentMethod;
        }

        // Lưu các thay đổi
        await booking.save();

        // Sau khi await booking.save();
        if (activeBookingTimeouts[bookingId]) {
            clearTimeout(activeBookingTimeouts[bookingId]);
            delete activeBookingTimeouts[bookingId];
        }
        activeBookingTimeouts[bookingId] = setTimeout(async() => {
            try {
                const currentBooking = await Booking.findById(bookingId);
                if (currentBooking && currentBooking.paymentStatus === 'pending') {
                    const transaction = await Transaction.findOne({
                        bookingId: bookingId,
                        status: 'success'
                    });

                    if (!transaction) {
                        currentBooking.paymentStatus = 'cancelled';
                        await currentBooking.save();

                        // Lấy danh sách ghế hiện tại của booking để nhả
                        await Seat.updateMany({
                            screeningId: currentBooking.screeningId,
                            seatNumber: { $in: currentBooking.seatNumbers }
                        }, {
                            status: 'available',
                            reservedAt: null
                        });

                        console.log(`Booking ${bookingId} automatically cancelled after 2 minutes due to no payment (after update)`);
                    }
                }
            } catch (error) {
                console.error('Error in auto-cancellation (update):', error);
            } finally {
                delete activeBookingTimeouts[bookingId];
            }
        }, 2 * 60 * 1000); // 2 phút

        // Trả về booking đã cập nhật
        const updatedBooking = await Booking.findById(bookingId)
            .populate({
                path: 'screeningId',
                populate: {
                    path: 'roomId',
                    select: 'name'
                }
            });

        res.json({
            success: true,
            message: 'Cập nhật đặt vé thành công',
            data: {
                ...updatedBooking.toObject(),
                totalPrice: updatedBooking.totalPrice || 0
            }
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật đặt vé',
            error: error.message
        });
    }
};

// Get user's bookings
exports.getUserBookings = async(req, res) => {

    try {
        const userId = req.user.userId; // Changed from _id to userId to match JWT payload

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in request'
            });
        }

        // Ensure we're querying with string ID if needed
        const query = {
            userId: userId,
            paymentStatus: 'paid'
        };

        // First find bookings without populate to verify query
        const rawBookings = await Booking.find(query);

        // Now try with populate
        const bookings = await Booking.find(query)
            .populate({
                path: 'screeningId',
                populate: [{
                        path: 'movieId',
                        select: 'title poster'
                    },
                    {
                        path: 'roomId',
                        select: 'name',
                        populate: {
                            path: 'theaterId',
                            select: 'name'
                        }
                    }
                ]
            })
            .sort({ createdAt: -1 });

        if (bookings.length === 0) {
            return res.json({
                success: true,
                message: 'Không tìm thấy đơn đặt vé nào',
                data: {
                    bookings: []
                }
            });
        }
        const bookingsWithQrCode = await Promise.all(bookings.map(async booking => {
            try {
                if (!booking.screeningId) {
                    console.log('Warning: screening not found for booking:', booking._id);
                    return null;
                }

                const qrContent = [
                    `Mã đặt vé: ${booking._id.toString()}`,
                    `Phim: ${booking.screeningId.movieId?.title || 'N/A'}`,
                    `Thời gian chiếu phim: ${booking.screeningId.startTime ? new Date(booking.screeningId.startTime).toLocaleString('vi-VN') : 'N/A'}`,
                    `Phòng: ${booking.screeningId.roomId?.name || 'N/A'}`,
                    `Ghế: ${booking.seatNumbers.join(', ')}`,
                    `Tổng tiền: ${(booking.totalPrice || 0).toLocaleString('vi-VN')} VND`,
                    `Phương thức thanh toán: ${booking.paymentMethod || 'Chưa xác định'}` // Thêm dòng này
                ].join('\n');

                const qrCodeDataUrl = await QRCode.toDataURL(qrContent);

                const transformedBooking = {
                    ...booking.toObject(),
                    movieTitle: booking.screeningId && booking.screeningId.movieId ? booking.screeningId.movieId.title : 'N/A',
                    moviePoster: booking.screeningId && booking.screeningId.movieId ? booking.screeningId.movieId.poster : 'N/A',
                    roomName: booking.screeningId && booking.screeningId.roomId ? booking.screeningId.roomId.name : 'N/A',
                    theaterName: (booking.screeningId && booking.screeningId.roomId && booking.screeningId.roomId.theaterId && booking.screeningId.roomId.theaterId.name) ? booking.screeningId.roomId.theaterId.name : 'N/A',
                    screeningTime: booking.screeningId ? booking.screeningId.startTime : null,
                    seatNumbers: booking.seatNumbers,
                    totalPrice: booking.totalPrice || 0,
                    bookingDate: booking.createdAt,
                    paymentMethod: booking.paymentMethod || 'Chưa xác định', // Thêm trường này vào kết quả trả về
                    qrCodeDataUrl
                };
                return transformedBooking;
            } catch (error) {
                console.error('Error transforming booking:', error);
                return null;
            }
        })); // Filter out any null values from failed transformations
        const validBookings = bookingsWithQrCode.filter(booking => booking !== null);

        res.json({
            succs: true,
            message: 'Lấy danh sách vé đã đặt thành công',
            data: {
                bookings: validBookings
            }
        });
    } catch (error) {
        console.error('Error in getUserBookings:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            data: {
                bookings: [],
                totalPrice: 0
            }
        });
    }
};

// Update booking status after successful payment
exports.updateBookingStatus = async(req, res) => {
    try {
        const { bookingId } = req.params;
        const { paymentMethod } = req.body; // Thêm paymentMethod
        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'screeningId',
                populate: [{
                        path: 'movieId',
                        select: 'title poster'
                    },
                    {
                        path: 'roomId',
                        select: 'name',
                        populate: {
                            path: 'theaterId',
                            select: 'name'
                        }
                    }
                ]
            });

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy đặt vé' });
        }

        // Kiểm tra trạng thái hiện tại của booking
        if (booking.paymentStatus === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Không thể thanh toán cho đặt vé đã bị hủy. Thời gian giữ ghế đã hết hạn.'
            });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Đặt vé này đã được thanh toán'
            });
        }

        // Kiểm tra xem ghế vẫn còn khả dụng không
        const seats = await Seat.find({
            screeningId: booking.screeningId,
            seatNumber: { $in: booking.seatNumbers }
        });

        // Kiểm tra nếu có ghế nào đã bị đặt bởi người khác
        const unavailableSeats = seats.filter(seat =>
            seat.status === 'booked' ||
            (seat.status === 'reserved' &&
                seat.reservedAt &&
                new Date() - new Date(seat.reservedAt) < 2 * 60 * 1000 && // ghế được đặt dưới 2 phút
                (!booking._id.equals(seat.bookingId) && seat.bookingId)) // ghế không thuộc booking hiện tại
        );

        if (unavailableSeats.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể thanh toán vì ghế ${unavailableSeats.map(s => s.seatNumber).join(', ')} đã được đặt bởi người khác. Vui lòng chọn ghế khác.`
            });
        }

        // Cập nhật trạng thái đặt vé thành đã thanh toán
        booking.paymentStatus = 'paid';
        if (paymentMethod) booking.paymentMethod = paymentMethod; // Lưu paymentMethod nếu có
        await booking.save();

        // Nếu có sử dụng mã khuyến mãi, lưu thông tin sử dụng và cập nhật số lượng
        if (booking.promotionId) {
            try {
                // Tạo promotion usage
                await PromotionUsage.create({
                    userId: booking.userId,
                    promotionId: booking.promotionId,
                    bookingId: booking._id
                });

                // Cập nhật số lượng sử dụng của promotion
                await Promotion.findByIdAndUpdate(
                    booking.promotionId,
                    { $inc: { currentUsage: 1 } },
                    { new: true }
                );
            } catch (error) {
                console.error('Lỗi khi lưu thông tin sử dụng mã khuyến mãi:', error);
                // Không throw error ở đây vì booking đã thanh toán thành công
            }
        }

        // Xóa thời gian chờ tự động hủy nếu nó tồn tại
        if (activeBookingTimeouts[bookingId]) {
            clearTimeout(activeBookingTimeouts[bookingId]);
            delete activeBookingTimeouts[bookingId];
            console.log(`Đã xóa thời gian chờ tự động hủy cho đặt vé ${bookingId}`);
        }

        // Cập nhật tg thái ghế thành đã đặt
        await Seat.updateMany({
            screeningId: booking.screeningId,
            seatNumber: { $in: booking.seatNumbers }
        }, {
            status: 'booked',
            reservedAt: null
        });

        // Tạo mã QR cho đặt vé đã xác nhận
        const qrContent = [
            `Mã khuyến mãi: ${booking._id.toString()}`,
            `Phim: ${booking.screeningId.movieId.title}`,
            `Thời gian chiếu phim: Ngày: ${new Date(booking.screeningId.startTime).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} vào lúc: ${new Date(booking.screeningId.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })}`,
            `Phòng: ${booking.screeningId.roomId.name}`,
            `Ghế: ${booking.seatNumbers.join(', ')}`,
            `Tổng tiền: ${booking.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`,
            `Ngày đặt: Ngày: ${new Date(booking.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} vào lúc: ${new Date(booking.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })}`
        ].join('\n');
        const qrCodeDataUrl = await QRCode.toDataURL(qrContent);

        // Tạo dữ liệu cho email trước khi gửi
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
        // Lấy thông tin user trước khi gửi email
        const user = await User.findById(booking.userId);
        // Gửi email xác nhận vé (atomic update để chống gửi 2 lần)
        const updatedBooking = await Booking.findOneAndUpdate(
            { _id: booking._id, emailSent: false },
            { $set: { emailSent: true } },
            { new: true }
        );
        if (updatedBooking && user && user.email) {
            await sendMovieTicket(user.email, ticketData);
            console.log('Đã gửi email xác nhận vé sau khi thanh toán thành công cho:', user.email);
        } else {
            console.log('Email đã được gửi trước đó cho booking này:', booking._id);
        }

        res.json({
            message: 'Cập nhật trạng thái đặt vé thành đã thanh toán thành công',
            booking: {
                ...booking.toObject(), // Chuyển đổi tài liệu mongoose thành đối tượng thuần
                movieTitle: booking.screeningId && booking.screeningId.movieId ? booking.screeningId.movieId.title : 'N/A',
                moviePoster: booking.screeningId && booking.screeningId.movieId ? booking.screeningId.movieId.poster : 'N/A',
                roomName: booking.screeningId && booking.screeningId.roomId ? booking.screeningId.roomId.name : 'N/A',
                theaterName: (booking.screeningId && booking.screeningId.roomId && booking.screeningId.roomId.theaterId && booking.screeningId.roomId.theaterId.name) ? booking.screeningId.roomId.theaterId.name : 'N/A',
                screeningTime: booking.screeningId ? booking.screeningId.startTime : null,
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
exports.sendTicketEmail = async(req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.userId;

        console.log('Sending ticket email for booking:', bookingId);
        console.log('User ID:', userId);

        // Tìm booking và populate các thông tin cần thiết
        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'screeningId',
                populate: [{
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

// API cho admin lấy tất cả booking và lọc theo trạng thái
exports.adminGetBookings = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }
        const { paymentStatus, screeningId } = req.query;
        const filter = {};
        // Chỉ lọc các trạng thái hợp lệ
        const validStatuses = ['pending', 'paid', 'cancelled'];
        if (paymentStatus && validStatuses.includes(paymentStatus)) {
            filter.paymentStatus = paymentStatus;
        }
        if (screeningId) {
            filter.screeningId = screeningId;
        }
        // Lấy tất cả booking, có thể lọc theo trạng thái
        const bookings = await Booking.find(filter)
            .populate('userId', 'name email')
            .populate({
                path: 'screeningId',
                populate: { path: 'roomId', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            message: 'Lấy danh sách đặt vé cho admin thành công',
            data: { bookings }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};