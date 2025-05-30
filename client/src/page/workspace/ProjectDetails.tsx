import { Separator } from "@/components/ui/separator";
import ProjectAnalytics from "@/components/workspace/project/project-analytics";
import TaskTable from "@/components/workspace/task/task-table";

const ProjectDetails = () => {
  return (
    <div className="w-full space-y-6 py-4 md:pt-3 mt-5">
      <div className="space-y-5">
        <ProjectAnalytics />
        <Separator />
        {/* {Task Table} */}
        <TaskTable />
      </div>
    </div>
  );
};

export default ProjectDetails;
