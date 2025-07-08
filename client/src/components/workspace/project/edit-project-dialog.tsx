import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditProjectForm from "./edit-project-form";
import { ProjectType } from "@/types/api.type";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

interface EditProjectDialogProps {
  project?: ProjectType;
  isOpen: boolean;
  onClose: () => void;
}

const EditProjectDialog = ({ project, isOpen, onClose }: EditProjectDialogProps) => {
  return (
    <Dialog modal={true} open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg border-0">
        <DialogTitle className="sr-only">Edit Project</DialogTitle>
        <DialogDescription className="sr-only">Change the information of Project</DialogDescription>
        <EditProjectForm project={project} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;