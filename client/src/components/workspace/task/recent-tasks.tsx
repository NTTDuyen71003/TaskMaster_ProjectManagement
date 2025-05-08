import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn } from "@/lib/api";
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformStatusEnum,
} from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";


const RecentTasks = () => {
  const workspaceId = useWorkspaceId();
  const { t } = useTranslation();

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
        <div className="font-semibold text-sm text-muted-foreground text-center py-5">
          {t("dashboard-task-announce")}
        </div>
      )}

      {/* Table only shown when tasks exist */}
      {tasks.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Task code</th>
                <th>Task title</th>
                <th>Created</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const name = task?.assignedTo?.name || "";
                const initials = getAvatarFallbackText(name);
                const avatarColor = getAvatarColor(name);

                return (
                  <tr key={task._id}>
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
                    <td>{task.taskCode}</td>
                    <td>{task.title}</td>
                    <td>Due: {task.dueDate ? format(task.dueDate, "PPP") : null}</td>
                    <td>
                      <label className="badge badge-danger">
                        {transformStatusEnum(task.status)}
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentTasks;

//   const tasks = [
//     {
//       id: "Task-12",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-13",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-14",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-15",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-16",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//   ];
//   return (
//     <div className="flex flex-col pt-2">
//       <ul role="list" className="space-y-2">
//         {tasks.map((item, index) => (
//           <li
//             key={index}
//             role="listitem"
//             className="shadow-none border-0 py-2 hover:bg-[#fbfbfb] transition-colors ease-in-out "
//           >
//             <div className="grid grid-cols-7 gap-1 p-0">
//               <div className="shrink">
//                 <p>{item.id}</p>
//               </div>
//               <div className="col-span-2">
//                 <p className="text-sm font-medium leading-none">{item.title}</p>
//               </div>
//               <div>dueDate</div>
//               <div>Todo</div>
//               <div>High</div>
//               <div className="flex items-center gap-4 place-self-end">
//                 <span className="text-sm text-gray-500">Assigned To</span>
//                 <Avatar className="hidden h-9 w-9 sm:flex">
//                   <AvatarImage src="/avatars/01.png" alt="Avatar" />
//                   <AvatarFallback>{item.assigneeTo}</AvatarFallback>
//                 </Avatar>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default RecentTasks;
