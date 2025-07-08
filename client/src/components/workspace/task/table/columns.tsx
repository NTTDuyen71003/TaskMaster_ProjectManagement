import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";

import { DataTableColumnHeader } from "./table-column-header";
import { DataTableRowActions } from "./table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  TaskPriorityEnum,
  TaskPriorityEnumType,
  TaskStatusEnum,
  TaskStatusEnumType,
} from "@/constant";
import {
  formatStatusToEnum,
  getAvatarColor,
  getAvatarFallbackText,
} from "@/lib/helper";
import { priorities, statuses } from "./data";
import { TaskType } from "@/types/api.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import i18n from "@/languages/i18n";
import { getDateFnsLocale } from "@/languages/getDateFnsLocale";

// Header table task
export const getColumns = (projectId?: string): ColumnDef<TaskType>[] => {
  const { t } = useTranslation();
  const lang = i18n.language;
  const formatStr = lang === "vi" ? "dd'/'MM'/'yyyy" : "PPP";
  const dateLocale = getDateFnsLocale();

  const columns: ColumnDef<TaskType>[] = [
    {
      id: "_id",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "taskCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("dashboard-task-code")} />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize h-[25px]">
          {row.original.taskCode}
        </Badge>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("dashboard-task-title")} />
      ),
      cell: ({ row }) => (
        <span className="block font-medium ml-2">{row.original.title}</span>
      ),
    },

    ...(projectId
      ? [] // If projectId exists, exclude the "Project" column
      : [
        {
          accessorKey: "project",
          header: ({ column }: { column: Column<TaskType, unknown> }) => (
            <DataTableColumnHeader column={column} title={t("taskboard-form-create-project")} />
          ),
          cell: ({ row }: { row: Row<TaskType> }) => {
            const project = row.original.project;

            if (!project) {
              return null;
            }

            return (
              <div className="flex items-center gap-1">
                <span className="rounded-full border">{project.emoji}</span>
                <span className="block capitalize truncate w-[120px] text-ellipsis">
                  {project.name}
                </span>
              </div>
            );
          },
        },
      ]),
    {
      accessorKey: "assignedTo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("dashboard-task-user")} />
      ),
      cell: ({ row }) => {
        const assignee = row.original.assignedTo || null;
        const name = assignee?.name || "";

        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);

        return (
          name && (
            <div className="flex items-center gap-1">
              <Avatar className="h-9 w-9">
                <AvatarImage src={assignee?.profilePicture || ""} alt={name} />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="block text-ellipsis w-[120px]">
                {assignee?.name}
              </span>
            </div>
          )
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("taskboard-create-task-duedate")} />
      ),
      cell: ({ row }) => {
        return (
          <span className="lg:max-w-[100px] text-sm ml-1">
            {row.original.dueDate
              ? format(new Date(row.original.dueDate), formatStr, { locale: dateLocale })
              : null}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("dashboard-task-status")} />
      ),
      cell: ({ row }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue("status")
        );

        if (!status) {
          return null;
        }

        const statusKey = formatStatusToEnum(
          status.value
        ) as TaskStatusEnumType;

        const translationKey = statusKey.toLowerCase().replace(/_/g, '_');

        return (
          <div className="flex lg:w-[120px] items-center">
            <Badge
              variant={TaskStatusEnum[statusKey]}
              className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0 ml-1"
            >
              <span>{t(`dashboard-status-${translationKey}`)}</span>
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("dashboard-task-priority")} />
      ),
      cell: ({ row }) => {
        const priority = priorities.find(
          (priority) => priority.value === row.getValue("priority")
        );

        if (!priority) {
          return null;
        }

        const statusKey = formatStatusToEnum(
          priority.value
        ) as TaskPriorityEnumType;

        const translationKey = statusKey.toLowerCase().replace(/_/g, '_');

        return (
          <div className="flex items-center">
            <Badge
              variant={TaskPriorityEnum[statusKey]}
              className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0 ml-2"
            >
              <span>{t(`dashboard-priority-${translationKey}`)}</span>
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("taskboard-column-actions")} />
      ),
      cell: ({ row }) => {
        return (
          <>
            <DataTableRowActions row={row} />
          </>
        );
      },
    },
  ];

  return columns;
};
