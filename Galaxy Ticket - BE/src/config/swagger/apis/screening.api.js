// Screening API paths for Swagger

/**
 * @swagger
 * /api/screenings:
 *   get:
 *     summary: Lấy danh sách tất cả suất chiếu
 *     tags: [Screening]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by approval status
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Screening'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *   post:
 *     summary: Tạo suất chiếu mới
 *     tags: [Screening]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: 'object'
 *             properties:
 *               movieId: { type: 'string' }
 *               roomId: { type: 'string' }
 *               theaterId: { type: 'string' }
 *               startTime: { type: 'string', format: 'date-time' }
 *             required: ['movieId', 'roomId', 'theaterId', 'startTime']
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
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *           example:
 *             movieId: "6846857f0d17c8209168bd3f"
 *             roomId: "6839e35b5806bb8a2ce74c79"
 *             theaterId: "68497df8a38105eba105fa23"
 *             startTime: "2025-06-18T10:30:18.754+00:00"
 *             ticketPrice: 90000
 *             status: "pending"
 *             rejectionReason: "string"
 *             approvedBy: "6843227067cd3d882f988f4a"
 *             isActive: true
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * @swagger
 * /api/screenings/public:
 *   get:
 *     summary: Lấy danh sách suất chiếu công khai (public)
 *     description: "Chỉ trả về các suất chiếu đã được duyệt (status: approved). Không thể xem các suất chiếu ở trạng thái khác qua API này. Xử lý trực tiếp trong route, có thể lọc theo movieId, theaterId, startTime."
 *     tags: [Screening]
 *     parameters:
 *       - in: query
 *         name: movieId
 *         schema:
 *           type: string
 *         description: Lọc theo ID phim
 *       - in: query
 *         name: theaterId
 *         schema:
 *           type: string
 *         description: Lọc theo ID rạp chiếu
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Lấy các suất chiếu bắt đầu từ thời điểm này trở đi
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu công khai
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Screening'
 *                 count:
 *                   type: integer
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * /api/screenings/member:
 *   get:
 *     summary: Lấy danh sách suất chiếu cho member (cần đăng nhập)
 *     description: "Chỉ trả về các suất chiếu đã được duyệt (status: approved) cho member đã xác thực. Không thể xem các suất chiếu ở trạng thái khác qua API này. Xử lý trực tiếp trong route."
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu cho member
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Screening'
 *                 count:
 *                   type: integer
 *       401:
 *         description: Không xác thực hoặc không có quyền
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */