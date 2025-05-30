import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateTaskForm from "./create-task-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

const CreateTaskDialog = (props: { projectId?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const onClose = () => {
    setIsOpen(false);
  }

  return (
    <div>
      <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="create"
            className="flex items-center gap-2 px-3 py-2 text-sm md:text-base md:px-4"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t("taskboard-createbtn")}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
          <DialogTitle className="sr-only">Create Task</DialogTitle>
          <DialogDescription className="sr-only">Task decription</DialogDescription>
          <CreateTaskForm projectId={props.projectId} onClose={onClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTaskDialog;
