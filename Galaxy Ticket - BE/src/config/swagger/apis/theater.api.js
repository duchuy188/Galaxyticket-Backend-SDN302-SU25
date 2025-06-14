/**
 * @swagger
 * tags:
 *   name: Theaters
 *   description: Theater management APIs
 */

/**
 * @swagger
 * /api/theaters:
 *   get:
 *     summary: Get list of theaters
 *     tags: [Theaters]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
<<<<<<< HEAD
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Theater'
=======
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Theater'
>>>>>>> 2bc10c14e6a88c5905d9d713f4f3832713cbcb85
 *   
 *   post:
 *     summary: Create a new theater
 *     tags: [Theaters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Theater'
 *     responses:
 *       201:
 *         description: Theater created successfully
 *         content:
 *           application/json:
 *             schema:
<<<<<<< HEAD
 *               $ref: '#/components/schemas/Theater'
 *       400:
 *         description: Invalid data
=======
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Theater created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Theater'
 *       400:
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Phone number already exists
>>>>>>> 2bc10c14e6a88c5905d9d713f4f3832713cbcb85
 *
 * /api/theaters/{id}:
 *   get:
 *     summary: Get theater by ID
 *     tags: [Theaters]
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
<<<<<<< HEAD
 *               $ref: '#/components/schemas/Theater'
 *       404:
 *         description: Theater not found
=======
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Theater'
 *       404:
 *         description: Theater not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Theater not found
>>>>>>> 2bc10c14e6a88c5905d9d713f4f3832713cbcb85
 *   
 *   put:
 *     summary: Update theater information
 *     tags: [Theaters]
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
 *             $ref: '#/components/schemas/Theater'
 *     responses:
 *       200:
 *         description: Update successful
 *         content:
 *           application/json:
 *             schema:
<<<<<<< HEAD
 *               $ref: '#/components/schemas/Theater'
 *       404:
 *         description: Theater not found
 *
 *   delete:
 *     summary: Delete a theater
=======
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Theater updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Theater'
 *       404:
 *         description: Theater not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Theater not found
 *
 *   delete:
 *     summary: Delete a theater (soft delete)
>>>>>>> 2bc10c14e6a88c5905d9d713f4f3832713cbcb85
 *     tags: [Theaters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete successful
<<<<<<< HEAD
 *       404:
 *         description: Theater not found
=======
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Theater deleted successfully
 *       404:
 *         description: Theater not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Theater not found
>>>>>>> 2bc10c14e6a88c5905d9d713f4f3832713cbcb85
 */