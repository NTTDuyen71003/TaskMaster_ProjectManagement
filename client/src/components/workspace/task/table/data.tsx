import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import { transformOptions } from "@/lib/helper";


export const statuses = transformOptions(
  Object.values(TaskStatusEnum),
);

export const priorities = transformOptions(
  Object.values(TaskPriorityEnum),
);
