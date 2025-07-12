/**
 * @swagger
 * components:
 *   schemas:
 *     Seat:
 *       type: object
 *       required:
 *         - screeningId
 *         - seatNumber
 *         - status
 *       properties:
 *         screeningId:
 *           type: string
 *           description: ID của suất chiếu
 *         seatNumber:
 *           type: string
 *           description: Số ghế
 *         status:
 *           type: string
 *           enum: [available, reserved, booked]
 *           description: Trạng thái ghế
 *       example:
 *         screeningId: "507f1f77bcf86cd799439011"
 *         seatNumber: "A1"
 *         status: "available"
 */

/**
 * @swagger
 * tags:
 *   name: Seats
 *   description: API quản lý ghế
 */

/**
 * @swagger
 * /api/seats/screening/{screeningId}:
 *   get:
 *     summary: Lấy danh sách ghế của một suất chiếu
 *     tags: [Seats]
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của suất chiếu (phải đúng định dạng ObjectId)
 *     responses:
 *       200:
 *         description: Seats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seats retrieved successfully"
 *                 seats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Seat'
 *       400:
 *         description: Invalid screening ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid screening ID format"
 *       500:
 *         description: Error retrieving seats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving seats"
 *                 error:
 *                   type: string
 */
