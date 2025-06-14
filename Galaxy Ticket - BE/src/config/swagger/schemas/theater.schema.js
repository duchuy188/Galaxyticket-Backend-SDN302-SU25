/**
 * @swagger
 * components:
 *   schemas:
 *     Theater:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - phone
<<<<<<< HEAD
=======
 *         - description
>>>>>>> 2bc10c14e6a88c5905d9d713f4f3832713cbcb85
 *       properties:
 *         name:
 *           type: string
 *           description: Theater name
 *           minLength: 2
<<<<<<< HEAD
=======
 *           maxLength: 100
>>>>>>> 2bc10c14e6a88c5905d9d713f4f3832713cbcb85
 *           example: "Galaxy Nguyen Du"
 *         address:
 *           type: string
 *           description: Theater address
<<<<<<< HEAD
 *           example: "116 Nguyen Du Street, District 1, HCMC"
 *         phone:
 *           type: string
 *           description: Theater phone number (10 digits)
 *           pattern: "^[0-9]{10}$"
 *           example: "0283334444"
=======
 *           minLength: 10
 *           maxLength: 200
 *           example: "116 Nguyen Du Street, District 1, HCMC"
 *         phone:
 *           type: string
 *           description: Theater phone number (10 digits, starts with 0)
 *           pattern: "^0[0-9]{9}$"
 *           example: "0283334444"
 *         description:
 *           type: string
 *           description: Detailed description of the theater
 *           minLength: 50
 *           maxLength: 2000
 *           example: "Galaxy Nguyen Du features 5 modern screening rooms with over 1000 seats, including 1 3D-capable room and 4 2D rooms. Equipped with Dolby 7.1 sound system and high-quality digital projection."
>>>>>>> 2bc10c14e6a88c5905d9d713f4f3832713cbcb85
 *         status:
 *           type: boolean
 *           description: Theater status (active/inactive)
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Record last update timestamp
 */