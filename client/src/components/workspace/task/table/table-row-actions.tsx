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

  const { mutate, isPending } = useMutation({
    mutationFn: deleteTaskMutationFn,
  });

  const task = row.original;
  const taskId = task._id as string;
  const taskCode = task.taskCode;

  const handleConfirm = () => {
    mutate(
      {
        workspaceId,
        taskId,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["all-tasks", workspaceId],
          });
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          setTimeout(() => setOpenDeleteDialog(false), 100);
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <EditTaskDialog task={task} projectId={projectId}>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              Edit
            </DropdownMenuItem>
          </EditTaskDialog>

          {canDeleteTask && ( // Conditionally render Delete option
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={`!text-destructive cursor-pointer ${taskId}`}
                onClick={() => setOpenDeleteDialog(true)}
              >
                Delete Task
                <DropdownMenuShortcut></DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canDeleteTask && ( // Conditionally render ConfirmDialog
        <ConfirmDialog
          isOpen={openDeleteDialog}
          isLoading={isPending}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleConfirm}
          title="Delete Task"
          description={`Are you sure you want to delete ${taskCode}`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </>
  );
}