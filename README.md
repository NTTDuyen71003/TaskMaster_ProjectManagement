# Đồ án NodeJS TaskMaster (Project Management)

## Sinh viên thực hiện:
- **Phạm Vũ Tiến - 2180608746**
- **Trần Công Thuận - 2180608740**
- **Nguyễn Thị Thuỳ Duyên - 2180608794**
- **Trần Trọng Tuấn - 2180608187**

## Dự án này sử dụng các công cụ và framework mới nhất cho phát triển ngôn ngữ mới:
- **Node.js**
- **React.js**
- **Express.js**
- **MongoDB & Mongoose**
- **Module Passport Authentication(OAth2 và Local)**
- **TypeScript** 
- **TailwindCSS & Shadcn UI**
- **Thư viện ZOD (type validation)**
### Cấu hình Biến Môi Trường
Tạo một tệp .env trong thư mục gốc của dự án và cấu hình các biến sau:

PORT=8000  
NODE_ENV=development  
MONGO_URI="mongodb+srv://<username>:<password>@<>.mongodb.net/doannodejs_db"  

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