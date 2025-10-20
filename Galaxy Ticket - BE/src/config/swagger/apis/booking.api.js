/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - userId
 *         - screeningId
 *         - seatNumbers
 *         - totalPrice
 *         - paymentStatus
 *       properties:
 *         _id:
 *           type: string
 *           description: The booking ID
 *         userId:
 *           type: string
 *           description: Reference to the User model
 *         screeningId:
 *           type: string
 *           description: Reference to the Screening model
 *         seatNumbers:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of selected seat numbers
 *         totalPrice:
 *           type: number
 *           minimum: 0
 *           description: Total price of the booking
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, cancelled]
 *           default: pending
 *           description: Current payment status of the booking
 *         checkInStatus:
 *           type: string
 *           enum: [not_checked_in, checked_in]
 *           default: not_checked_in
 *           description: Check-in status of the booking
 *         checkedInAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Timestamp when the booking was checked in
 *         checkedInBy:
 *           type: string
 *           nullable: true
 *           description: ID of the staff member who performed the check-in
 *         code:
 *           type: string
 *           nullable: true
 *           description: Promotion code applied to the booking (always uppercase, max 20 chars)
 *           maxLength: 20
 *           minLength: 1
 *           example: "PROMO2025"
 *         emailSent:
 *           type: boolean
 *           default: false
 *           description: Whether the booking confirmation email was sent
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Booking creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     BookingCreate:
 *       type: object
 *       required:
 *         - userId
 *         - screeningId
 *         - seatNumbers
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user making the booking
 *         screeningId:
 *           type: string
 *           description: ID of the screening to book
 *         seatNumbers:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of seat numbers to book
 *         code:
 *           type: string
 *           nullable: true
 *           description: Optional promotion code to apply
 *     
 *     BookingUpdate:
 *       type: object
 *       properties:
 *         seatNumbers:
 *           type: array
 *           items:
 *             type: string
 *           description: New array of seat numbers
 *         code:
 *           type: string
 *           nullable: true
 *           description: New promotion code to apply
 *     
 *     BookingError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *     
 *     CheckInRequest:
 *       type: object
 *       required:
 *         - qrData
 *       properties:
 *         qrData:
 *           type: string
 *           description: QR code data containing booking information
 *           example: "Mã đặt vé: 507f1f77bcf86cd799439011\nPhim: Avengers: Endgame\nThời gian chiếu phim: 15/01/2024 19:30:00\nPhòng: Phòng 1\nGhế: A1, A2\nTổng tiền: 200.000 VND\nPhương thức thanh toán: VNPay"
 *     
 *     CheckInResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the check-in was successful
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           properties:
 *             bookingId:
 *               type: string
 *               description: ID of the checked-in booking
 *             movieTitle:
 *               type: string
 *               description: Title of the movie
 *             seatNumbers:
 *               type: array
 *               items:
 *                 type: string
 *               description: Array of seat numbers
 *             screeningTime:
 *               type: string
 *               format: date-time
 *               description: Screening start time
 *             roomName:
 *               type: string
 *               description: Name of the screening room
 *             theaterName:
 *               type: string
 *               description: Name of the theater
 *             customerName:
 *               type: string
 *               description: Name of the customer
 *             checkedInAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when check-in was performed
 *             checkedInBy:
 *               type: string
 *               description: Name or email of the staff who performed check-in
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings with filters
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: screeningId
 *         schema:
 *           type: string
 *         description: Filter by screening ID
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, cancelled]
 *         description: Filter by payment status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lấy danh sách đặt vé thành công"
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingCreate'
 *     responses:
 *       201:
 *         description: Booking created successfully. You have 5 minutes to complete the payment.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Booking'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Booking created successfully. You have 5 minutes to complete the payment."
 *       400:
 *         description: Invalid input, missing required fields, seats already booked, or invalid promotion code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *       404:
 *         description: Screening not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *
 * /api/bookings/{bookingId}/cancel:
 *   post:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking to cancel
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hủy đặt vé thành công"
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Can only cancel pending bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *
 * /api/bookings/{bookingId}:
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingUpdate'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input, can only update pending bookings, seats already booked, or invalid promotion code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *
 * /api/bookings/user:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lấy danh sách vé đã đặt thành công"
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       movieTitle:
 *                         type: string
 *                       moviePoster:
 *                         type: string
 *                       roomName:
 *                         type: string
 *                       screeningTime:
 *                         type: string
 *                         format: date-time
 *                       seatNumbers:
 *                         type: array
 *                         items:
 *                           type: string
 *                       totalPrice:
 *                         type: number
 *                       bookingDate:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *
 * /api/bookings/admin:
 *   get:
 *     summary: Admin - Get all bookings with filters and status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, cancelled]
 *         description: Filter by payment status
 *       - in: query
 *         name: screeningId
 *         schema:
 *           type: string
 *         description: Filter by screening ID
 *     responses:
 *       200:
 *         description: List of bookings for admin retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lấy danh sách đặt vé cho admin thành công"
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingError'
 *
 * /api/bookings/check-in:
 *   post:
 *     summary: Check-in booking by QR code
 *     description: Allow staff to check-in customers using QR code from their tickets
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckInRequest'
 *     responses:
 *       200:
 *         description: Check-in successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckInResponse'
 *             examples:
 *               success:
 *                 summary: Successful check-in
 *                 value:
 *                   success: true
 *                   message: "Check-in thành công"
 *                   data:
 *                     bookingId: "507f1f77bcf86cd799439011"
 *                     movieTitle: "Avengers: Endgame"
 *                     seatNumbers: ["A1", "A2"]
 *                     screeningTime: "2024-01-15T19:30:00Z"
 *                     roomName: "Phòng 1"
 *                     theaterName: "Galaxy Cinema"
 *                     customerName: "Nguyễn Văn A"
 *                     checkedInAt: "2024-01-15T19:00:00Z"
 *                     checkedInBy: "staff@galaxy.com"
 *       400:
 *         description: Bad request - Invalid QR code, booking not paid, already checked-in, or movie finished
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalid_qr:
 *                       value: "QR code không hợp lệ"
 *                     not_paid:
 *                       value: "Vé chưa được thanh toán"
 *                     already_checked_in:
 *                       value: "Vé này đã được check-in rồi"
 *                     expired:
 *                       value: "Vé đã hết hạn sử dụng (phim đã chiếu xong)"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token không hợp lệ hoặc thiếu"
 *       403:
 *         description: Forbidden - Insufficient permissions (only staff can check-in)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không có quyền truy cập."
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy vé với QR code này"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi xử lý QR code"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
