import TaskTable from "@/components/workspace/task/task-table";
import { useTranslation } from "react-i18next";

export default function Tasks() {
  useTranslation();

  
  return (
    <div className="main-panel">
      <div className="content-wrapper">
        <div className="page-header">
          <nav aria-label="breadcrumb"></nav>
        </div>
        <div>
          <TaskTable />
        </div>
      </div>
    </div>
  );
}
