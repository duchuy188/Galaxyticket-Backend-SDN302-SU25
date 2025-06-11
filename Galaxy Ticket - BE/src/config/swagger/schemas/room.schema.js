/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       required:
 *         - theaterId
 *         - name
 *         - totalSeats
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the room
 *         theaterId:
 *           type: string
 *           description: The id of the theater
 *         name:
 *           type: string
 *           description: The name of the room
 *         totalSeats:
 *           type: integer
 *           description: Total number of seats in the room
 *       example:
 *         _id: 60c72b2f9b1e8e001c8e4b8a
 *         theaterId: 60c72b2f9b1e8e001c8e4b89
 *         name: Room 1
 *         totalSeats: 100
 */