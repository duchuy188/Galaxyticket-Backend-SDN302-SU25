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
 *       properties:
 *         name:
 *           type: string
 *           description: Theater name
 *           minLength: 2
 *           example: "Galaxy Nguyen Du"
 *         address:
 *           type: string
 *           description: Theater address
 *           example: "116 Nguyen Du Street, District 1, HCMC"
 *         phone:
 *           type: string
 *           description: Theater phone number (10 digits)
 *           pattern: "^[0-9]{10}$"
 *           example: "0283334444"
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