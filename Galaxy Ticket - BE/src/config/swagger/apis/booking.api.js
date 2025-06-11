/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management API
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
 *             type: object
 *             required:
 *               - userId
 *               - screeningId
 *               - seatIds
 *               - totalPrice
 *             properties:
 *               userId:
 *                 type: string
 *               screeningId:
 *                 type: string
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               totalPrice:
 *                 type: number
 *               promotionId:
 *                 type: string
 *                 nullable: true
 *                 description: Optional promotion ID to apply to the booking. Can be omitted, null, or empty string.
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Screening not found
 *       500:
 *         description: Server error
 * 
 * /api/bookings/{bookingId}/cancel:
 *   put:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Can only cancel pending bookings
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               totalPrice:
 *                 type: number
 *               promotionId:
 *                 type: string
 *                 nullable: true
 *                 description: Optional promotion ID to apply to the booking. Can be omitted, null, or empty string.
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input or can only update pending bookings
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
