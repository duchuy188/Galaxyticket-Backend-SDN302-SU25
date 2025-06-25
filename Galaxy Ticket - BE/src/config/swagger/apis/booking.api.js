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
 *         code:
 *           type: string
 *           nullable: true
 *           description: Promotion code applied to the booking
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
 */
