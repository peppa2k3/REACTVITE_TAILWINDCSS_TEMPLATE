# Fullstack Authentication App

Dự án fullstack hoàn chỉnh với các tính năng xác thực người dùng, phân quyền, và quản lý admin.

## 🚀 Tính năng

### Frontend (React + Vite + Tailwind CSS)

- ✅ **Đăng nhập**: Email/Password + Remember Me + Google OAuth
- ✅ **Đăng ký**: Form validation đầy đủ + Xác thực email qua OTP + Google OAuth
- ✅ **Quên mật khẩu**: Gửi OTP qua email + Đặt mật khẩu mới
- ✅ **Xác thực Email**: OTP 6 số + Resend OTP
- ✅ **Protected Routes**: Public, Private, Admin routes
- ✅ **Trang Home**: Hiển thị "Hello World" và thông tin user
- ✅ **Admin Panel**: Quản lý users, edit, delete

### Backend (Express + MongoDB)

- ✅ **JWT Authentication**: Access token + Refresh token
- ✅ **Email Service**: Gửi OTP qua Nodemailer
- ✅ **Google OAuth 2.0**: Đăng nhập/đăng ký với Google
- ✅ **Validation**: Express-validator cho tất cả inputs
- ✅ **Password Hashing**: Bcrypt
- ✅ **Role-Based Access**: User và Admin roles
- ✅ **MongoDB**: User schema với Mongoose

## 📋 Yêu cầu

- Node.js 16+
- MongoDB (local hoặc MongoDB Atlas)
- Gmail account (cho email service)
- Google Cloud Console (cho OAuth)

## 🛠️ Cài đặt

### 1. Clone hoặc tải dự án

```bash
cd fullstack-auth-app
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:

```env
PORT=5000
NODE_ENV=development

# MongoDB - Thay đổi nếu dùng MongoDB Atlas
MONGODB_URI=mongodb://localhost:27017/auth-app

# JWT Secrets - Thay đổi thành chuỗi bí mật của bạn
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_REFRESH_EXPIRE=30d

# Google OAuth - Lấy từ Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email Configuration - Gmail App Password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Session Secret
SESSION_SECRET=your-session-secret-key-change-this
```

### 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

## 🔧 Cấu hình Gmail App Password

1. Vào [Google Account Security](https://myaccount.google.com/security)
2. Bật "2-Step Verification"
3. Vào "App passwords"
4. Tạo app password mới cho "Mail"
5. Copy password và dán vào `EMAIL_PASSWORD` trong `.env`

## 🔑 Cấu hình Google OAuth

1. Vào [Google Cloud Console](https://console.cloud.google.com)
2. Tạo project mới hoặc chọn project hiện có
3. Vào "APIs & Services" > "Credentials"
4. Tạo "OAuth 2.0 Client ID":
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID và Client Secret vào `.env`

## 🚀 Chạy dự án

### Chạy Backend

```bash
cd backend
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

### Chạy Frontend

Mở terminal mới:

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📱 Sử dụng

### Đăng ký tài khoản mới

1. Truy cập `http://localhost:5173/register`
2. Điền thông tin đầy đủ
3. Nhấn "Create Account"
4. Kiểm tra email để lấy mã OTP
5. Nhập OTP tại trang xác thực
6. Đăng nhập với tài khoản đã tạo

### Đăng nhập

1. Truy cập `http://localhost:5173/login`
2. Nhập email và password
3. Chọn "Remember me" nếu muốn lưu phiên đăng nhập
4. Hoặc nhấn "Sign in with Google"

### Quên mật khẩu

1. Nhấn "Forgot password?" tại trang đăng nhập
2. Nhập email
3. Kiểm tra email để lấy mã OTP
4. Nhập OTP và mật khẩu mới

### Admin

Để tạo admin user, vào MongoDB và thay đổi role:

```javascript
db.users.updateOne(
  { email: "your-email@gmail.com" },
  { $set: { role: "admin" } },
);
```

Sau đó truy cập:

- `/admin/users` - Xem danh sách users
- `/admin/users/:id` - Chỉnh sửa user

## 🗂️ Cấu trúc dự án

```
fullstack-auth-app/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── passport.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validate.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── helpers.js
│   ├── validators/
│   │   └── authValidator.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── VerifyEmail.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── Home.jsx
    │   │   ├── AdminUsers.jsx
    │   │   ├── EditUser.jsx
    │   │   └── GoogleAuthCallback.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

## 🔐 API Endpoints

### Auth Routes

- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/verify-email` - Xác thực email với OTP
- `POST /api/auth/resend-otp` - Gửi lại OTP
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Gửi OTP reset password
- `POST /api/auth/reset-password` - Reset password với OTP
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/google` - Đăng nhập với Google
- `GET /api/auth/google/callback` - Google OAuth callback

### Admin Routes (Yêu cầu admin role)

- `GET /api/admin/users` - Lấy danh sách tất cả users
- `GET /api/admin/users/:id` - Lấy thông tin user theo ID
- `PUT /api/admin/users/:id` - Cập nhật user
- `DELETE /api/admin/users/:id` - Xóa user

## 🔒 Bảo mật

- ✅ Password được hash với bcrypt (10 salt rounds)
- ✅ JWT với expiration time
- ✅ HTTP-only cookies cho refresh token (có thể thêm)
- ✅ Input validation với express-validator
- ✅ OTP expires sau 10 phút
- ✅ Protected routes với middleware
- ✅ CORS configuration

## 📝 Ghi chú

- OTP có hiệu lực trong 10 phút
- Access token có hiệu lực trong 7 ngày
- Refresh token có hiệu lực trong 30 ngày
- Remember me sẽ lưu refresh token vào localStorage

## 🐛 Debug

Nếu gặp lỗi kết nối MongoDB:

```bash
# Kiểm tra MongoDB đã chạy chưa
mongod --version
# Hoặc dùng MongoDB Atlas connection string
```

Nếu không nhận được email:

```bash
# Kiểm tra Gmail App Password đã đúng chưa
# Kiểm tra email trong spam folder
```

## 📚 Technologies

### Backend

- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcrypt
- Nodemailer
- Passport.js (Google OAuth)
- Express Validator

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router Dom
- Axios
- React Hot Toast
- Lucide React (icons)

## 👨‍💻 Developer

Dự án được tạo bởi Claude - Anthropic

## 📄 License

MIT License
