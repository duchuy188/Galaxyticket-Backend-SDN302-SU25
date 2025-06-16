/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Movie management APIs
 */

/**
 * @swagger
 * /api/movies/public:
 *   get:
 *     summary: Get list of approved movies (public access)
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: showingStatus
 *         schema:
 *           type: string
 *           enum: ['coming-soon', 'now-showing', 'ended']
 *         description: Filter by showing status
 *     responses:
 *       200:
 *         description: Returns only approved movies
 *
 * /api/movies:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get list of all movies (staff/manager access)
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
 *         description: Returns all movies with status
 *   
 *   post:
 *     security:
 *       - bearerAuth: []
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
 *                   'Phim Cao Bồi', 'Phim Chiến Tranh', 'Phim Gia Đình', 'Phim Giả Tưởng', 
 *                   'Phim Giật Gân', 'Phim Hài', 'Phim Hành Động', 'Phim Hình Sự', 
 *                   'Phim Hoạt Hình', 'Phim Kinh Dị', 'Phim Lãng Mạn', 'Phim Lịch Sử',
 *                   'Phim Bí Ẩn', 'Phim Âm Nhạc', 'Phim Phiêu Lưu', 'Phim Tài Liệu', 
 *                   'Phim Chính Kịch', 'Phim Thần Thoại', 'Phim Thể Thao', 'Phim Tiểu Sử'
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
 *     security:
 *       - bearerAuth: []
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
 *       404:
 *         description: Movie not found
 *   
 *   put:
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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