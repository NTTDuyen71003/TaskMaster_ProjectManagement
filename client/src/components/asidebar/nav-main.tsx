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

  useEffect(() => {
    const workspaceSubRoutes = ["/overview", "/activity"];
    const isSubRoute = workspaceSubRoutes.some((route) =>
      pathname.includes(`/workspace/${workspaceId}${route}`)
    );
    setIsWorkspaceOpen(isSubRoute);
  }, [pathname, workspaceId]);


  const items: ItemType[] = [
    {
      title: "Dashboard",
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      url: `/workspace/${workspaceId}/tasks`,
      icon: CheckCircle,
    },
    {
      title: "Members",
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },
    ...(canManageSettings
      ? [
        {
          title: "Settings",
          url: `/workspace/${workspaceId}/settings`,
          icon: Settings,
        },
      ]
      : []),
  ];


  return (
    <>
      {items.map((item) => {
        const active = item.url === pathname;
        return (
          <React.Fragment key={item.title}>
            <li className={`nav-item menu-items ${active ? "active" : ""}`}>
              <Link to={item.url} className="nav-link">
                <span className="menu-icon">
                  <item.icon className="mdi w-4 h-4" />
                </span>
                <span className="menu-title">{item.title}</span>
              </Link>
            </li>

            {/* Chèn Projects ngay sau Dashboard */}
            {item.title === "Dashboard" && (
              <li
                className={`nav-item menu-items ${isWorkspaceOpen || pathname.includes(`/workspace/${workspaceId}/project/`) ? "active" : ""
                  }`}
              >
                <button
                  type="button"
                  onClick={() => setIsWorkspaceOpen((prev) => !prev)}
                  className="nav-link flex items-center justify-between w-full"
                >
                  <span className="flex items-center">
                    <span className="menu-icon">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <span className="menu-title">Projects</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isWorkspaceOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
                <div className={`${isWorkspaceOpen ? "block" : "hidden"}`}>
                  <ul className="nav flex-column sub-menu">
                    <NavProjects />
                  </ul>
                </div>
              </li>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
