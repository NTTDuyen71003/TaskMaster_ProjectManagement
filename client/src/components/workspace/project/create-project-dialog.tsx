import { Dialog, DialogContent } from "@/components/ui/dialog";
import CreateProjectForm from "@/components/workspace/project/create-project-form";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

const CreateProjectDialog = () => {
  const { open, onClose } = useCreateProjectDialog();

  
  return (
    <div>
      <Dialog modal={true} open={open} onOpenChange={onClose}>
        <DialogContent className="col-12 grid-margin stretch-card">
          <DialogTitle className="sr-only">Create Project</DialogTitle>
          <DialogDescription className="sr-only">Description </DialogDescription>
          <CreateProjectForm {...{onClose}} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProjectDialog;
