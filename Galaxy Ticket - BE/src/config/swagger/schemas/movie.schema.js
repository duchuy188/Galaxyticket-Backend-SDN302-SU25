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
 *         - posterUrl
 *         - createdBy
 *         - producer
 *         - directors
 *         - actors
 *       properties:
 *         title:
 *           type: string
 *           description: Movie title
 *           example: "Avengers: Endgame"
 *         description:
 *           type: string
 *           description: Movie description
 *           example: "After Thanos wiped out half of all life in the universe..."
 *         genre:
 *           type: string
 *           description: Movie genre
 *           enum: [
 *             'Western', 'War', 'Family', 'Fantasy', 'Thriller', 'Comedy', 
 *             'Action', 'Crime', 'Animation', 'Horror', 'Romance', 'Historical',
 *             'Mystery', 'Musical', 'Adventure', 'Documentary', 'Drama', 'Mythology',
 *             'Sports', 'Biography'
 *           ]
 *         duration:
 *           type: number
 *           description: Movie duration in minutes
 *           minimum: 1
 *           example: 180
 *         posterUrl:
 *           type: string
 *           description: Movie poster URL (auto-generated from uploaded file)
 *           example: "https://res.cloudinary.com/..."
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
 *           type: string
 *           enum: ['pending', 'approved', 'rejected']
 *           default: 'pending'
 *           description: Approval status of the movie
 *         country:
 *           type: string
 *           description: Production country
 *           example: "USA"
 *         showingStatus:
 *           type: string
 *           description: Movie showing status
 *           enum: ['coming-soon', 'now-showing', 'ended']
 *           default: 'coming-soon'
 *           example: "now-showing"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Record last update timestamp
 *         createdBy:
 *           type: string
 *           description: ID of the staff member who created the movie
 *         approvedBy:
 *           type: string
 *           nullable: true
 *           description: ID of the manager who approved/rejected the movie
 *         rejectionReason:
 *           type: string
 *           nullable: true
 *           description: Reason for rejection if status is rejected
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Soft delete flag
 *         producer:
 *           type: string
 *           description: Movie producer/production company
 *           example: "Jungka Bangkok"
 *         directors:
 *           type: array
 *           description: List of movie directors
 *           items:
 *             type: string
 *           example: ["Pae Arak Amornsupasiri", "Wutthiphong Sukanin"]
 *         actors:
 *           type: array
 *           description: List of movie actors
 *           items:
 *             type: string
 *           example: ["Pae Arak Amornsupasiri", "Kittikun Chattongkum", "Paween Purijitpanya"]
 */