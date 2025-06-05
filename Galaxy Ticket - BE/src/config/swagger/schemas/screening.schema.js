/**
 * @swagger
 * components:
 *   schemas:
 *     Screening:
 *       type: object
 *       required:
 *         - movieId
 *         - roomId
 *         - startTime
 *         - endTime
 *         - ticketPrice
 *       properties:
 *         _id:
 *           type: string
 *           example: '665f7c0b8e1b1c8a1b8e1b1c8'
 *           description: ID duy nhất của suất chiếu
 *         movieId:
 *           type: string
 *           example: '665f7c0b8e1b1c8a1b8e1b1c9'
 *           description: ID của phim được chiếu (tham chiếu đến Movie)
 *         roomId:
 *           type: string
 *           example: '665f7c0b8e1b1c8a1b8e1b1d0'
 *           description: ID của phòng chiếu (tham chiếu đến Room)
 *         startTime:
 *           type: string
 *           format: date-time
 *           example: '2024-06-01T14:00:00.000Z'
 *           description: Thời gian bắt đầu suất chiếu (ISO 8601)
 *         endTime:
 *           type: string
 *           format: date-time
 *           example: '2024-06-01T16:00:00.000Z'
 *           description: Thời gian kết thúc suất chiếu (ISO 8601)
 *         status:
 *           type: boolean
 *           example: true
 *           description: "Trạng thái suất chiếu (true = hoạt động, false = hủy hoặc không hoạt động)"
 *         ticketPrice:
 *           type: number
 *           example: 90000
 *           description: Giá vé cho suất chiếu (VNĐ)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: '2024-05-30T10:00:00.000Z'
 *           description: Thời điểm tạo suất chiếu (tự động sinh bởi hệ thống)
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: '2024-05-30T10:00:00.000Z'
 *           description: Thời điểm cập nhật suất chiếu gần nhất (tự động sinh bởi hệ thống)
 */