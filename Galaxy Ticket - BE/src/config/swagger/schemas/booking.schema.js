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
 *           description: The auto-generated MongoDB ObjectId of the booking
 *         userId:
 *           type: string
 *           description: The MongoDB ObjectId of the user making the booking
 *         screeningId:
 *           type: string
 *           description: The MongoDB ObjectId of the screening being booked
 *         seatNumbers:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of seat numbers selected for the booking (must be at least 1 seat)
 *         totalPrice:
 *           type: number
 *           minimum: 0
 *           description: Total price of the booking after any promotions are applied
 *         code:
 *           type: string
 *           nullable: true
 *           description: Promotion code applied to the booking (if any)
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, cancelled]
 *           default: pending
 *           description: Current status of the booking payment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the booking was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the booking was last updated
 * 
 *     BookingCreate:
 *       type: object
 *       required:
 *         - userId
 *         - screeningId
 *         - seatNumbers
 *       properties:
 *         userId:
 *           type: string
 *           description: The MongoDB ObjectId of the user making the booking
 *         screeningId:
 *           type: string
 *           description: The MongoDB ObjectId of the screening being booked
 *         seatNumbers:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of seat numbers to book (must be at least 1 seat)
 *         code:
 *           type: string
 *           nullable: true
 *           description: Optional promotion code to apply to the booking
 * 
 *     BookingUpdate:
 *       type: object
 *       properties:
 *         seatNumbers:
 *           type: array
 *           items:
 *             type: string
 *           description: New array of seat numbers to book (must be at least 1 seat)
 *         code:
 *           type: string
 *           nullable: true
 *           description: New promotion code to apply to the booking
 * 
 *     BookingResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *         booking:
 *           $ref: '#/components/schemas/Booking'
 * 
 *     BookingError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: "One or more seats are already booked"
 */
