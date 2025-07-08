import { FC, useState } from "react";
import { getColumns } from "./table/columns";
import { DataTable } from "./table/table";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTableFacetedFilter } from "./table/table-faceted-filter";
import useTaskTableFilter from "@/hooks/use-task-table-filter";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useQuery } from "@tanstack/react-query";
import { getAllTasksQueryFn } from "@/lib/api";
import { TaskType } from "@/types/api.type";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-member";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";


type Filters = ReturnType<typeof useTaskTableFilter>[0];
type SetFilters = ReturnType<typeof useTaskTableFilter>[1];

interface DataTableFilterToolbarProps {
  isLoading?: boolean;
  projectId?: string;
  filters: Filters;
  setFilters: SetFilters;
}

const TaskTable = () => {
  const param = useParams();
  const projectId = param.projectId as string;
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useTaskTableFilter();
  const workspaceId = useWorkspaceId();
  const columns = getColumns(projectId);

  //bảng task
  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId, pageSize, pageNumber, filters, projectId,],
    queryFn: () => getAllTasksQueryFn({
      workspaceId,
      keyword: filters.keyword,
      priority: filters.priority,
      status: filters.status,
      projectId: projectId || filters.projectId,
      assignedTo: filters.assigneeId,
      pageNumber,
      pageSize,
    }),
    staleTime: 0,// Replace with your data fetching function
  });

  const tasks: TaskType[] = data?.tasks || [];
  const totalCount = data?.pagination.totalCount || 0;

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  // Handle page size changes
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  return (
    <div className="w-full relative">
      <DataTable
        isLoading={isLoading}
        data={tasks}
        columns={columns}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pagination={{
          totalCount,
          pageNumber,
          pageSize,
        }}
        filtersToolbar={
          <DataTableFilterToolbar
            isLoading={isLoading}
            projectId={projectId}
            filters={filters}
            setFilters={setFilters}
          />
        }
      />
    </div>
  );
};

