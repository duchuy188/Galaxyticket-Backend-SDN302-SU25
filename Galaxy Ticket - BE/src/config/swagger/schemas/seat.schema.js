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
 *         _id:
 *           type: string
 *           description: ID của ghế
 *           example: "507f1f77bcf86cd799439011"
 *         screeningId:
 *           type: string
 *           description: ID của suất chiếu
 *           example: "507f1f77bcf86cd799439011"
 *         seatNumber:
 *           type: string
 *           description: Số ghế
 *           example: "A1"
 *         status:
 *           type: string
 *           enum: [available, reserved, booked]
 *           description: Trạng thái ghế
 *           example: "available"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *           example: "2024-03-20T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật
 *           example: "2024-03-20T10:00:00Z"
 * 
 *     SeatResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Thông báo kết quả
 *           example: "Seat reserved successfully"
 *         seat:
 *           $ref: '#/components/schemas/Seat'
 * 
 *     SeatStatusResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Thông báo kết quả
 *           example: "Seat status retrieved successfully"
 *         status:
 *           type: string
 *           enum: [available, reserved, booked]
 *           description: Trạng thái ghế
 *           example: "available"
 * 
 *     SeatListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Thông báo kết quả
 *           example: "Seats retrieved successfully"
 *         seats:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Seat'
 * 
 *     ReleaseSeatsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Thông báo kết quả
 *           example: "Expired seats released successfully"
 *         modifiedCount:
 *           type: number
 *           description: Số lượng ghế đã được giải phóng
 *           example: 5
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Thông báo lỗi
 *           example: "Seat not found or already reserved/booked"
 *         error:
 *           type: string
 *           description: Chi tiết lỗi
 *           example: "Error message details"
 */
