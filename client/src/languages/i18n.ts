// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Sidebar
      "workspace-not-select": "No Workspace selected",
      "sub-title-workspace": "Free workspace",
      "workspace-dialog-title": "Workspaces",
      "workspace-dialog-add": "+ Add New Workspace",
      "nav-title": "Navigation",
      "sidebar-dashboard": "Dashboard",
      "sidebar-projects": "Projects",
      "sidebar-projects-announce": "There is no project in this Workspace yet.Projects created will be shown up here.",
      "sidebar-projects-edit": "Edit",
      "sidebar-projects-delete": "Delete",
      "sidebar-projects-notifi": "Archived Projects",
      "sidebar-tasks": "Tasks",
      "sidebar-members": "Members",
      "sidebar-settings": "Settings",
      "sidebar-createworkspace-title": "Let's build a Workspace",
      "sidebar-createworkspace-name": "Workspace name",
      "sidebar-createworkspace-placeholdername": "Hutech's Uni",
      "sidebar-createworkspace-decription": "Workspace description (Optional)",
      "sidebar-createworkspace-placeholderdecription": "Our team organizes marketing projects and tasks here.",
      "sidebar-createworkspace-btn": "Create workspace",
      "sidebar-createworkspace-cancelbtn": "Cancel",


      // Navbar
      "navbar-search-placeholder": "Search products or workspaces",
      "create-project-btn": "+ Create New Project",
      "navbar-dialog-announce": "TBA",
      "navbar-profile-title": "Profile",
      "navbar-profile-settings": "Profile settings (TBA)",
      "navbar-change-theme": "Change theme",
      "switch-language": "Switch to Vietnamese",
      "navbar-logout": "Log out",
      "navbar-advanced-settings": "Advanced settings (TBA)",

      // Dashboard 
      "dashboard-total-task": "Total Task",
      "dashboard-overdue-task": "Overdue Task",
      "dashboard-completed-task": "Completed Task",
      "dashboard-recent-projects": "Recent Projects",
      "dashboard-recent-tasks": "Recent Tasks",
      "dashboard-recent-members": "Recent Members",
      "dashboard-data-status": "Data status",
      "dashboard-project-announce": "No Projects created yet",
      "dashboard-project-created": "Created by",
      "dashboard-task-announce": "No Tasks created yet",
      "dashboard-task-user": "Assignee",
      "dashboard-task-inproject": "Project",
      "dashboard-task-title": "Task title",
      "dashboard-task-created": "Created",
      "dashboard-task-status": "Status",
      "dashboard-task-priority": "Priority",
      "dashboard-status-todo": "TODO",
      "dashboard-status-in_progress": "IN PROGRESS",
      "dashboard-status-done": "DONE",
      "dashboard-status-backlog": "BACKLOG",
      "dashboard-priority-low": "LOW",
      "dashboard-priority-medium": "MEDIUM",
      "dashboard-priority-high": "HIGH",
      "dashboard-owner": "OWNER",
      "dashboard-admin": "ADMIN",
      "dashboard-member": "MEMBER",
      "dashboard-member-joinday": "Joined",

    },
  },
  vi: {
    translation: {
      // Sidebar
      "workspace-not-select": "Chưa chọn không gian",
      "sub-title-workspace": "Không gian làm việc",
      "workspace-dialog-title": "Không gian làm việc",
      "workspace-dialog-add": "+ Thêm không gian làm việc mới",
      "nav-title": "Điều hướng",
      "sidebar-dashboard": "Trang chủ",
      "sidebar-projects": "Dự án",
      "sidebar-projects-announce": "Chưa có dự án nào trong không gian làm việc này. Các dự án được tạo sẽ xuất hiện ở đây.",
      "sidebar-projects-edit": "Chỉnh sửa",
      "sidebar-projects-delete": "Xóa",
      "sidebar-tasks": "Công việc",
      "sidebar-members": "Thành viên",
      "sidebar-settings": "Cài đặt",
      "sidebar-createworkspace-title": "Tạo không gian làm việc",
      "sidebar-createworkspace-name": "Tên không gian làm việc",
      "sidebar-createworkspace-placeholdername": "Trường Hutech",
      "sidebar-createworkspace-decription": "Mô tả không gian làm việc (Tùy chọn)",
      "sidebar-createworkspace-placeholderdecription": "Đội ngũ của chúng tôi tổ chức các dự án và công việc tiếp thị tại đây.",
      "sidebar-createworkspace-btn": "Tạo",
      "sidebar-createworkspace-cancelbtn": "Hủy",



      // Navbar
      "navbar-search-placeholder": "Tìm kiếm dự án hoặc không gian làm việc",
      "create-project-btn": "+ Tạo dự án",
      "navbar-dialog-announce": "Cập nhật sau",
      "navbar-profile-title": "Hồ sơ",
      "navbar-profile-settings": "Cài đặt hồ sơ (CNS)",
      "navbar-change-theme": "Thay đổi giao diện",
      "switch-language": "Chuyển sang tiếng Anh",
      "navbar-logout": "Đăng xuất",
      "navbar-advanced-settings": "Cài đặt nâng cao (CNS)",

      // Dashboard
      "dashboard-total-task": "Tổng tác vụ",
      "dashboard-overdue-task": "Quá hạn",
      "dashboard-completed-task": "Tác vụ hoàn thành",
      "dashboard-recent-projects": "Dự án gần đây",
      "dashboard-recent-tasks": "Công việc gần đây",
      "dashboard-recent-members": "Thành viên gần đây",
      "dashboard-data-status": "Trạng thái dữ liệu",
      "dashboard-project-announce": "Chưa có dự án nào được tạo",
      "dashboard-project-created": "Được tạo bởi",
      "dashboard-task-announce": "Chưa có công việc nào được tạo",
      "dashboard-task-user": "Người thực hiện",
      "dashboard-task-inproject": "Dự án",
      "dashboard-task-title": "Tiêu đề công việc",
      "dashboard-task-created": "Ngày tạo",
      "dashboard-task-status": "Trạng thái",
      "dashboard-task-priority": "Độ ưu tiên",
      "dashboard-status-todo": "CẦN THỰC HIỆN",
      "dashboard-status-in_progress": "ĐANG THỰC HIỆN",
      "dashboard-status-done": "HOÀN THÀNH",
      "dashboard-status-backlog": "TỒN ĐỌNG",
      "dashboard-priority-low": "THẤP",
      "dashboard-priority-medium": "TRUNG BÌNH",
      "dashboard-priority-high": "CAO",
      "dashboard-owner": "CHỦ SỞ HỮU",
      "dashboard-admin": "QUẢN TRỊ VIÊN",
      "dashboard-member": "THÀNH VIÊN",
      "dashboard-member-joinday": "Ngày tham gia",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
