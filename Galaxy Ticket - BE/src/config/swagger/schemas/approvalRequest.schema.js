/**
 * @swagger
 * components:
 *   schemas:
 *     ApprovalRequest:
 *       type: object
 *       required:
 *         - staffId
 *         - type
 *         - requestData
 *         - referenceId
 *       properties:
 *         staffId:
 *           type: string
 *           description: ID of the staff member who created the request
 *         type:
 *           type: string
 *           enum: ['movie', 'promotion', 'screening']
 *           description: Type of content requiring approval
 *         requestData:
 *           type: object
 *           description: Data of the item requiring approval
 *         referenceId:
 *           type: string
 *           description: ID of the referenced item (movie/promotion/screening)
 *         status:
 *           type: string
 *           enum: ['pending', 'approved', 'rejected']
 *           default: 'pending'
 *         managerId:
 *           type: string
 *           description: ID of the manager who processed the request
 *           nullable: true
 *         rejectionReason:
 *           type: string
 *           description: Reason for rejection if status is 'rejected'
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of request creation
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last update
 */