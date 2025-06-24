/**
 * @swagger
 * tags:
 *   name: VNPay
 *   description: VNPay payment integration APIs
 */

/**
 * @swagger
 * /api/vnpay/create_payment_url:
 *   post:
 *     summary: Create VNPay payment URL
 *     tags: [VNPay]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - bookingId
 *               - userId
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in VND
 *                 example: 100000
 *               bookingId:
 *                 type: string
 *                 description: ID of the booking
 *                 example: "booking123"
 *               userId:
 *                 type: string
 *                 description: ID of the user making the payment
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 data:
 *                   type: string
 *                   description: VNPay payment URL
 *                   example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "99"
 *                 message:
 *                   type: string
 *                   example: "Error creating payment URL"
 */

/**
 * @swagger
 * /api/vnpay/vnpay_return:
 *   get:
 *     summary: Handle VNPay payment return
 *     tags: [VNPay]
 *     parameters:
 *       - name: vnp_ResponseCode
 *         in: query
 *         description: Response code from VNPay
 *         schema:
 *           type: string
 *         example: "00"
 *       - name: vnp_TxnRef
 *         in: query
 *         description: Transaction reference
 *         schema:
 *           type: string
 *         example: "133934"
 *       - name: vnp_Amount
 *         in: query
 *         description: Payment amount (in VND, multiplied by 100)
 *         schema:
 *           type: string
 *         example: "10000000"
 *       - name: vnp_OrderInfo
 *         in: query
 *         description: Order information
 *         schema:
 *           type: string
 *         example: "Thanh toan dat ve: 68597292ccb8a08197b15d11"
 *       - name: vnp_BankCode
 *         in: query
 *         description: Bank code
 *         schema:
 *           type: string
 *         example: "NCB"
 *       - name: vnp_PayDate
 *         in: query
 *         description: Payment date (format YYYYMMDDHHmmss)
 *         schema:
 *           type: string
 *         example: "20250624134107"
 *       - name: vnp_TransactionNo
 *         in: query
 *         description: VNPay transaction number
 *         schema:
 *           type: string
 *         example: "15034807"
 *       - name: vnp_SecureHash
 *         in: query
 *         description: Secure hash for verification
 *         schema:
 *           type: string
 *         example: "cc2e97487d74d5b269ec98c6a97ca0af8d20916c56ea6969cf806392bdbc2ab6"
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Response code (00 for success)
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   description: Response message
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       description: Order ID reference
 *                       example: "133934"
 *                     amount:
 *                       type: number
 *                       description: Payment amount in VND
 *                       example: 100000
 *                     orderInfo:
 *                       type: string
 *                       description: Order information
 *                       example: "Thanh toan dat ve: 68597292ccb8a08197b15d11"
 *                     payDate:
 *                       type: string
 *                       description: Payment date
 *                       example: "20250624134107"
 *                     transactionNo:
 *                       type: string
 *                       description: VNPay transaction number
 *                       example: "15034807"
 *                     transactionId:
 *                       type: string
 *                       description: Internal transaction ID
 *                       example: "65a4b8c9d0e1f2g3h4i5j6k7"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "99"
 *                 message:
 *                   type: string
 *                   example: "Error processing payment return"
 *                 error:
 *                   type: string
 *                   description: Error details
 */