import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { TaskType } from "@/types/api.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { deleteTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import EditTaskDialog from "../edit-task-dialog";
import { useAuthContext } from "@/context/auth-provider"; // Import useAuthContext
import { Permissions } from "@/constant"; // Import Permissions
import { useTranslation } from "react-i18next";

interface DataTableRowActionsProps {
  row: Row<TaskType>;
  projectId?: string;
}

export function DataTableRowActions({ row, projectId }: DataTableRowActionsProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { hasPermission } = useAuthContext(); // Get permission checker
  const canDeleteTask = hasPermission(Permissions.DELETE_TASK); // Check DELETE_TASK permission
  const { t } = useTranslation();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteTaskMutationFn,
  });

  const task = row.original;
  const taskId = task._id as string;
  const [open, setOpen] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Delete task handler
  const handleConfirm = () => {
    mutate(
      {
        workspaceId,
        taskId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["all-tasks", workspaceId],
          });
          toast({
            title: t("navbar-create-project-success"),
            description: t("taskboard-table-delete-desc"),
            variant: "success",
            duration: 2500,
          });
          setTimeout(() => setOpenDeleteDialog(false), 100);
        },
        onError: () => {
          toast({
            title: t("settingboard-edit-error"),
            description: t("settingboard-edit-error-description"),
            variant: "destructive",
            duration: 2500,
          });
        },
      }
    );
  };


  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-dropdown-hover-bg ml-3"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpen(false); // Close dropdown
              setOpenEditDialog(true); // Open edit dialog
            }}
          >
            {t("sidebar-projects-edit")}
          </DropdownMenuItem>

          {canDeleteTask && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={`text-red-500 dark:text-white cursor-pointer ${taskId}`}
                onClick={() => setOpenDeleteDialog(true)}
              >
                {t("sidebar-projects-delete")}
                <DropdownMenuShortcut></DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Separate Edit Dialog */}
      <EditTaskDialog
        task={task}
        projectId={projectId}
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
      />

      {/* Delete Confirmation Dialog */}
      {canDeleteTask && (
        <ConfirmDialog
          isOpen={openDeleteDialog}
          isLoading={isPending}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleConfirm}
          title={t("taskboard-delete-task-title")}
          description={t("taskboard-delete-task-description")}
          confirmText={t("sidebar-projects-delete")}
          cancelText={t("sidebar-createworkspace-cancelbtn")}
        />
      )}
    </>

  );
}