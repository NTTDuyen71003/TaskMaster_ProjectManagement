import { Loader, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { ConfirmDialog } from "../resuable/confirm-dialog";
import useConfirmDialog from "@/hooks/use-confirm-dialog";
import PermissionsGuard from "../resuable/permission-guard";
import { Permissions } from "@/constant/index";
import { useState } from "react";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { PaginationType } from "@/types/api.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/auth-provider";
import { clsx } from "clsx";


export function NavProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const workspaceId = useWorkspaceId();
  const { isMobile } = useSidebar();
  const { context, open, onOpenDialog, onCloseDialog } = useConfirmDialog();
  const [pageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthContext();

  const { t } = useTranslation();

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: deleteProjectMutationFn,
  })

  const { data, isPending, isFetching, isError } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageSize,
    pageNumber,
  })
  const projects = data?.projects || [];
  const pagination = data?.pagination || ({} as PaginationType);
  const hasMore = pagination?.totalPages > pageNumber;

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPageSize((prev) => prev + 5);
  };

  const handleConfirm = () => {
    if (!context) return;
    mutate(
      {
        workspaceId,
        projectId: context?._id,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["allprojects", workspaceId],
          });;
          toast({
            title: t("settingboard-delete-workspace-success"),
            description: t("sidebar-project-delete-desc"),
            variant: "success",
            duration: 2500,
          });
          navigate(`/workspace/${workspaceId}`);
          setTimeout(() => onCloseDialog(), 100);
        },
        onError: () => {
          toast({
            title: t("memberdashboard-changerole-error"),
            description: t("memberdashboard-changerole-error-description"),
            variant: "destructive",
            duration: 2500,
          });
        },
      }
    );
  };

  
  return (
    <>
      {isPending ? (
        <Loader className="w-5 h-5 animate-spin place-self-center" />
      ) : isError || !workspaceId ? (
        // Show only if there's an error OR no workspaceId
        <li className="nav-item">
          <div className="nav-announce">
            {t("sidebar-no-workspace")}
          </div>
        </li>
      ) : projects?.length === 0 ? (
        // Show only if workspace exists but no projects
        <li className="nav-item">
          <div className="nav-announce">
            {t("sidebar-projects-announce")}
          </div>
        </li>
      ) : (
        <>
          {/* Render project list */}
          {projects.map((item) => {
            const projectUrl = `/workspace/${workspaceId}/project/${item._id}`;
            const isActive = pathname === projectUrl;

            return (
              <li key={item._id} className={`nav-item ${isActive ? "active" : ""}`}>
                <div className="flex items-center justify-between w-full">
                  <a href={projectUrl} className="nav-link">
                    <span>{item.emoji}</span>
                    <span className="ml-2">{item.name}</span>
                  </a>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <a
                        id="profile-dropdown"
                        data-toggle="dropdown"
                        className={clsx(
                          "p-2 rounded-md transition-colors text-muted",
                          !hasPermission(Permissions.EDIT_PROJECT) && "invisible"
                        )}
                        aria-label="More options"
                        onClick={(e) => e.preventDefault()}
                      >
                        <i className="mdi mdi-dots-vertical icon-menu-project" />
                      </a>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <PermissionsGuard requiredPermission={Permissions.EDIT_PROJECT}>
                        <DropdownMenuItem>
                          <Edit className="mr-2" />
                          <span>{t("sidebar-projects-edit")}</span>
                        </DropdownMenuItem>
                        <div className="dropdown-divider"></div>
                      </PermissionsGuard>

                      <PermissionsGuard requiredPermission={Permissions.DELETE_PROJECT}>
                        <DropdownMenuItem disabled={isLoading} onClick={() => onOpenDialog(item)}>
                          <Trash2 className="mr-2" />
                          <span>{t("sidebar-projects-delete")}</span>
                        </DropdownMenuItem>
                      </PermissionsGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            );
          })}

          {/* Load more button */}
          {hasMore && (
            <li className="nav-item">
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-sidebar-foreground/70 hover:bg-menuSidebar-hover transition-colors"
                  disabled={isFetching}
                  onClick={fetchNextPage}
                >
                  <MoreHorizontal className="mr-2 w-4 h-4" />
                  <span>{isFetching ? "Loading..." : "More"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </li>
          )}

          {/* Confirm delete dialog */}
          <ConfirmDialog
            isOpen={open}
            isLoading={isLoading}
            onClose={onCloseDialog}
            onConfirm={handleConfirm}
            title={`${t("sidebar-project-deletetitle")} "${context?.name || t("sidebar-project-deletedescription2")}"`}
            description={`${t("sidebar-project-deletedescription1")} ${t("sidebar-project-deletedescription3")}`}
            confirmText={t("sidebar-project-deletebtn")}
            cancelText={t("sidebar-createworkspace-cancelbtn")}
          />
        </>
      )}
    </>
  );
}
