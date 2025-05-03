import { Loader, MoreHorizontal, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["allprojects", workspaceId],
          });;
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          navigate(`/workspace/${workspaceId}`);
          setTimeout(() => onCloseDialog(), 100);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };


  return (
    <>
      {isError && <div>Error occurred</div>}

      {isPending ? (
        <Loader className="w-5 h-5 animate-spin place-self-center" />
      ) : projects?.length === 0 ? (
        <li className="nav-item">
          <div className="nav-announce">
            There is no project in this Workspace yet.
            Projects created will be shown up here.
          </div>
        </li>
      ) : (
        <>
          {projects.map((item) => {
            const projectUrl = `/workspace/${workspaceId}/project/${item._id}`;
            const isActive = pathname === projectUrl;
            return (
              <li key={item._id} className={`nav-item ${isActive ? "active" : ""}`}>
                <div className="flex items-center justify-between w-full">
                  <Link
                    to={projectUrl}
                    className={`nav-link flex items-center ${pathname.includes("/overview") ? "active" : ""}`}
                  >
                    {item.emoji}
                    <span className="ml-[10px]">{item.name}</span>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <a
                        href=""
                        id="profile-dropdown"
                        data-toggle="dropdown"
                        className="p-2 rounded-md transition-colors text-[#6c7293] hover:text-[#6c7293]"
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

                      <PermissionsGuard requiredPermission={Permissions.DELETE_PROJECT}>
                        <DropdownMenuItem disabled={isLoading} onClick={() => onOpenDialog(item)}>
                          <Trash2 className="mr-2" />
                          <span>Delete Project</span>
                        </DropdownMenuItem>
                      </PermissionsGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <ConfirmDialog
                    isOpen={open}
                    isLoading={isLoading}
                    onClose={onCloseDialog}
                    onConfirm={handleConfirm}
                    title="Delete Project"
                    description={`Are you sure you want to delete ${context?.name || "this item"}? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                  />
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

        </>
      )}
    </>
  );
}
