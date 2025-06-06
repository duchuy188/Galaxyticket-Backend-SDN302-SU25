/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - userId
 *         - screeningId
 *         - seatIds
 *         - totalPrice
 *         - paymentStatus
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the booking
 *         userId:
 *           type: string
 *           description: The id of the user making the booking
 *         screeningId:
 *           type: string
 *           description: The id of the screening
 *         seatIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of seat ids
 *         totalPrice:
 *           type: number
 *           description: Total price of the booking
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed]
 *           description: Status of the payment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the booking was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the booking was last updated
 */
