# Đồ án NodeJS TaskMaster (Project Management)

## Sinh viên thực hiện:
- **Phạm Vũ Tiến - 2180608746 - (Back End + Postman)**
- **Nguyễn Thị Thuỳ Duyên - 2180608794 - (Front End  + UI/UX design)**
- **Trần Công Thuận - 2180608740 - (DB Design + Word + Testing)**
- **Trần Trọng Tuấn - 2180608187 - (Support + Team Collaboration)**

## Ngôn ngữ và công cụ sử dụng:
- **Node.js**
- **React.js**
- **Express.js**
- **MongoDB & Mongoose**
- **Module Passport Authentication(OAth2 và Local)**
- **TypeScript** 
- **TailwindCSS & Shadcn UI**
- **JWT (Json Web Token)**
- **Thư viện ZOD (type validation)**

### Cấu hình Biến Môi Trường
Tạo một tệp .env trong thư mục gốc của dự án và cấu hình các biến sau:

PORT=8000  
NODE_ENV=development  
MONGO_URI="mongodb+srv://<username>:<password>@<>.mongodb.net/doannodejs_db"  

JWT_SECRET="jwt_secret_key"
JWT_EXPIRES_IN="1d"

SESSION_SECRET="session_secret_key"
SESSION_EXPIRES_IN="1d"

GOOGLE_CLIENT_ID=<client-id-google-của-bạn>  
GOOGLE_CLIENT_SECRET=<client-secret-google-của-bạn>  

GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_GOOGLE_CALLBACK_URL=http://localhost:5173/google/callback

### Chạy dự án

Cài đặt dependencies and khởi động server phát triển:

npm install  
npm run dev

Truy cập backend tại http://localhost:8000.
Truy cập backend tại http://localhost:5173.