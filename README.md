# Đồ án NodeJS Project Management

## Dự án này sử dụng các công cụ và framework mới nhất cho phát triển hiện đại:
- **Node.js**
- **React.js**
- **MongoDB & Mongoose**
- **Google OAuth**
- **TypeScript** 
- **TailwindCSS & Shadcn UI**

### Cấu hình Biến Môi Trường
Tạo một tệp .env trong thư mục gốc của dự án và cấu hình các biến sau:

PORT=8000  
NODE_ENV=development  
MONGO_URI="mongodb+srv://<username>:<password>@<>.mongodb.net/teamsync_db"  

SESSION_SECRET="session_secret_key"

GOOGLE_CLIENT_ID=<client-id-google-của-bạn>  
GOOGLE_CLIENT_SECRET=<client-secret-google-của-bạn>  
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

FRONTEND_ORIGIN=http://localhost:3000  
FRONTEND_GOOGLE_CALLBACK_URL=http://localhost:3000/google/callback  

### Chạy dự án

Cài đặt dependencies and khởi động server phát triển:

npm install  
npm run dev

Truy cập backend tại http://localhost:8000.