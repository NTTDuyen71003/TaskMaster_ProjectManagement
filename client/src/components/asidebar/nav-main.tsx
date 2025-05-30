import {
  LucideIcon,
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import React from "react";
import { NavProjects } from "./nav-projects";
import { useTranslation } from "react-i18next";
import { useSidebarMode } from "@/hooks/use-sidebar";


type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
};


export function NavMain() {
  const { hasPermission } = useAuthContext();
  const canManageSettings = hasPermission(Permissions.MANAGE_WORKSPACE_SETTINGS);
  const workspaceId = useWorkspaceId();
  const location = useLocation();
  const pathname = location.pathname;
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const { t } = useTranslation();
  const isSidebarIconOnly = useSidebarMode();
  const [showHoverSubmenu, setShowHoverSubmenu] = useState(false);

  useEffect(() => {
    const workspaceSubRoutes = ["/overview", "/activity"];
    const isSubRoute = workspaceSubRoutes.some((route) =>
      pathname.includes(`/workspace/${workspaceId}${route}`)
    );
    setIsWorkspaceOpen(isSubRoute);
  }, [pathname, workspaceId]);

  const items: ItemType[] = [
    {
      title: t("sidebar-dashboard"),
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      title: t("sidebar-tasks"),
      url: `/workspace/${workspaceId}/tasks`,
      icon: CheckCircle,
    },
    {
      title: t("sidebar-members"),
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },
    ...(canManageSettings
      ? [
        {
          title: t("sidebar-settings"),
          url: `/workspace/${workspaceId}/settings`,
          icon: Settings,
        },
      ]
      : []),
  ];

  return (
    <>
      {items.map((item, index) => {
        const active = item.url === pathname;
        return (
          <React.Fragment key={item.title}>
            <li className={`nav-item menu-items ${active ? "active" : ""}`}>
              <Link to={item.url} className="nav-link">
                <span className="menu-icon bg-sidebar-frameicon">
                  <item.icon className="mdi w-4 h-4" />
                </span>
                <span className="menu-title">{item.title}</span>
              </Link>
            </li>

            {/* Insert Projects menu after Dashboard */}
            {index === 0 && ( 
              <li
                className={`nav-item menu-items ${
                  isWorkspaceOpen || pathname.includes(`/workspace/${workspaceId}/project/`) ? "active" : ""
                }`}
                onMouseEnter={() => isSidebarIconOnly && setShowHoverSubmenu(true)}
                onMouseLeave={() => isSidebarIconOnly && setShowHoverSubmenu(false)}
              >
                {/* Projects Header */}
                <a
                  onClick={() => !isSidebarIconOnly && setIsWorkspaceOpen((prev) => !prev)}
                  className="nav-link flex items-center justify-between w-full cursor-pointer"
                >
                  <span className="flex items-center">
                    <span className="menu-icon bg-sidebar-frameicon">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <span className="menu-title">{t("sidebar-projects")}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isWorkspaceOpen ? "rotate-180" : ""
                    }`}
                  />
                </a>

                {/* Projects Submenu - Normal Sidebar */}
                {!isSidebarIconOnly && (
                  <div 
                    className={`transition-all duration-300 overflow-hidden ${
                      isWorkspaceOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="nav flex-column sub-menu">
                      <NavProjects />
                    </ul>
                  </div>
                )}

                {/* Projects Submenu - Icon Only Sidebar (Hover) */}
                <div 
                  className={`absolute left-full bg-sidebar-submenu top-0 z-50 min-w-[200px] transition-all duration-300 ${
                    isSidebarIconOnly && showHoverSubmenu 
                      ? 'opacity-100 visible transform translate-x-0' 
                      : 'opacity-0 invisible transform -translate-x-2'
                  }`}
                  style={{
                    transitionProperty: 'opacity, visibility, transform',
                    transitionDuration: '0.25s',
                    transitionTimingFunction: 'ease-out'
                  }}
                  onMouseEnter={() => setShowHoverSubmenu(true)}
                  onMouseLeave={() => setShowHoverSubmenu(false)}
                >
                  <div className="p-2 mt-1">
                    <span className="menu-title mb-2 ml-3 text-custom-sm">
                      {t("sidebar-projects")}
                    </span>
                    <ul className="nav flex-column sub-menu mt-2">
                      <NavProjects />
                    </ul>
                  </div>
                </div>
              </li>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
