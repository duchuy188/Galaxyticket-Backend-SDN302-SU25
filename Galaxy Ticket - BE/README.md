# Galaxy Ticket Backend

## Thanh toán VNPay và Quản lý Booking

### 1. Luồng xử lý thanh toán

1. **Tạo booking mới**

   - Trạng thái ban đầu: `pending`
   - Thời gian giữ ghế: 5 phút
   - Tự động hủy nếu không thanh toán

2. **Thanh toán qua VNPay**

   - Tạo URL thanh toán với thông tin booking
   - VNPay xử lý thanh toán
   - Redirect về endpoint: `/api/vnpay/vnpay_return`

3. **Xử lý kết quả thanh toán**
   - Thành công (code: 00):
     - Cập nhật booking status: `paid`
     - Cập nhật ghế: `booked`
     - Gửi email xác nhận
     - Tạo mã QR
   - Thất bại:
     - Cập nhật booking status: `cancelled`
     - Reset ghế về `available`

### 2. Cấu hình VNPay

```javascript
const config = {
  vnp_TmnCode: "NU8CTA9G",
  vnp_HashSecret: "3D2NVR3HENGTW25POFRQP04FRHXJCIZK",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: "http://localhost:5000/api/vnpay/vnpay_return",
};
```

### 3. Trạng thái Booking

- **pending**: Đã tạo booking, chờ thanh toán
- **paid**: Đã thanh toán thành công
- **cancelled**: Đã hủy (do hết hạn hoặc thanh toán thất bại)

### 4. Trạng thái Ghế

- **available**: Ghế trống
- **reserved**: Đã đặt, chờ thanh toán
- **booked**: Đã thanh toán

### 5. API Endpoints

#### VNPay

- `POST /api/vnpay/create_payment_url`: Tạo URL thanh toán
- `GET /api/vnpay/vnpay_return`: Xử lý kết quả thanh toán

#### Booking

- `POST /api/bookings`: Tạo booking mới
- `GET /api/bookings`: Lấy danh sách booking
- `PUT /api/bookings/:id`: Cập nhật booking
- `DELETE /api/bookings/:id`: Hủy booking

### 6. Xử lý Email

- Gửi email xác nhận khi thanh toán thành công
- Bao gồm:
  - Thông tin vé
  - Mã QR
  - Chi tiết rạp/phim/ghế
  - Thời gian chiếu

### 7. Lưu ý quan trọng

1. **Timeout booking**:

   - Booking tự động hủy sau 5 phút nếu không thanh toán
   - Ghế được reset về trạng thái available

2. **Xác thực thanh toán**:

   - Kiểm tra chữ ký VNPay
   - Validate mã giao dịch
   - Kiểm tra trùng lặp thanh toán

3. **Xử lý lỗi**:
   - Log đầy đủ thông tin lỗi
   - Rollback trong trường hợp lỗi
   - Thông báo rõ ràng cho người dùng

### 8. Môi trường phát triển

```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
VNP_TMN_CODE=NU8CTA9G
VNP_HASH_SECRET=3D2NVR3HENGTW25POFRQP04FRHXJCIZK
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5000/api/vnpay/vnpay_return
```
