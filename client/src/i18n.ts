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
