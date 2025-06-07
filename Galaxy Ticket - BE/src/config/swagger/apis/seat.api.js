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
 * /api/seats/reserve:
 *   post:
 *     summary: Đặt giữ ghế
 *     tags: [Seats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - screeningId
 *               - seatNumber
 *             properties:
 *               screeningId:
 *                 type: string
 *               seatNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đặt giữ ghế thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 seat:
 *                   $ref: '#/components/schemas/Seat'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy ghế hoặc ghế đã được đặt
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/seats/status:
 *   get:
 *     summary: Kiểm tra trạng thái ghế
 *     tags: [Seats]
 *     parameters:
 *       - in: query
 *         name: screeningId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của suất chiếu
 *       - in: query
 *         name: seatNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Số ghế
 *     responses:
 *       200:
 *         description: Lấy trạng thái ghế thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [available, reserved, booked]
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy ghế
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/seats/release-expired:
 *   post:
 *     summary: Giải phóng các ghế hết hạn
 *     tags: [Seats]
 *     responses:
 *       200:
 *         description: Giải phóng ghế thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 modifiedCount:
 *                   type: number
 *       500:
 *         description: Lỗi server
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
 *         description: ID của suất chiếu
 *     responses:
 *       200:
 *         description: Lấy danh sách ghế thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 seats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Seat'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
