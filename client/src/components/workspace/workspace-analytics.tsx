import useWorkspaceId from "@/hooks/use-workspace-id";
import AnalyticsCard from "./common/analytics-card";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceAnalyticsQueryFn } from "@/lib/api";
import { useTranslation } from "react-i18next";


const WorkspaceAnalytics = () => {
  const workspaceId = useWorkspaceId();
  const { t } = useTranslation();

  
  const { data, isPending } = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const analytics = data?.analytics;

  return (
    <div className="row">

      {/* Total task */}
      <div className="col-xl-3 col-sm-6 grid-margin stretch-card">
        <AnalyticsCard
          isLoading={isPending}
          title={t("dashboard-total-task")}
          value={analytics?.totalTasks || 0}
        />
      </div>

      {/* overdue task */}
      <div className="col-xl-3 col-sm-6 grid-margin stretch-card">
        <AnalyticsCard
          isLoading={isPending}
          title={t("dashboard-overdue-task")}
          value={analytics?.overdueTasks || 0}
        />
      </div>

      {/* completed task */}
      <div className="col-xl-3 col-sm-6 grid-margin stretch-card">
        <AnalyticsCard
          isLoading={isPending}
          title={t("dashboard-completed-task")}
          value={analytics?.completedTasks || 0}
        />
      </div>
    </div>
  );
};

export default WorkspaceAnalytics;