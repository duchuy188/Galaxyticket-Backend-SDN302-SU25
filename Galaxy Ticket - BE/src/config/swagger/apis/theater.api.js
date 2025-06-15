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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Theater'
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
 *               $ref: '#/components/schemas/Theater'
 *       400:
 *         description: Invalid data
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
 *               $ref: '#/components/schemas/Theater'
 *       404:
 *         description: Theater not found
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
 *               $ref: '#/components/schemas/Theater'
 *       404:
 *         description: Theater not found
 *
 *   delete:
 *     summary: Delete a theater
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
 *       404:
 *         description: Theater not found
 */
