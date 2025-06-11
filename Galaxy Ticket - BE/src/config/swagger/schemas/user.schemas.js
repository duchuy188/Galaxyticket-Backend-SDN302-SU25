/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           description: Tên người dùng
 *         email:
 *           type: string
 *           format: email
 *           description: Email người dùng
 *         password:
 *           type: string
 *           format: password
 *           description: Mật khẩu
 *         phone:
 *           type: string
 *           description: Số điện thoại
 *         role:
 *           type: string
 *           enum: [admin, staff, member]
 *           description: Vai trò người dùng
 * 
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email người dùng
 *         password:
 *           type: string
 *           format: password
 *           description: Mật khẩu
 * 
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Thông báo kết quả
 *         token:
 *           type: string
 *           description: JWT token (chỉ có trong response đăng nhập)
 *         userId:
 *           type: string
 *           description: ID của người dùng (chỉ có trong response đăng ký)
 */
