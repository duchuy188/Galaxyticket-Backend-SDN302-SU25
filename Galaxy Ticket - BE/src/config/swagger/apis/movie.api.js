/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Movie management APIs
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get list of movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending', 'approved', 'rejected']
 *         description: Filter by approval status
 *       - in: query
 *         name: showingStatus
 *         schema:
 *           type: string
 *           enum: ['coming-soon', 'now-showing', 'ended']
 *         description: Filter by showing status
 *     responses:
 *       200:
 *         description: |
 *           For public: Returns only approved movies
 *           For staff/managers: Returns all movies with status
 *   
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *                 enum: [
 *                   'Western', 'War', 'Family', 'Fantasy', 'Thriller', 'Comedy',
 *                   'Action', 'Crime', 'Animation', 'Horror', 'Romance', 'Historical',
 *                   'Mystery', 'Musical', 'Adventure', 'Documentary', 'Drama', 'Mythology',
 *                   'Sports', 'Biography'
 *                 ]
 *               duration:
 *                 type: number
 *               poster:
 *                 type: string
 *                 format: binary
 *               trailerUrl:
 *                 type: string
 *               releaseDate:
 *                 type: string
 *                 format: date-time
 *               country:
 *                 type: string
 *               showingStatus:
 *                 type: string
 *                 enum: ['coming-soon', 'now-showing', 'ended']
 *                 description: Movie showing status
 *               createdBy:
 *                 type: string
 *                 required: true
 *                 description: ID of the staff member creating the movie
 *               producer:
 *                 type: string
 *                 description: Movie producer/production company
 *               directors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of movie directors
 *               actors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of movie actors
 *             required:
 *               - title
 *               - description
 *               - genre
 *               - duration
 *               - releaseDate
 *               - country
 *               - poster
 *               - producer
 *               - directors
 *               - actors
 *     responses:
 *       201:
 *         description: Movie created and pending approval
 *       400:
 *         description: Invalid data
 *
 * /api/movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     tags: [Movies]
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
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 *   
 *   put:
 *     summary: Update movie information
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *               duration:
 *                 type: number
 *               poster:
 *                 type: string
 *                 format: binary
 *               trailerUrl:
 *                 type: string
 *               releaseDate:
 *                 type: string
 *                 format: date-time
 *               country:
 *                 type: string
 *               showingStatus:
 *                 type: string
 *               createdBy:
 *                 type: string
 *               producer:
 *                 type: string
 *               directors:
 *                 type: array
 *                 items:
 *                   type: string
 *               actors:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: |
 *           If updating pending/rejected movie: Updated successfully
 *           If updating approved movie: Update submitted for approval
 *       404:
 *         description: Movie not found
 *
 *   delete:
 *     summary: Delete a movie
 *     tags: [Movies]
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
 *         description: Movie not found
 */