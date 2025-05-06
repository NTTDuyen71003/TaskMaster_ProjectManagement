import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "./ui/separator";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import PermissionsGuard from "./resuable/permission-guard";
import { Permissions } from "@/constant/index";
import { IoLanguage } from "react-icons/io5";
import { useAuthContext } from "@/context/auth-provider";
import { Loader } from "lucide-react";
import LogoutDialog from "./asidebar/logout-dialog";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const workspaceId = useWorkspaceId();
  const { onOpen } = useCreateProjectDialog();
  const { isLoading, user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = location.pathname;


  const getPageLabel = (pathname: string) => {
    if (pathname.includes("/project/")) return "Project";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/tasks")) return "Tasks";
    if (pathname.includes("/members")) return "Members";
    return null; // Default label
  };
  const pageHeading = getPageLabel(pathname);


  return (
    <nav className="navbar bg-navbar p-0 fixed-top d-flex flex-row">
      {/* mini logo */}
      <div className="navbar-brand-wrapper d-flex d-lg-none align-items-center justify-content-center">
        <a className="navbar-brand brand-logo-mini" href={`/workspace/${workspaceId}`}>
          <img src="/taskmaster.png" alt="logo" /></a>
      </div>

      {/* Icon kéo ra kéo vào */}
      <div className="navbar-menu-wrapper flex-grow d-flex align-items-stretch">
        <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
          <span className="mdi mdi-menu"></span>
        </button>

        {/* Thanh tìm kiếm */}
        <ul className="navbar-nav w-100">
          <li className="nav-item w-100">
            <form className="nav-link mt-2 mt-md-0 d-none d-lg-flex search">
              <input type="text" className="form-control" placeholder="Search products"></input>
            </form>
          </li>
        </ul>

        {/* Tạo mới dự án */}
        <ul className="navbar-nav navbar-nav-right">
          <li className="nav-item dropdown d-none d-lg-block">
            <PermissionsGuard
              requiredPermission={Permissions.CREATE_PROJECT}>
              <a
                className="nav-link btn create-new-button bg-btn"
                id="createbuttonDropdown"
                data-toggle="dropdown"
                aria-expanded="false"
                onClick={onOpen}
                type="button"
              >
                + Create New Project
              </a>
            </PermissionsGuard>
          </li>

          {/* Icon 1 */}
          <li className="nav-item dropdown">
            <a className="nav-link count-indicator dropdown-toggle" id="messageDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
              <i className="mdi mdi-account-plus" style={{ color: 'hsl(var(--navbar-icon))' }}></i>
            </a>
            <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="messageDropdown">
              <h6 className="p-3 mb-0">TBA</h6>
            </div>
          </li>

          {/* Icon mail */}
          <li className="text-sidebar-text nav-item dropdown border-left">
            <a className="nav-link count-indicator dropdown-toggle" id="messageDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
              <i className="mdi mdi-email" style={{ color: 'hsl(var(--navbar-icon))' }}></i>
            </a>
            <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="messageDropdown">
              <h6 className="p-3 mb-0">TBA</h6>
            </div>
          </li>

          {/* Icon thông báo */}
          <li className="text-sidebar-text nav-item dropdown border-left">
            <a className="nav-link count-indicator dropdown-toggle" id="notificationDropdown" href="#" data-toggle="dropdown">
              <i className="mdi mdi-bell" style={{ color: 'hsl(var(--navbar-icon))' }}></i>
            </a>
            <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="notificationDropdown">
              <h6 className="p-3 mb-0">TBA</h6>
            </div>
          </li>


          {/* profile */}
          {isLoading ? (
            <Loader />
          ) : (
            <li className="nav-item dropdown">
              <a className="nav-link" id="profileDropdown" href="#" data-toggle="dropdown">
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
                <h6 className="text-sidebar-text p-3 mb-0">Profile</h6>

                <div className="dropdown-divider"></div>
                <a className="dropdown-item preview-item">
                  <div className="preview-thumbnail">
                    {/* icon */}
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i className="mdi mdi-settings"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="text-sidebar-text preview-subject mb-1">Profile settings (TBA)</p>
                  </div>
                </a>

                <div className="dropdown-divider"></div>
                <a
                  className="dropdown-item preview-item cursor-pointer"
                  onClick={() => {
                    const html = document.documentElement;
                    const isDark = html.classList.contains("dark");

                    if (isDark) {
                      html.classList.remove("dark");
                      localStorage.setItem("theme", "light");
                    } else {
                      html.classList.add("dark");
                      localStorage.setItem("theme", "dark");
                    }
                  }}
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i className="mdi mdi-brightness-4"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="text-sidebar-text preview-subject mb-1">Change theme</p>
                  </div>
                </a>

                <div className="dropdown-divider"></div>
                <a className="dropdown-item preview-item">
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i><IoLanguage /></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="text-sidebar-text preview-subject mb-1">Switch to Vietnammese</p>
                  </div>
                </a>

                <div className="dropdown-divider"></div>
                <a className="dropdown-item preview-item" onClick={() => setIsOpen(true)}>
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i className="mdi mdi-logout"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="preview-subject mb-1 text-sidebar-text"
                    >Log out</p>
                  </div>
                </a>
                <LogoutDialog isOpen={isOpen} setIsOpen={setIsOpen} />

                {/* mở rộng setting */}
                <div className="dropdown-divider"></div>
                <p className="p-3 mb-0 text-center text-sidebar-text">Advanced settings (TBA)</p>
              </div>
            </li>
          )}
        </ul>

        {/* nút đóng mở*/}
        <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
          <span className="mdi mdi-format-line-spacing"></span>
        </button>
      </div>
    </nav>
  );
};

export default Header;
