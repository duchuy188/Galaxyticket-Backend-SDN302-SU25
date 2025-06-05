/**
 * @swagger
 * /screenings:
 *   post:
 *     tags: ['Screening']
 *     summary: Tạo suất chiếu mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId: 
 *                 type: string
 *                 example: '60f7c0b8e1b1c8a1b8e1b1c8'
 *               roomId:
 *                 type: string
 *                 example: '60f7c0b8e1b1c8a1b8e1b1c9'
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-01T14:00:00.000Z'
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-01T16:00:00.000Z'
 *               status:
 *                 type: boolean
 *                 example: true
 *               ticketPrice:
 *                 type: number
 *                 example: 90000
 *             required:
 *               - movieId
 *               - roomId
 *               - startTime
 *               - endTime
 *               - ticketPrice
 *     responses:
 *       201:
 *         description: Tạo suất chiếu thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *
 *   get:
 *     tags: ['Screening']
 *     summary: Lấy danh sách suất chiếu
 *     parameters:
 *       - name: movieId
 *         in: query
 *         schema:
 *           type: string
 *       - name: roomId
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: startTime
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: endTime
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Screening'
 * 
 * /screenings/{id}:
 *   get:
 *     tags: ['Screening']
 *     summary: Lấy chi tiết suất chiếu
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết suất chiếu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       404:
 *         description: Không tìm thấy suất chiếu
 *
 *   put:
 *     tags: ['Screening']
 *     summary: Cập nhật suất chiếu
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: boolean
 *               ticketPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật suất chiếu thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy suất chiếu
 *
 *   delete:
 *     tags: ['Screening']
 *     summary: Xóa suất chiếu
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy suất chiếu
 *
 * /screenings/check-overlap:
 *   post:
 *     tags: ['Screening']
 *     summary: Kiểm tra trùng giờ suất chiếu trong cùng phòng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomId:
 *                 type: string
 *                 example: '60f7c0b8e1b1c8a1b8e1b1c9'
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-01T14:00:00.000Z'
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-01T16:00:00.000Z'
 *             required:
 *               - roomId
 *               - startTime
 *               - endTime
 *     responses:
 *       200:/**
 * @swagger
 * /screenings:
 *   post:
 *     tags: ['Screening']
 *     summary: Tạo suất chiếu mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId: 
 *                 type: string
 *                 example: '60f7c0b8e1b1c8a1b8e1b1c8'
 *               roomId:
 *                 type: string
 *                 example: '60f7c0b8e1b1c8a1b8e1b1c9'
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-01T14:00:00.000Z'
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-01T16:00:00.000Z'
 *               status:
 *                 type: boolean
 *                 example: true
 *               ticketPrice:
 *                 type: number
 *                 example: 90000
 *             required:
 *               - movieId
 *               - roomId
 *               - startTime
 *               - endTime
 *               - ticketPrice
 *     responses:
 *       201:
 *         description: Tạo suất chiếu thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *
 *   get:
 *     tags: ['Screening']
 *     summary: Lấy danh sách suất chiếu
 *     parameters:
 *       - name: movieId
 *         in: query
 *         schema:
 *           type: string
 *       - name: roomId
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: startTime
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: endTime
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Screening'
 * 
 * /screenings/{id}:
 *   get:
 *     tags: ['Screening']
 *     summary: Lấy chi tiết suất chiếu
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết suất chiếu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       404:
 *         description: Không tìm thấy suất chiếu
 *
 *   put:
 *     tags: ['Screening']
 *     summary: Cập nhật suất chiếu
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: boolean
 *               ticketPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật suất chiếu thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy suất chiếu
 *
 *   delete:
 *     tags: ['Screening']
 *     summary: Xóa suất chiếu
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy suất chiếu
 *
 * /screenings/check-overlap:
 *   post:
 *     tags: ['Screening']
 *     summary: Kiểm tra trùng giờ suất chiếu trong cùng phòng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomId:
 *                 type: string
 *                 example: '60f7c0b8e1b1c8a1b8e1b1c9'
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-01T14:00:00.000Z'
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-01T16:00:00.000Z'
 *             required:
 *               - roomId
 *               - startTime
 *               - endTime
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isOverlap:
 *                   type: boolean
 *                   example: false
 *                 overlappedScreenings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Screening'
 */