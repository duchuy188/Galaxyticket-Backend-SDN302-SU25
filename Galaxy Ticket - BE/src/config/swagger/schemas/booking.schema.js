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
 *         promotionId:
 *           type: string
 *           nullable: true
 *           description: The MongoDB ObjectId of the promotion applied to the booking (if any)
 *         discountAmount:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Amount discounted from the total price by the promotion
 *         code:
 *           type: string
 *           nullable: true
 *           description: Promotion code applied to the booking (if any, always uppercase, max 20 chars)
 *           maxLength: 20
 *           minLength: 1
 *           example: "PROMO2025"
 *         emailSent:
 *           type: boolean
 *           default: false
 *           description: Whether the booking confirmation email was sent
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
 *         - screeningId
 *         - seatNumbers
 *       properties:
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
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           properties:
 *             booking:
 *               $ref: '#/components/schemas/Booking'
 * 
 *     BookingError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Always false for error responses
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn"
 */
