// Screening API paths for Swagger

/**
 * @swagger
 * /api/screenings:
 *   get:
 *     summary: Lấy danh sách tất cả suất chiếu
 *     tags: [Screening]
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Screening'
 *   post:
 *     summary: Tạo suất chiếu mới
 *     tags: [Screening]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScreeningCreate'
 *     responses:
 *       201:
 *         description: Tạo thành công và chờ phê duyệt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Lỗi đầu vào hoặc trùng giờ chiếu
 *
 * /api/screenings/{id}:
 *   get:
 *     summary: Lấy chi tiết suất chiếu theo ID
 *     tags: [Screening]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Screening ID
 *     responses:
 *       200:
 *         description: Thông tin suất chiếu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       404:
 *         description: Không tìm thấy
 *   put:
 *     summary: Cập nhật suất chiếu
 *     tags: [Screening]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Screening ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScreeningUpdate'
 *     responses:
 *       200:
 *         description: |
 *           Nếu cập nhật screening pending/rejected: Cập nhật thành công
 *           Nếu cập nhật screening approved: Cập nhật đã được gửi để phê duyệt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Lỗi đầu vào hoặc trùng giờ chiếu
 *       404:
 *         description: Không tìm thấy
 *   delete:
 *     summary: Xóa (deactivate) suất chiếu
 *     tags: [Screening]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Screening ID
 *     responses:
 *       200:
 *         description: Đã xóa (deactivate) thành công
 *       404:
 *         description: Không tìm thấy
 */