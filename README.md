# Đồ án NodeJS TaskMaster (Project Management)

## Sinh viên thực hiện:
- **Phạm Vũ Tiến - 2180608746 - (Back End + Front End + Postman)**
- **Nguyễn Thị Thuỳ Duyên - 2180608794 - (Front End  + UI/UX design)**
- **Trần Công Thuận - 2180608740 - (BA + Word + Testing)**
- **Trần Trọng Tuấn - 2180608187 - (DB Design + Support Back End)**


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


## Cấu hình Biến Môi Trường
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


## Chạy dự án
- Cài đặt dependencies and khởi động server phát triển:
npm install
  
npm run dev
- Truy cập FE tại http://localhost:5173.


## Các cập nhật mới (Tháng 7 năm 2025)
- Thêm tính năng đổi giao diện (hỗ trợ dark/light mode).
- Thêm chuyển đổi ngôn ngữ Anh – Việt (hỗ trợ đa ngôn ngữ).
- Thêm chức năng tìm kiếm cho:
  - Workspace  
  - Project  
  - Thành viên
- Thay đổi toàn bộ giao diện người dùng:
  - Thiết kế mới hiện đại, dễ sử dụng  
  - Responsive cho cả desktop và thiết bị di động
- Ẩn link mời workspace đối với member (chỉ admin mới có quyền).
- Thêm thông báo sau khi:
  - Tạo / chỉnh sửa / xóa workspace  
  - Chỉnh sửa task
- Thêm chức năng xóa thành viên khỏi workspace.
- Thêm chức năng tìm kiếm thông báo.
- Thêm hệ thống thông báo tự động cho các sự kiện:
  - Thành viên mới gia nhập / bị xóa khỏi workspace  
  - Đổi tên / xóa workspace  
  - Tạo / đổi tên / xóa project  
  - Thêm task / thay đổi người thực hiện & trạng thái / xóa task


## Sửa lỗi
- Lỗi hiển thị tác vụ chỉnh sửa project của member
- Lỗi không xóa được workspace
- Waring của các trang
- Lỗi cho phép tạo/chỉnh sửa project trùng (chỉ cho phép icon giống-tên khác và ngược lại)
- Lỗi cho phép tạo/chỉnh sửa workspace trùng tên
