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
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           description: Theater name
 *           minLength: 2
 *           maxLength: 100
 *           example: "Galaxy Nguyen Du"
 *         address:
 *           type: string
 *           description: Theater address
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