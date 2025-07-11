/**
 * @swagger
 * tags:
 *   - name: Promotions
 *     description: Quản lý các chương trình khuyến mãi
 */

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Lấy danh sách promotion
 *     tags: [Promotions]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by approval status
 *     responses:
 *       200:
 *         description: Danh sách promotion
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promotion'
 *   post:
 *     summary: Tạo promotion mới
 *     tags: [Promotions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               value:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               maxUsage:
 *                 type: number
 *                 description: Số lượng user tối đa có thể sử dụng mã (mặc định là 5)
 *               isActive:
 *                 type: boolean
 *               createdBy:
 *                 type: string
 *             required:
 *               - code
 *               - name
 *               - type
 *               - value
 *               - startDate
 *               - endDate
 *     responses:
 *       201:
 *         description: Promotion đã tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *
 * /api/promotions/{id}:
 *   get:
 *     summary: Lấy promotion theo ID
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Promotion ID
 *     responses:
 *       200:
 *         description: Promotion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Cập nhật promotion
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Promotion ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               value:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               maxUsage:
 *                 type: number
 *                 description: Số lượng user tối đa có thể sử dụng mã (mặc định là 5)
 *               isActive:
 *                 type: boolean
 *             required:
 *               - code
 *               - name
 *               - type
 *               - value
 *               - startDate
 *               - endDate
 *     responses:
 *       200:
 *         description: Promotion đã cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Xóa promotion
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Promotion ID
 *     responses:
 *       200:
 *         description: Promotion đã xóa
 *       404:
 *         description: Not found
 *
 * /api/promotions/validate:
 *   post:
 *     summary: Kiểm tra mã giảm giá
 *     tags: [Promotions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Mã khuyến mãi
 *     responses:
 *       200:
 *         description: Promotion hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       404:
 *         description: |
 *           Mã không hợp lệ hoặc hết hạn. Có thể do một trong các lý do sau:
 *           - Mã không tồn tại
 *           - Mã hết hạn
 *           - Mã đã đạt giới hạn số lượng sử dụng (5 user)
 */