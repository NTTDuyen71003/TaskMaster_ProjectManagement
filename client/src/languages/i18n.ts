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
