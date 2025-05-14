import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import TaskTable from "@/components/workspace/task/task-table";

export default function Tasks() {
  return (
    <div className="main-panel">
      <div className="content-wrapper">
        <div className="page-header">
          <h3 className="page-title"> All Tasks </h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <CreateTaskDialog />
            </ol>
          </nav>
        </div>
        <div>
          <TaskTable />
        </div>
      </div>
    </div>
  );
}
