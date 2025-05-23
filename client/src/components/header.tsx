import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import PermissionsGuard from "./resuable/permission-guard";
import { Permissions } from "@/constant/index";
import { IoLanguage } from "react-icons/io5";
import { useAuthContext } from "@/context/auth-provider";
import { Loader } from "lucide-react";
import LogoutDialog from "./asidebar/logout-dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/languages/i18n";

const Header = () => {
  const workspaceId = useWorkspaceId();
  const { onOpen } = useCreateProjectDialog();
  const { isLoading, user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const handleSwitchLanguage = () => {
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) return;
    const currentLang = localStorage.getItem(`language-${currentUserId}`) || "en";
    const newLang = currentLang === "en" ? "vi" : "en";
    localStorage.setItem(`language-${currentUserId}`, newLang);
    i18n.changeLanguage(newLang);
  };

  const handleToggleSidebar = () => {
    const body = document.body;
    if (body.classList.contains('sidebar-toggle-display') || body.classList.contains('sidebar-absolute')) {
      body.classList.toggle('sidebar-hidden');
    } else {
      body.classList.toggle('sidebar-icon-only');
    }
  };

  const handleToggleOffcanvas = () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("active");
    }
  };


  return (
    <nav className="navbar bg-navbar p-0 fixed-top d-flex flex-row">
      {/* mini logo */}
      <div className="navbar-brand-wrapper d-flex d-lg-none align-items-center justify-content-center">
        <a className="navbar-brand brand-logo-mini" href={`/workspace/${workspaceId}`}>
          <img src="/taskmaster.png" alt="logo" /></a>
      </div>

      {/* Icon kéo ra kéo vào */}
      <div className="navbar-menu-wrapper flex-grow d-flex align-items-stretch">
        <button
          className="navbar-toggler navbar-toggler align-self-center"
          type="button"
          onClick={handleToggleSidebar}
        >
          <span className="mdi mdi-menu"></span>
        </button>


        {/* Thanh tìm kiếm */}
        <ul className="navbar-nav w-100">
          <li className="nav-item w-100">
            <form className="nav-link mt-2 mt-md-0 d-none d-lg-flex search">
              <input type="text" className="form-control bg-navbar border-sidebar-border text-sidebar-text" placeholder={t("navbar-search-placeholder")}></input>
            </form>
          </li>
        </ul>

        {/* Tạo mới dự án */}
        <ul className="navbar-nav navbar-nav-right">
          <li className="nav-item dropdown d-none d-lg-block">
            <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
              <button
                className="nav-link btn create-new-button 
                bg-sidebar-frameicon hover:bg-navbar-createbtn-hover bg-btn"
                id="createbuttonDropdown"
                onClick={onOpen}
                type="button"
              >
                {t("create-project-btn")}
              </button>
            </PermissionsGuard>
          </li>


          {/* Icon 1 */}
          <li className="nav-item dropdown">
            <a className="nav-link count-indicator dropdown-toggle" id="messageDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
              <i className="mdi mdi-account-plus" style={{ color: 'hsl(var(--navbar-icon))' }}></i>
            </a>
            <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="messageDropdown">
              <h6 className="p-3 mb-0 text-sidebar-text">{t("navbar-dialog-announce")}</h6>
            </div>
          </li>

          {/* Icon mail */}
          <li className="text-sidebar-text nav-item dropdown border-left">
            <a className="nav-link count-indicator dropdown-toggle" id="messageDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
              <i className="mdi mdi-email" style={{ color: 'hsl(var(--navbar-icon))' }}></i>
            </a>
            <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="messageDropdown">
              <h6 className="p-3 mb-0 text-sidebar-text">{t("navbar-dialog-announce")}</h6>
            </div>
          </li>

          {/* Icon thông báo */}
          <li className="text-sidebar-text nav-item dropdown border-left">
            <a className="nav-link count-indicator dropdown-toggle" id="notificationDropdown" href="#" data-toggle="dropdown">
              <i className="mdi mdi-bell" style={{ color: 'hsl(var(--navbar-icon))' }}></i>
            </a>
            <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="notificationDropdown">
              <h6 className="p-3 mb-0 text-sidebar-text">{t("navbar-dialog-announce")}</h6>
            </div>
          </li>


          {/* profile */}
          {isLoading ? (
            <Loader />
          ) : (
            <li className="nav-item dropdown">
              <a className="nav-link" id="profileDropdown" href="" data-toggle="dropdown">
                <div className="navbar-profile d-flex align-items-center">
                  <span className="text-sidebar-text h-9 w-9 rounded-full d-flex align-items-center justify-content-center text-sm font-semi-bold avatar-border ">
                    {user?.name?.split(" ")?.[0]?.charAt(0)}
                    {user?.name?.split(" ")?.[1]?.charAt(0) || ""}
                  </span>
                  <div className="d-none d-sm-block ms-2">
                    <p className="mb-0 text-sidebar-text navbar-profile-name">{user?.name}</p>
                    <small className="text-muted">{user?.email}</small>
                  </div>
                  <i className="mdi mdi-menu-down d-none d-sm-block ms-1"></i>
                </div>
              </a>

              {/* dropdown menu */}
              <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="profileDropdown">
                <h6 className="text-sidebar-text p-3 mb-0">{t("navbar-profile-title")}</h6>

                <div className="dropdown-divider"></div>
                <a className="dropdown-item preview-item">
                  <div className="preview-thumbnail">
                    {/* icon */}
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i className="mdi mdi-settings"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="text-sidebar-text preview-subject mb-1">{t("navbar-profile-settings")}</p>
                  </div>
                </a>

                {/* Đổi theme */}
                <div className="dropdown-divider"></div>
                <a
                  className="dropdown-item preview-item cursor-pointer"
                  onClick={() => {
                    const html = document.documentElement;
                    const isDark = html.classList.contains("dark");
                    const currentUserId = localStorage.getItem("currentUserId");

                    if (!currentUserId) return;

                    if (isDark) {
                      html.classList.remove("dark");
                      localStorage.setItem(`theme-${currentUserId}`, "light");
                    } else {
                      html.classList.add("dark");
                      localStorage.setItem(`theme-${currentUserId}`, "dark");
                    }
                  }}
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i className="mdi mdi-brightness-4"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="text-sidebar-text preview-subject mb-1">
                      {t("navbar-change-theme")}
                    </p>
                  </div>
                </a>


                {/* Đổi ngôn ngữ */}
                <div className="dropdown-divider"></div>
                <a className="dropdown-item preview-item" onClick={handleSwitchLanguage}>
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i><IoLanguage /></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="text-sidebar-text preview-subject mb-1">
                      {t("switch-language")}
                    </p>
                  </div>
                </a>


                {/* Đăng xuất */}
                <div className="dropdown-divider"></div>
                <a className="dropdown-item preview-item" onClick={() => setIsOpen(true)}>
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i className="mdi mdi-logout"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="preview-subject mb-1 text-sidebar-text"
                    >{t("navbar-logout")}</p>
                  </div>
                </a>
                <LogoutDialog isOpen={isOpen} setIsOpen={setIsOpen} />

                {/* mở rộng setting */}
                <div className="dropdown-divider"></div>
                <p className="p-3 mb-0 text-center text-sidebar-text">{t("navbar-advanced-settings")}</p>
              </div>
            </li>
          )}
        </ul>

        {/* nút đóng mở*/}
        <button
          className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
          type="button"
          onClick={handleToggleOffcanvas}
        >
          <span className="mdi mdi-format-line-spacing"></span>
        </button>
      </div>
    </nav>
  );
};

export default Header;
