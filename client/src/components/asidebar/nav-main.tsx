import {
  LucideIcon,
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  ChevronDown,
  FolderKanban,
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
    const isSubRoute = pathname.startsWith(`/workspace/${workspaceId}`);
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
              <div
                className={`nav-item menu-items ${isWorkspaceOpen || pathname.includes(`/workspace/${workspaceId}/project/`) ? "active" : ""
                  } relative`}
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
                      <FolderKanban className="w-4 h-4" />
                    </span>
                    <span className="menu-title">{t("sidebar-projects")}</span>
                  </span>
                  {!isSidebarIconOnly && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isWorkspaceOpen ? "rotate-180" : ""
                        }`}
                    />
                  )}
                </a>

                {/* Projects Submenu - Normal Sidebar */}
                {!isSidebarIconOnly && (
                  <div
                    className={`transition-all duration-300 overflow-hidden ${isWorkspaceOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                      }`}
                  >
                    <span className="nav flex-column sub-menu">
                      <NavProjects />
                    </span>
                  </div>
                )}

                {/* Projects Submenu - Icon Only Mode (Hover) */}
                {isSidebarIconOnly && showHoverSubmenu && (
                  <div className="absolute left-full top-0 bg-sidebar-submenu shadow-lg rounded-tr-lg rounded-br-lg min-w-48 z-50">
                    <div className="p-2">
                      <div className="text-submenu text-sidebar-text px-3 py-1 border-b border-sidebar-border">
                        {t("sidebar-projects")}
                      </div>
                      <div className="mt-2 hover-projects-menu">
                        <NavProjects />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}