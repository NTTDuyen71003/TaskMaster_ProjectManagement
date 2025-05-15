import { FC, useState } from "react";
import { getColumns } from "./table/columns";
import { DataTable } from "./table/table";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { priorities, statuses } from "./table/data";
import useTaskTableFilter from "@/hooks/use-task-table-filter";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useQuery } from "@tanstack/react-query";
import { getAllTasksQueryFn } from "@/lib/api";
import { TaskType } from "@/types/api.type";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-member";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { t } from "i18next";
import { Search, Filter, RefreshCcw, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";


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
    <div className="col-12 grid-margin">
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


// Thay đổi component DataTableFilterToolbar
const DataTableFilterToolbar: FC<DataTableFilterToolbarProps> = ({
  isLoading,
  projectId,
  filters,
  setFilters,
}) => {
  const workspaceId = useWorkspaceId();

  const { data } = useGetProjectsInWorkspaceQuery({
    workspaceId,
  });

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
          <Avatar className="h-9 w-9">
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

  // Kiểm tra xem có bộ lọc nào đang được áp dụng không
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== null && value !== ""
  );


  // Tính toán các bộ lọc hiện đang áp dụng
  const getActiveFilters = () => {
    const activeFilters: { type: string; value: string; label: string; }[] = [];

    // Tạo danh sách các bộ lọc status đang áp dụng
    if (filters.status) {
      const statusValues = filters.status.split(',');
      statusValues.forEach(value => {
        const statusOption = statuses.find(opt => opt.value === value);
        if (statusOption) {
          activeFilters.push({
            type: 'status',
            value,
            label: typeof statusOption.label === 'string' ? statusOption.label : 'Status'
          });
        }
      });
    }

    // Tạo danh sách các bộ lọc priority đang áp dụng
    if (filters.priority) {
      const priorityValues = filters.priority.split(',');
      priorityValues.forEach(value => {
        const priorityOption = priorities.find(opt => opt.value === value);
        if (priorityOption) {
          activeFilters.push({
            type: 'priority',
            value,
            label: typeof priorityOption.label === 'string' ? priorityOption.label : 'Priority'
          });
        }
      });
    }

    // Tạo danh sách các bộ lọc assignee đang áp dụng
    if (filters.assigneeId) {
      const assigneeValues = filters.assigneeId.split(',');
      assigneeValues.forEach(value => {
        const assigneeOption = assigneesOptions.find(opt => opt.value === value);
        if (assigneeOption) {
          activeFilters.push({
            type: 'assigneeId',
            value,
            label: 'Assignee'  // Dùng tên chung vì label là JSX
          });
        }
      });
    }

    // Tạo danh sách các bộ lọc project đang áp dụng
    if (filters.projectId) {
      const projectValues = filters.projectId.split(',');
      projectValues.forEach(value => {
        const projectOption = projectOptions.find(opt => opt.value === value);
        if (projectOption) {
          activeFilters.push({
            type: 'projectId',
            value,
            label: 'Project'  // Dùng tên chung vì label là JSX
          });
        }
      });
    }

    return activeFilters;
  };

  const removeFilter = (type: string, value: string) => {
    if (!filters[type as keyof Filters]) return;

    const currentValues = filters[type as keyof Filters]?.split(',') || [];
    const newValues = currentValues.filter(v => v !== value);

    handleFilterChange(type as keyof Filters, newValues);
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="flex flex-col w-full gap-3 mb-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3">
        {/* Thanh tìm kiếm có icon */}
        <div className="relative w-full sm:w-[280px] mt-2">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search size={14} />
          </div>
          <Input
            placeholder={t("taskboard-search-placeholder")}
            value={filters.keyword || ""}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            className="h-9 pl-8 mr-2 w-full text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-offset-0"
          />
          {filters.keyword && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setFilters({ ...filters, keyword: "" })}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Các filter button có popover */}
        <div className="flex flex-wrap gap-2 mt-2 lg:mt-0">
          {/* Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                className={cn(
                  "h-10 px-3 flex items-center gap-1 border shadow-sm",
                  filters.status ? "bg-dropdown-hover-bg/10 border-sidebar-frameicon text-sidebar-text" : "bg-background"
                )}
              >
                <span>{t("taskboard-status")}</span>
                {filters.status && (
                  <Badge className="ml-1 bg-sidebar-frameicon text-white" variant="option">
                    {filters.status.split(',').length}
                  </Badge>
                )}
                <ChevronDown size={14} className="ml-1 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                {statuses.map(option => {
                  const isSelected = filters.status?.split(',').includes(option.value) || false;
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center px-2 py-1.5 rounded-md cursor-pointer text-sm",
                        isSelected ? "bg-dropdown-hover-bg/10 text-sidebar-text" : "hover:bg-muted"
                      )}
                      onClick={() => {
                        const currentValues = filters.status?.split(',').filter(Boolean) || [];
                        const newValues = isSelected
                          ? currentValues.filter(v => v !== option.value)
                          : [...currentValues, option.value];
                        handleFilterChange("status", newValues);
                      }}
                    >
                      <div className="flex items-center flex-1">
                        {option.label}
                      </div>
                      {isSelected && <div>✓</div>}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Priority Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                className={cn(
                  "h-10 px-3 flex items-center gap-1 border shadow-sm",
                  filters.priority ? "bg-dropdown-hover-bg/10 border-sidebar-frameicon text-sidebar-text" : "bg-background"
                )}
              >
                <span>{t("taskboard-piority")}</span>
                {filters.priority && (
                  <Badge className="ml-1 bg-sidebar-frameicon text-white" variant="option">
                    {filters.priority.split(',').length}
                  </Badge>
                )}
                <ChevronDown size={14} className="ml-1 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                {priorities.map(option => {
                  const isSelected = filters.priority?.split(',').includes(option.value) || false;
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center px-2 py-1.5 rounded-md cursor-pointer text-sm",
                        isSelected ? "bg-dropdown-hover-bg/10" : "hover:bg-muted"
                      )}
                      onClick={() => {
                        const currentValues = filters.priority?.split(',').filter(Boolean) || [];
                        const newValues = isSelected
                          ? currentValues.filter(v => v !== option.value)
                          : [...currentValues, option.value];
                        handleFilterChange("priority", newValues);
                      }}
                    >
                      <div className="flex items-center flex-1">
                        {option.label}
                      </div>
                      {isSelected && <div>✓</div>}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Assigned To Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                className={cn(
                  "h-10 px-3 flex items-center gap-1 border shadow-sm",
                  filters.assigneeId ? "bg-dropdown-hover-bg/10 border-sidebar-frameicon text-sidebar-text" : "bg-background"
                )}
              >
                <span>{t("taskboard-assignedto")}</span>
                {filters.assigneeId && (
                  <Badge className="ml-1 bg-sidebar-frameicon text-white" variant="option">
                    {filters.assigneeId.split(',').length}
                  </Badge>
                )}
                <ChevronDown size={14} className="ml-1 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {assigneesOptions.map(option => {
                  const isSelected = filters.assigneeId?.split(',').includes(option.value) || false;
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center px-2 py-1.5 rounded-md cursor-pointer text-sm",
                        isSelected ? "bg-dropdown-hover-bg/10" : "hover:bg-muted"
                      )}
                      onClick={() => {
                        const currentValues = filters.assigneeId?.split(',').filter(Boolean) || [];
                        const newValues = isSelected
                          ? currentValues.filter(v => v !== option.value)
                          : [...currentValues, option.value];
                        handleFilterChange("assigneeId", newValues);
                      }}
                    >
                      <div className="flex items-center flex-1">
                        {option.label}
                      </div>
                      {isSelected && <div>✓</div>}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Projects Filter - Chỉ hiển thị khi không có projectId */}
          {!projectId && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className={cn(
                    "h-10 px-3 flex items-center gap-1 border shadow-sm",
                    filters.projectId ? "bg-dropdown-hover-bg/10 border-sidebar-frameicon text-sidebar-text" : "bg-background"
                  )}
                >
                  <span>{t("sidebar-projects")}</span>
                  {filters.projectId && (
                    <Badge className="ml-1 bg-sidebar-frameicon text-white" variant="option">
                      1
                    </Badge>
                  )}
                  <ChevronDown size={14} className="ml-1 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {projectOptions.map(option => {
                    const isSelected = filters.projectId?.split(',').includes(option.value) || false;
                    return (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-center px-2 py-1.5 rounded-md cursor-pointer text-sm",
                          isSelected ? "bg-dropdown-hover-bg/10" : "hover:bg-muted"
                        )}
                        onClick={() => {
                          handleFilterChange("projectId", isSelected ? [] : [option.value]);
                        }}
                      >
                        <div className="flex items-center flex-1">
                          {option.label}
                        </div>
                        {isSelected && <div className="bg-sidebar">✓</div>}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Reset button - Chỉ hiển thị khi có bộ lọc đang áp dụng */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() =>
                setFilters({
                  keyword: null,
                  status: null,
                  priority: null,
                  projectId: null,
                  assigneeId: null,
                })
              }
            >
              <RefreshCcw size={14} className="mr-1.5" />
              {t("taskboard-reset")}
            </Button>
          )}
        </div>
      </div>

      {/* Hiển thị các bộ lọc đang áp dụng */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 mt-1">
          <div className="flex items-center text-xs text-muted-foreground mr-1">
            <Filter size={12} className="mr-1" />
            {t("applied-filters", "Applied filters")}:
          </div>

          {activeFilters.map((filter, idx) => (
            <Badge
              key={`${filter.type}-${filter.value}-${idx}`}
              variant="outline"
              className="flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 h-6 text-xs"
            >
              {filter.label}
              <button
                className="ml-1 text-muted-foreground hover:text-foreground"
                onClick={() => removeFilter(filter.type, filter.value)}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskTable;