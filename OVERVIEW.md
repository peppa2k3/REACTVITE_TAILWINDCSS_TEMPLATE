# 📋 TỔNG QUAN DỰ ÁN

## Thông tin dự án

**Tên**: Fullstack Authentication App
**Stack**: MERN (MongoDB, Express, React, Node.js)
**Frontend**: React 18 + Vite + Tailwind CSS + Axios
**Backend**: Express.js + MongoDB + JWT + Passport.js
**Mục đích**: Hệ thống xác thực và quản lý người dùng hoàn chỉnh

---

## ✨ Tính năng đã triển khai

### 🔐 Authentication (Xác thực)

1. **Đăng nhập (Login)**
   - ✅ Email và password
   - ✅ Remember Me (lưu phiên đăng nhập)
   - ✅ Google OAuth 2.0
   - ✅ Validation form
   - ✅ Error handling

2. **Đăng ký (Register)**
   - ✅ Form đầy đủ: Full Name, Email, Phone, Password
   - ✅ Validation toàn diện (frontend + backend)
   - ✅ Confirm password matching
   - ✅ Gửi OTP qua email để xác thực
   - ✅ Đăng ký bằng Google
   - ✅ Password hashing với bcrypt

3. **Xác thực Email**
   - ✅ OTP 6 số
   - ✅ Expires sau 10 phút
   - ✅ Resend OTP
   - ✅ Gửi qua Nodemailer

4. **Quên mật khẩu (Forgot Password)**
   - ✅ Nhập email
   - ✅ Nhận OTP qua email
   - ✅ Đặt mật khẩu mới
   - ✅ OTP verification

5. **Google OAuth**
   - ✅ Login with Google
   - ✅ Sign up with Google
   - ✅ Tự động tạo user mới hoặc link với account hiện có
   - ✅ Passport.js integration

### 🛡️ Authorization (Phân quyền)

1. **Public Routes** (Không cần đăng nhập)
   - `/login` - Trang đăng nhập
   - `/register` - Trang đăng ký
   - `/verify-email` - Xác thực email
   - `/forgot-password` - Quên mật khẩu
   - `/reset-password` - Đặt mật khẩu mới

2. **Private Routes** (Cần đăng nhập)
   - `/home` - Trang chủ hiển thị "Hello World"
   - `/profile` - Thông tin cá nhân (placeholder)

3. **Admin Routes** (Cần đăng nhập + role admin)
   - `/admin/users` - Danh sách tất cả users
   - `/admin/users/:id` - Chỉnh sửa thông tin user

### 🎨 UI/UX Features

- ✅ Responsive design với Tailwind CSS
- ✅ Loading states
- ✅ Toast notifications (success/error)
- ✅ Form validation messages
- ✅ Beautiful gradients và modern design
- ✅ Icons từ Lucide React
- ✅ Smooth transitions

### 🔒 Security Features

- ✅ JWT Access Token (7 days)
- ✅ JWT Refresh Token (30 days)
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Input validation (express-validator)
- ✅ Protected API routes với middleware
- ✅ CORS configuration
- ✅ OTP expiration
- ✅ Axios interceptors cho token

---

## 📂 Cấu trúc Files

### Backend Structure

```
app/QUICK_START.md
app/README.md

app/backend/config/database.js
app/backend/config/passport.js
app/backend/controllers/adminController.js
app/backend/controllers/authController.js
app/backend/middleware/auth.js
app/backend/middleware/validate.js
app/backend/models/User.js
app/backend/package.json
app/backend/routes/adminRoutes.js
app/backend/routes/authRoutes.js
app/backend/server.js
app/backend/utils/helpers.js
app/backend/validators/authValidator.js

app/frontend/package.json
app/frontend/postcss.config.js
app/frontend/src/App.jsx
app/frontend/src/components/ProtectedRoute.jsx
app/frontend/src/contexts/AuthContext.jsx
app/frontend/src/main.jsx
app/frontend/src/pages/AdminUsers.jsx
app/frontend/src/pages/EditUser.jsx
app/frontend/src/pages/ForgotPassword.jsx
app/frontend/src/pages/GoogleAuthCallback.jsx
app/frontend/src/pages/Home.jsx
app/frontend/src/pages/Login.jsx
app/frontend/src/pages/Register.jsx
app/frontend/src/pages/ResetPassword.jsx
app/frontend/src/pages/VerifyEmail.jsx
app/frontend/src/utils/api.js
app/frontend/tailwind.config.js
app/frontend/vite.config.js


backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── passport.js          # Google OAuth config
├── controllers/
│   ├── authController.js    # Auth logic (register, login, etc.)
│   └── adminController.js   # Admin operations (CRUD users)
├── middleware/
│   ├── auth.js             # JWT verification, role check
│   └── validate.js         # Validation middleware
├── models/
│   └── User.js             # User schema (Mongoose)
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   └── adminRoutes.js      # Admin endpoints
├── utils/
│   └── helpers.js          # JWT, OTP, Email helpers
├── validators/
│   └── authValidator.js    # Express-validator rules
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
└── server.js               # Express app entry point
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx  # Route guards
│   ├── contexts/
│   │   └── AuthContext.jsx     # Global auth state
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Register page
│   │   ├── VerifyEmail.jsx     # OTP verification
│   │   ├── ForgotPassword.jsx  # Request reset
│   │   ├── ResetPassword.jsx   # Reset with OTP
│   │   ├── Home.jsx            # Protected home page
│   │   ├── AdminUsers.jsx      # Admin user list
│   │   ├── EditUser.jsx        # Edit user (admin)
│   │   └── GoogleAuthCallback.jsx # OAuth callback
│   ├── utils/
│   │   └── api.js              # Axios instance
│   ├── App.jsx                 # Routes setup
│   ├── main.jsx                # React entry
│   └── index.css               # Tailwind + custom CSS
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 🔌 API Endpoints

### Auth Endpoints

| Method | Endpoint                    | Description               | Access  |
| ------ | --------------------------- | ------------------------- | ------- |
| POST   | `/api/auth/register`        | Đăng ký user mới          | Public  |
| POST   | `/api/auth/verify-email`    | Xác thực email với OTP    | Public  |
| POST   | `/api/auth/resend-otp`      | Gửi lại OTP               | Public  |
| POST   | `/api/auth/login`           | Đăng nhập                 | Public  |
| POST   | `/api/auth/forgot-password` | Gửi OTP reset password    | Public  |
| POST   | `/api/auth/reset-password`  | Reset password với OTP    | Public  |
| GET    | `/api/auth/me`              | Lấy thông tin user        | Private |
| POST   | `/api/auth/logout`          | Đăng xuất                 | Private |
| GET    | `/api/auth/google`          | Redirect đến Google OAuth | Public  |
| GET    | `/api/auth/google/callback` | Callback từ Google        | Public  |

### Admin Endpoints

| Method | Endpoint               | Description      | Access |
| ------ | ---------------------- | ---------------- | ------ |
| GET    | `/api/admin/users`     | Lấy tất cả users | Admin  |
| GET    | `/api/admin/users/:id` | Lấy user theo ID | Admin  |
| PUT    | `/api/admin/users/:id` | Cập nhật user    | Admin  |
| DELETE | `/api/admin/users/:id` | Xóa user         | Admin  |

---

## 🗄️ Database Schema

### User Model

```javascript
{
  email: String (required, unique),
  password: String (hashed, optional - for Google users),
  fullName: String (required),
  phone: String (optional, 10-11 digits),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isVerified: Boolean (default: false),
  googleId: String (unique, sparse),
  avatar: String,
  refreshToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationCode: String,
  verificationCodeExpire: Date,
  timestamps: true
}
```

---

## 🔑 Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth-app
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-session-secret
```

---

## 📦 Dependencies

### Backend

- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- express-validator
- nodemailer
- passport
- passport-google-oauth20
- express-session
- cookie-parser

### Frontend

- react
- react-dom
- react-router-dom
- axios
- react-hot-toast
- lucide-react
- tailwindcss
- vite

---

## ✅ Testing Checklist

- [ ] Đăng ký user mới
- [ ] Nhận OTP qua email
- [ ] Xác thực email
- [ ] Đăng nhập với email/password
- [ ] Đăng nhập với Google
- [ ] Remember me
- [ ] Quên mật khẩu
- [ ] Truy cập home page (protected)
- [ ] Logout
- [ ] Tạo admin user
- [ ] Truy cập admin panel
- [ ] Xem danh sách users
- [ ] Chỉnh sửa user
- [ ] Xóa user

---

## 🚀 Next Steps (Mở rộng)

Các tính năng có thể thêm vào:

- [ ] Profile page cho user
- [ ] Upload avatar
- [ ] Change password
- [ ] Dashboard analytics cho admin
- [ ] User activity logs
- [ ] Email templates đẹp hơn
- [ ] Rate limiting
- [ ] Account lockout sau nhiều lần đăng nhập sai
- [ ] Two-factor authentication (2FA)
- [ ] Social login khác (Facebook, GitHub)

---

## 📝 Notes

- OTP có hiệu lực 10 phút
- Password tối thiểu 6 ký tự
- Phone number 10-11 số
- Access token 7 ngày, Refresh token 30 ngày
- Admin không thể tự xóa chính mình
- Google users không có password (có thể thêm sau)

---

## 🎓 Learning Points

Dự án này cover:

- ✅ JWT Authentication flow
- ✅ Protected Routes với React Router
- ✅ Context API cho state management
- ✅ Axios interceptors
- ✅ MongoDB với Mongoose
- ✅ Email service với Nodemailer
- ✅ OAuth 2.0 với Passport.js
- ✅ Express middleware
- ✅ Input validation
- ✅ Error handling
- ✅ Tailwind CSS
- ✅ Modern React patterns (hooks, context)

Perfect cho portfolio hoặc làm base cho các dự án lớn hơn! 🎉
