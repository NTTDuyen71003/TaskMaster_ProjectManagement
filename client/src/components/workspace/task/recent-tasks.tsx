import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getDateFnsLocale } from "@/languages/getDateFnsLocale";
import i18n from "@/languages/i18n";
import { getAllTasksQueryFn } from "@/lib/api";
import {
  getAvatarColor,
  getAvatarFallbackText,
} from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";


const RecentTasks = () => {
  const workspaceId = useWorkspaceId();
  const { t } = useTranslation();
  const dateLocale = getDateFnsLocale();
  const lang = i18n.language;

  const formatStr = lang === "vi" ? "dd'/'MM'/'yyyy" : "PPP";

  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId],
    queryFn: () => getAllTasksQueryFn({
      workspaceId,
    }),
    staleTime: 0,
    enabled: !!workspaceId,
  });
  const tasks: TaskType[] = data?.tasks || [];


  // Scalable component
  return (
    <div className="flex flex-col space-y-6">
      {/* Loader */}
      {isLoading ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      ) : null}

      {/* No tasks message */}
      {!isLoading && tasks.length === 0 && (
        <div className="font-semibold text-sm text-muted text-center py-5">
          {t("dashboard-task-announce")}
        </div>
      )}

      {/* Table only shown when tasks exist */}
      {tasks.length > 0 && (
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t("dashboard-task-user")}</th>
                      <th>{t("dashboard-task-inproject")}</th>
                      <th>{t("dashboard-task-code")}</th>
                      <th>{t("dashboard-task-title")}</th>
                      <th>{t("dashboard-task-created")}</th>
                      <th>{t("dashboard-task-status")}</th>
                      <th>{t("dashboard-task-priority")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const name = task?.assignedTo?.name || "";
                      const initials = getAvatarFallbackText(name);
                      const avatarColor = getAvatarColor(name);

                      return (
                        <tr key={task._id} className="hover:bg-dropdown-hover-bg transition-colors duration-200">

                          {/* Assignee */}
                          <td>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={task.assignedTo?.profilePicture || ""} alt={task.assignedTo?.name} />
                                <AvatarFallback className={avatarColor}>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span>{task.assignedTo?.name}</span>
                            </div>
                          </td>

                          {/* Task project */}
                          <td>{task.project?.name}</td>

                          {/* Task code */}
                          <td>{task.taskCode}</td>

                          {/* Task title */}
                          <td>{task.title}</td>

                          {/* Created date */}
                          <td>
                            {i18n.language === "en" && "Due: "}
                            {i18n.language === "vi" && "Hạn: "}
                            {task.dueDate
                              ? format(new Date(task.dueDate), formatStr, { locale: dateLocale })
                              : null}
                          </td>

                          {/* Status */}
                          <td>
                            <label
                              className={`badge ${task.status === "IN_PROGRESS"
                                ? "badge-warning"
                                : task.status === "DONE"
                                  ? "badge-success"
                                  : task.status === "TODO"
                                    ? "badge-info"
                                    : "badge-danger"
                                }`}
                            >
                              {t(`dashboard-status-${task.status.toLowerCase()}`)}
                            </label>
                          </td>

                          {/* Priority */}
                          <td>
                            <label
                              className={`badge ${task.priority === "HIGH"
                                ? "badge-danger"
                                : task.priority === "LOW"
                                  ? "badge-success"
                                  : "badge-warning"
                                }`}
                            >
                              {t(`dashboard-priority-${task.priority.toLowerCase()}`)}
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentTasks;

