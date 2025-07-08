import { useParams } from "react-router-dom";
import { useState } from "react"; // ← ADD THIS IMPORT
import CreateTaskDialog from "../task/create-task-dialog";
import EditProjectDialog from "./edit-project-dialog";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProjectByIdQueryFn } from "@/lib/api";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";
import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";

const ProjectHeader = () => {
  const param = useParams();
  const projectId = param.projectId as string;
  const { t } = useTranslation();
  const workspaceId = useWorkspaceId();
  
  // ← ADD THIS STATE
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ["singleProject", projectId],
    queryFn: () => getProjectByIdQueryFn({
      workspaceId,
      projectId,
    }),
    staleTime: Infinity,
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });

  const project = data?.project;

  // Fallback if no project data is found
  const projectEmoji = project?.emoji || "📊";
  const projectName = project?.name || "Untitled project";

  const renderContent = () => {
    if (!projectId) {
      return <h4 className="card-title">{t("taskboard-title")}</h4>;
    }

    if (isPending) return <h4 className="card-title">{t("sidebar-loading")}</h4>;
    if (isError) return <h4 className="card-title">{t("project-load-fail")}</h4>;

    return (
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span>{projectEmoji}</span>
          <span className="text-base font-semibold">{projectName}</span>
        </div>
        <PermissionsGuard requiredPermission={Permissions.EDIT_PROJECT}>
          <button 
            onClick={() => setIsEditDialogOpen(true)}
            className="p-1 hover:bg-dropdown-hover-bg rounded"
          >
          <Pencil className="w-4 h-4"/>
          </button>
          <EditProjectDialog
            project={project}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
          />
        </PermissionsGuard>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between">
      {renderContent()}
      <CreateTaskDialog projectId={projectId} />
    </div>
  );
};

export default ProjectHeader;