const DataTableFilterToolbar: FC<DataTableFilterToolbarProps> = ({
  isLoading,
  projectId,
  filters,
  setFilters,
}) => {
  const workspaceId = useWorkspaceId();

  const { data } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageSize: 100, //  Can add more projects if needed
  })

  const { data: menberData } = useGetWorkspaceMembers(workspaceId);

  const projects = data?.projects || [];
  const members = menberData?.members || [];

  //Workspace Projects
  const projectOptions = projects?.map((project) => {
    return {
      label: (
        <div className="flex items-center gap-1">
          <span>{project.emoji}</span>
          <span>{project.name}</span>
        </div>
      ),
      value: project._id,
    };
  });

  // Workspace Memebers
  const assigneesOptions = members?.map((member) => {
    const name = member.userId?.name || "Unknown";
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);
    return {
      label: (
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      ),
      value: member.userId._id,
    };
  });

  const handleFilterChange = (key: keyof Filters, values: string[]) => {
    setFilters({
      ...filters,
      [key]: values.length > 0 ? values.join(",") : null,
    });
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: null,
      status: null,
      priority: null,
      projectId: null,
      assigneeId: null,
    });
  };

  const removeSpecificFilter = (filterKey: keyof Filters, valueToRemove: string) => {
    const currentValues = filters[filterKey]?.split(",") || [];
    const updatedValues = currentValues.filter(val => val !== valueToRemove);
    handleFilterChange(filterKey, updatedValues);
  };

  const getFilterLabel = (key: string, value: string, options: Array<{ label: any; value: string }>) => {
    const option = options.find(opt => opt.value === value);
    if (key === 'status') {
      return statuses.find(s => s.value === value)?.label || value;
    }
    if (key === 'priority') {
      return priorities.find(p => p.value === value)?.label || value;
    }
    // For complex labels (JSX), extract text content or use value as fallback
    if (option && typeof option.label === 'string') {
      return option.label;
    }
    return value;
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== null && value !== ""
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const { t } = useTranslation();

  const getAssigneeName = (assigneeId: string) => {
    const assignee = assigneesOptions.find(option => option.value === assigneeId);
    return assignee ? assignee.label : assigneeId; // fallback to ID if not found
  };

  const getProjectName = (projectId: string) => {
    const project = projectOptions.find(option => option.value === projectId);
    return project ? project.label : projectId; // fallback to ID if not found
  };

  const statuses = Object.values(TaskStatusEnum).map(status => ({
    value: status,
    label: t(`status-${status.toLowerCase().replace('_', '-')}`),
  }));

  const priorities = Object.values(TaskPriorityEnum).map(priority => ({
    value: priority,
    label: t(`priority-${priority.toLowerCase()}`),
  }));


  return (
    <div className="space-y-4">
      {/* Main Filter Controls */}
      <div className="flex flex-col lg:flex-row w-full items-start space-y-3 lg:space-y-0 lg:space-x-3 mb-3">
        {/*Search */}
        <div className="relative w-full lg:w-[280px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-muted" />
          </div>
          <Input
            placeholder={t("taskboard-search")}
            value={filters.keyword || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                keyword: e.target.value || null,
              })
            }
            className="pl-10 h-9 hover:border-solid focus:border-solid bg-sidebar"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <DataTableFacetedFilter
            title={t("dashboard-task-status")}
            multiSelect={true}
            options={statuses}
            disabled={isLoading}
            selectedValues={filters.status?.split(",") || []}
            onFilterChange={(values) => handleFilterChange("status", values)}
          />

          {/* Priority filter */}
          <DataTableFacetedFilter
            title={t("dashboard-task-priority")}
            multiSelect={true}
            options={priorities}
            disabled={isLoading}
            selectedValues={filters.priority?.split(",") || []}
            onFilterChange={(values) => handleFilterChange("priority", values)}
          />

          {/* Assigned To filter */}
          <DataTableFacetedFilter
            title={t("dashboard-task-user")}
            multiSelect={true}
            options={assigneesOptions}
            disabled={isLoading}
            selectedValues={filters.assigneeId?.split(",") || []}
            onFilterChange={(values) => handleFilterChange("assigneeId", values)}
          />

          {/* Project filter */}
          {!projectId && (
            <DataTableFacetedFilter
              title={t("sidebar-projects")}
              multiSelect={false}
              options={projectOptions}
              disabled={isLoading}
              selectedValues={filters.projectId?.split(",") || []}
              onFilterChange={(values) => handleFilterChange("projectId", values)}
            />
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-sidebar-input rounded-lg border">
          <span className="text-sm font-medium text-muted">{t("taskboard-active-filter")}</span>

          {/* Keyword filter */}
          {filters.keyword && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            >
              <span className="text-xs font-medium">{t("taskboard-search-all")}</span>
              <span className="max-w-[100px] truncate">{filters.keyword}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-slate-200 ml-1"
                onClick={() => setFilters({ ...filters, keyword: null })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {/* Status filters */}
          {filters.status?.split(",").map(status => (
            <Badge
              key={`status-${status}`}
              variant="secondary"
              className="gap-1 pr-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <span className="text-xs font-medium">{t("dashboard-task-status")}:</span>
              {getFilterLabel("status", status, [])}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-blue-200 ml-1"
                onClick={() => removeSpecificFilter("status", status)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {/* Priority filters */}
          {filters.priority?.split(",").map(priority => (
            <Badge
              key={`priority-${priority}`}
              variant="secondary"
              className="gap-1 pr-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
            >
              <span className="text-xs font-medium">{t("dashboard-task-priority")}:</span>
              {getFilterLabel("priority", priority, [])}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-orange-200 ml-1"
                onClick={() => removeSpecificFilter("priority", priority)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {/* Assignee filters */}
          {filters.assigneeId?.split(",").map(assigneeId => (
            <Badge
              key={`assignee-${assigneeId}`}
              variant="secondary"
              className="gap-1 pr-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <span className="text-xs font-medium">{t("dashboard-task-user")}:</span>
              {getAssigneeName(assigneeId)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-green-200 ml-1"
                onClick={() => removeSpecificFilter("assigneeId", assigneeId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {/* Project filters */}
          {filters.projectId?.split(",").map(projectIdFilter => (
            <Badge
              key={`project-${projectIdFilter}`}
              variant="secondary"
              className="gap-1 pr-1 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
            >
              <span className="text-xs font-medium">{t("taskboard-form-create-project")}:</span>
              {getProjectName(projectIdFilter)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-purple-200 ml-1"
                onClick={() => removeSpecificFilter("projectId", projectIdFilter)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {/* Clear All Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="h-7 px-3 text-xs bg-sidebar hover:border-sidebar-border transition-all duration-200"
          >
            {t("taskboard-clear-all")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskTable;