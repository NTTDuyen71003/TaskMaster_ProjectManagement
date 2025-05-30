import { Loader, Trash2, Edit } from "lucide-react";
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
import EditProjectDialog from "../workspace/project/edit-project-dialog";


export function NavProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const workspaceId = useWorkspaceId();
  const { isMobile } = useSidebar();
  const { context, open, onOpenDialog, onCloseDialog } = useConfirmDialog();
  const [pageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isExpanded, setIsExpanded] = useState(false); // Track expanded state
  const [editProject, setEditProject] = useState(null); // Track project being edited
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
    setIsExpanded(true); // Mark as expanded when loading more
  };

  const showLess = () => {
    setPageSize(5); // Reset to initial page size
    setIsExpanded(false); // Mark as collapsed
  };

  const handleEditProject = (project: any) => {
    setEditProject(project);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditProject(null);
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
          });
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
            description: t("navbar-create-project-error-desc"),
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
        <span className="nav-item">
          <div className="nav-announce">
            {t("sidebar-no-workspace")}
          </div>
        </span>
      ) : projects?.length === 0 ? (
        // Show only if workspace exists but no projects
        <span className="nav-item">
          <div className="nav-announce">
            {t("sidebar-projects-announce")}
          </div>
        </span>
      ) : (
        <>
          {/* Render project list */}
          {projects.map((item) => {
            const projectUrl = `/workspace/${workspaceId}/project/${item._id}`;
            const isActive = pathname === projectUrl;

            return (
              <div key={item._id} className={`nav-item ${isActive ? "active" : ""}`}>
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
                        <DropdownMenuItem onClick={() => handleEditProject(item)}>
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
              </div>
            );
          })}

          {/* Show More/Less buttons */}
          {hasMore && !isExpanded && (
            <span className="nav-item">
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-gray-400 hover:bg-menuSidebar-hover hover:text-sidebar-text transition-colors"
                  disabled={isFetching}
                  onClick={fetchNextPage}
                >
                  <span>{isFetching ? t("sidebar-loading") : t("sidebar-workspace-show-more")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </span>
          )}

          {isExpanded && pageSize > 5 && (
            <span className="nav-item">
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-gray-400 hover:bg-menuSidebar-hover hover:text-sidebar-text transition-colors"
                  onClick={showLess}
                >
                  <span>{t("sidebar-workspace-show-less") || "Show Less"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </span>
          )}

          {/* Show More button when expanded but there are still more items */}
          {isExpanded && hasMore && (
            <span className="nav-item">
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-gray-400 hover:bg-menuSidebar-hover hover:text-sidebar-text transition-colors"
                  disabled={isFetching}
                  onClick={fetchNextPage}
                >
                  <span>{isFetching ? t("sidebar-loading") : t("sidebar-workspace-show-more")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </span>
          )}

          {/* Confirm delete dialog */}
          <ConfirmDialog
            isOpen={open}
            isLoading={isLoading}
            onClose={onCloseDialog}
            onConfirm={handleConfirm}
            title={`${t("sidebar-project-deletetitle")} "${context?.name}"`}
            description={`${t("sidebar-project-deletedescription1")}? ${t("sidebar-project-deletedescription3")}`}
            confirmText={t("sidebar-project-deletebtn")}
            cancelText={t("sidebar-createworkspace-cancelbtn")}
          />

          {/* Edit project dialog */}
          {isEditDialogOpen && editProject && (
            <EditProjectDialog
              project={editProject}
              isOpen={isEditDialogOpen}
              onClose={handleCloseEditDialog}
            />
          )}
        </>
      )}
    </>
  );
}

