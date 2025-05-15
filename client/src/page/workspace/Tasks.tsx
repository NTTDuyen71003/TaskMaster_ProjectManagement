import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import TaskTable from "@/components/workspace/task/task-table";
import { useTranslation } from "react-i18next";

export default function Tasks() {
  const { t } = useTranslation();

  
  return (
    <div className="main-panel">
      <div className="content-wrapper">
        <div className="page-header">
          <h3 className="page-title"> {t("taskboard-title")} </h3>
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
