/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Promotion ID
 *         code:
 *           type: string
 *           description: Mã khuyến mãi
 *         name:
 *           type: string
 *           description: Tên khuyến mãi
 *         description:
 *           type: string
 *           description: Ghi chú/diễn giải lý do/dịp khuyến mãi
 *         type:
 *           type: string
 *           enum: [percent, fixed]
 *           description: Kiểu khuyến mãi
 *         value:
 *           type: number
 *           description: Giá trị giảm
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Ngày bắt đầu
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Ngày kết thúc
 *         isActive:
 *           type: boolean
 *           description: Đang hoạt động hay không
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Trạng thái phê duyệt
 *         rejectionReason:
 *           type: string
 *           description: Lý do từ chối nếu bị reject
 *         createdBy:
 *           type: string
 *           description: Staff tạo promotion (UserId)
 *         approvedBy:
 *           type: string
 *           description: Manager phê duyệt (UserId)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - code
 *         - name
 *         - description
 *         - type
 *         - value
 *         - startDate
 *         - endDate
 *         - createdBy
 */