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
 *           enum: [pending, paid, failed]
 *           default: pending
 *           description: Current payment status of the booking
 *         code:
 *           type: string
 *           nullable: true
 *           description: Booking code (if generated)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Booking creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/bookings:
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
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
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
 */
