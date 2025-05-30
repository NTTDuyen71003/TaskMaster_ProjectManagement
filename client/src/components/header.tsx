import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import PermissionsGuard from "./resuable/permission-guard";
import { Permissions } from "@/constant/index";
import { IoLanguage } from "react-icons/io5";
import { useAuthContext } from "@/context/auth-provider";
import { Loader } from "lucide-react";
import LogoutDialog from "./asidebar/logout-dialog";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MobileSearchButton, NavbarSearchForm } from "@/hooks/use-search-projects";
import ThemeDialog from "./workspace/user/theme-selection-dialog";
import LanguageDialog from "./workspace/user/language-selection-dialog";


const Header = () => {
  const workspaceId = useWorkspaceId();
  const { onOpen } = useCreateProjectDialog();
  const { isLoading, user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);
  const themeButtonRef = useRef(null);
  const [, setIsProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const languageButtonRef = useRef<HTMLAnchorElement>(null);


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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Modified theme button click handler
  const handleThemeButtonClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsThemeDialogOpen(true);
  };


  const handleLanguageButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLanguageDialogOpen(true);
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
            <NavbarSearchForm />
          </li>
        </ul>

        {/* right header */}
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

          {/* Mobile icon button */}
          <li className="nav-item dropdown d-lg-none relative group">
            <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
              <button
                className="nav-link btn icon-only-btn bg-sidebar-frameicon 
                hover:bg-navbar-createbtn-hover btn-cus ml-1 w-7 h-7 rounded-full flex items-center justify-center"
                onClick={onOpen}
                type="button"
              >
                <i className="mdi mdi-plus mdi-c"></i>
              </button>
            </PermissionsGuard>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-sidebar text-sidebar-text text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {t("create-project-btn")}
            </div>
          </li>

          {/* Icon 1 */}
          <li className="nav-item dropdown d-lg-none">
            <MobileSearchButton />
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
              <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list"
                aria-labelledby="profileDropdown">
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
                  ref={themeButtonRef}
                  className="dropdown-item preview-item cursor-pointer"
                  onClick={handleThemeButtonClick}
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
                <a
                  ref={languageButtonRef}
                  className="dropdown-item preview-item cursor-pointer"
                  onClick={handleLanguageButtonClick}
                >
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

              <ThemeDialog
                isOpen={isThemeDialogOpen}
                setIsOpen={setIsThemeDialogOpen}
                triggerRef={themeButtonRef}
                onThemeSelected={() => setIsProfileDropdownOpen(false)}
                isMobile={isMobile}
              />

              <LanguageDialog
                isOpen={isLanguageDialogOpen}
                setIsOpen={setIsLanguageDialogOpen}
                triggerRef={languageButtonRef}
                onLanguageSelected={() => setIsProfileDropdownOpen(false)}
                isMobile={isMobile}
              />
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
