import { useParams } from "react-router-dom";
import AnalyticsCard from "../common/analytics-card";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useQuery } from "@tanstack/react-query";
import { getProjectAnalyticsQueryFn } from "@/lib/api";
import { useTranslation } from "react-i18next";

const ProjectAnalytics = () => {
  const param=useParams();
  const projectId=param.projectId as string;
  const workspaceId=useWorkspaceId();
  const { t } = useTranslation();

  //lay du lieu thuc te so luong cac task
  const {data,isPending}=useQuery({
    queryKey: ["project-analytics",projectId],
    queryFn: () => getProjectAnalyticsQueryFn({workspaceId,projectId}),
    staleTime: 0,
    enabled: !!projectId,
  })

  const analytics=data?.analytics;

  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-2 xl:grid-cols-3">
      <AnalyticsCard
        isLoading={isPending}
        title={t("dashboard-total-task")}
        value={analytics?.totalTasks || 0}
      />
      <AnalyticsCard
        isLoading={isPending}
        title={t("dashboard-overdue-task")}
        value={analytics?.overdueTasks || 0}
      />
      <AnalyticsCard
        isLoading={isPending}
        title={t("dashboard-completed-task")}
        value={analytics?.completedTasks || 0}
      />
    </div>
  );
};

export default ProjectAnalytics;
