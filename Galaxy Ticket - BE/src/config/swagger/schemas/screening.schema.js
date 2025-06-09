// Screening schema for Swagger

/**
 * @swagger
 * components:
 *   schemas:
 *     Screening:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60f7c0b8e1b1c8a1b8e1b1c8
 *         movieId:
 *           type: string
 *           description: ID phim
 *         roomId:
 *           type: string
 *           description: ID phòng chiếu
 *         startTime:
 *           type: string
 *           format: date-time
 *           example: 2024-06-01T14:00:00.000Z
 *         endTime:
 *           type: string
 *           format: date-time
 *           example: 2024-06-01T16:00:00.000Z
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *         rejectionReason:
 *           type: string
 *           nullable: true
 *         ticketPrice:
 *           type: number
 *           example: 90000
 *         createdBy:
 *           type: string
 *           description: ID nhân viên tạo
 *         approvedBy:
 *           type: string
 *           nullable: true
 *           description: ID manager phê duyệt
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ScreeningCreate:
 *       type: object
 *       required:
 *         - movieId
 *         - roomId
 *         - startTime
 *         - endTime
 *         - ticketPrice
 *         - createdBy
 *       properties:
 *         movieId:
 *           type: string
 *         roomId:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         ticketPrice:
 *           type: number
 *         createdBy:
 *           type: string
 *     ScreeningUpdate:
 *       type: object
 *       properties:
 *         movieId:
 *           type: string
 *         roomId:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         ticketPrice:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         rejectionReason:
 *           type: string
 *         approvedBy:
 *           type: string
 *         isActive:
 *           type: boolean
 */