import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EditTaskForm from "./edit-task-form";
import { useState } from "react";
import { TaskType } from "@/types/api.type";

const EditTaskDialog = ({
    task,
    projectId,
    children,
}: {
    task: TaskType;
    projectId?: string;
    children: React.ReactNode;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const onClose = () => setIsOpen(false);

    return (
        <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
                <EditTaskForm task={task} projectId={projectId} onClose={onClose} />
            </DialogContent>
        </Dialog>
    );
};

export default EditTaskDialog;
