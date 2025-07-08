import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditTaskForm from "./edit-task-form";
import { useState } from "react";
import { TaskType } from "@/types/api.type";

type EditTaskDialogProps = {
  task: TaskType;
  projectId?: string;
  children?: React.ReactNode;
  open?: boolean; // Optional controlled prop
  onOpenChange?: (open: boolean) => void; // Optional controlled prop
};

const EditTaskDialog = ({
  task,
  projectId,
  children,
  open,
  onOpenChange,
}: EditTaskDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined && onOpenChange !== undefined;

  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const handleClose = () => setOpen(false);

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
        <DialogTitle className="sr-only">Edit Task</DialogTitle>
        <DialogDescription className="sr-only">Task description</DialogDescription>
        <EditTaskForm task={task} projectId={projectId} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
