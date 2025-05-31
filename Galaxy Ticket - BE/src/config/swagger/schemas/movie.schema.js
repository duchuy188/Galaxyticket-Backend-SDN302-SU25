/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - genre
 *         - duration
 *         - releaseDate
 *         - country
 *       properties:
 *         title:
 *           type: string
 *           description: Movie title
 *           example: "Avengers: Endgame"
 *         description:
 *           type: string
 *           description: Movie description
 *           example: "After Thanos wiped out half of all life in the universe, the remaining Avengers must do what's necessary to undo the Mad Titan's deed."
 *         genre:
 *           type: string
 *           description: Movie genre
 *           enum: [
 *             'Western', 'War', 'Family', 'Fantasy', 'Thriller', 'Comedy', 
 *             'Action', 'Crime', 'Animation', 'Horror', 'Romance', 'Historical',
 *             'Mystery', 'Musical', 'Adventure', 'Documentary', 'Drama', 'Mythology',
 *             'Sports', 'Biography', 'Romance', 'Crime'
 *           ]
 *         duration:
 *           type: number
 *           description: Movie duration in minutes
 *           minimum: 1
 *           example: 180
 *         posterUrl:
 *           type: string
 *           description: Movie poster URL
 *           example: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBHRUaXOgHICRgdH9rGhKSWvITaE75mJe6og&s"
 *           nullable: true
 *         trailerUrl:
 *           type: string
 *           description: Movie trailer URL
 *           example: "https://youtu.be/TcMBFSGVi1c"
 *           nullable: true
 *         releaseDate:
 *           type: string
 *           format: date
 *           description: Movie release date
 *           example: "2024-03-27"
 *         status:
 *           type: boolean
 *           description: Movie status (active/inactive)
 *           default: true
 *         country:
 *           type: string
 *           description: Production country
 *           example: "USA"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Record last update timestamp
 */