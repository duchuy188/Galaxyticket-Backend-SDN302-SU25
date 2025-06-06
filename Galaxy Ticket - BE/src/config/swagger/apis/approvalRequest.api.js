/**
 * @swagger
 * tags:
 *   name: Approval Requests
 *   description: Approval Request Management APIs
 */

/**
 * @swagger
 * /api/approval-requests:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       For Managers: Returns all requests
 *       For Staff: Returns only their own requests
 *     summary: Get list of approval requests
 *     tags: [Approval Requests]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ['movie', 'promotion', 'screening']
 *         description: Filter by request type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending', 'approved', 'rejected']
 *         description: Filter by approval status
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ApprovalRequest'
 *   
 *   post:
 *     summary: Create a new approval request
 *     tags: [Approval Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - requestData
 *               - referenceId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ['movie', 'promotion', 'screening']
 *               requestData:
 *                 type: object
 *               referenceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Invalid request data
 * 
 * /api/approval-requests/{id}:
 *   get:
 *     summary: Get approval request details
 *     tags: [Approval Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApprovalRequest'
 *       404:
 *         description: Request not found
 *
 *   put:
 *     summary: Approve or reject request
 *     tags: [Approval Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['approved', 'rejected']
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Update successful
 *       404:
 *         description: Request not found
 */