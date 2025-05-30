import { TaskPriorityEnumType, TaskStatusEnumType } from '@/constant';
import { AllMembersInWorkspaceResponseType, AllProjectPayloadType, AllProjectResponseType, AllTaskPayloadType, AllTaskResponseType, AllWorkspaceResponseType, AnalyticsResponseType, ChangeWorkspaceMemberRoleType, CreateProjectPayloadType, CreateTaskPayloadType, CreateWorkspaceResponseType, CreateWorkspaceType, EditProjectPayloadType, EditWorkspaceType, LoginResponseType, loginType, ProjectByIdPayloadType, ProjectResponseType, registerType, WorkspaceByIdResponseType } from './../types/api.type';
import API from "./axios-client";
import { CurrentUserResponseType } from "@/types/api.type";

export const loginMutationFn = async (data: loginType): Promise<LoginResponseType> => {
  const response = await API.post(`/auth/login`, data);
  return response.data;
};

export const registerMutationFn = async (data: registerType) =>
  await API.post("/auth/register", data);

export const logoutMutationFn = async () => await API.post("/auth/logout");

export const getCurrentUserQueryFn =
  async (): Promise<CurrentUserResponseType> => {
    const response = await API.get(`/user/current`);
    return response.data;
  };

//********* WORKSPACE ****************
//************* */

export const createWorkspaceMutationFn = async (
  data: CreateWorkspaceType
): Promise<CreateWorkspaceResponseType> => {
  const response = await API.post(`/workspace/create/new`, data);
  return response.data;
};

export const editWorkspaceMutationFn = async ({
  workspaceId,
  data,
}: EditWorkspaceType) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data);
  return response.data;
};

export const getAllWorkspacesUserIsMemberQueryFn =
  async (): Promise<AllWorkspaceResponseType> => {
    const response = await API.get(`/workspace/all`);
    return response.data;
  };

export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`);
  return response.data;
};

export const getMembersInWorkspaceQueryFn = async (
  workspaceId: string
): Promise<AllMembersInWorkspaceResponseType> => {
  const response = await API.get(`/workspace/members/${workspaceId}`);
  return response.data;
};

export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string
): Promise<AnalyticsResponseType> => {
  // Validate workspaceId before making the API call
  if (!workspaceId || workspaceId === 'undefined' || workspaceId === 'null') {
    throw new Error('Invalid workspace ID: User is not associated with any workspace');
  }

  const response = await API.get(`/workspace/analytics/${workspaceId}`);
  return response.data;
};

export const changeWorkspaceMemberRoleMutationFn = async ({
  workspaceId,
  data,
}: ChangeWorkspaceMemberRoleType) => {
  const response = await API.put(
    `/workspace/change/member/role/${workspaceId}`,
    data
  );
  return response.data;
};

// Check if workspace has members
export const checkWorkspaceHasMembersQueryFn = async (
  workspaceId: string
): Promise<{
  hasOtherMembers: boolean;
  membersCount: number;
}> => {
  const response = await API.post(
    `/workspace/check-members/${workspaceId}`
  );
  return response.data;
};

export const deleteWorkspaceMutationFn = async (
  workspaceId: string
): Promise<{
  message: string;
  currentWorkspace: string;
}> => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`);
  return response.data;
};

//checking same workspace name
export const checkWorkspaceNameExistsQueryFn = async ({
  name,
}: {
  name: string;
}): Promise<{ exists: boolean }> => {
  const response = await API.get(
    `/workspace/check-name?name=${encodeURIComponent(name)}`
  );
  return response.data;
};

// Check number of workspace onwer has
export const getOwnerWorkspacesCountQueryFn = async (): Promise<{ count: number }> => {
  const response = await API.get("/workspace/owner/count");
  return response.data;
};


//*******MEMBER ****************

export const invitedUserJoinWorkspaceMutationFn = async (
  iniviteCode: string
): Promise<{
  message: string;
  workspaceId: string;
}> => {
  const response = await API.post(`/member/workspace/${iniviteCode}/join`);
  return response.data;
};


// Check if member has tasks
// export const checkMemberHasTasksQueryFn = async ({
//   workspaceId,
//   memberId,
// }: {
//   workspaceId: string;
//   memberId: string;
// }): Promise<{
//   hasTasks: boolean;
//   tasksCount: number;
// }> => {
//   const response = await API.post(
//     `/workspace/members/check-tasks/${workspaceId}`,
//     { memberId }
//   );
//   return response.data;
// };


// Remove member api
export const deleteWorkspaceMemberMutationFn = async ({
  workspaceId,
  memberId,
}: {
  workspaceId: string;
  memberId: string;
}) => {
  if (!workspaceId || !memberId) {
    throw new Error('workspaceId and memberId are required');
  }

  const response = await API.delete(
    `/workspace/members/delete/${workspaceId}`,
    {
      data: { memberId }
    }
  );
  return response.data;
};

//********* */
//********* PROJECTS
export const createProjectMutationFn = async ({
  workspaceId,
  data,
}: CreateProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.post(
    `/project/workspace/${workspaceId}/create`,
    data
  );
  return response.data;
};


//edit project
export const editProjectMutationFn = async ({
  projectId,
  workspaceId,
  data,
}: EditProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.put(
    `/project/${projectId}/workspace/${workspaceId}/update`,
    data
  );
  return response.data;
};


//goi api lay tat ca cac project trong workspace
export const getProjectsInWorkspaceQueryFn = async ({
  workspaceId,
  pageSize = 10,
  pageNumber = 1,
}: AllProjectPayloadType): Promise<AllProjectResponseType> => {
  const response = await API.get(
    `/project/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`
  );
  return response.data;
};

//kiểm tra project trùng
export const checkProjectNameExistsQueryFn = async ({
  workspaceId,
  name,
}: {
  workspaceId: string;
  name: string;
}): Promise<{ exists: boolean }> => {
  const response = await API.get(
    `/project/workspace/${workspaceId}/check-name?name=${encodeURIComponent(name)}`
  );
  return response.data;
};


//lấy project theo id
export const getProjectByIdQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<ProjectResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}`
  );
  return response.data;
};


//lay task cua project
export const getProjectAnalyticsQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<AnalyticsResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}/analytics`
  );
  return response.data;
};


//xoa project
export const deleteProjectMutationFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<{ message: string; }> => {
  const response = await API.delete(
    `/project/${projectId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};


//*******TASKS ********************************
//************************* */

//tao task
export const createTaskMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: CreateTaskPayloadType) => {
  const response = await API.post(
    `/task/project/${projectId}/workspace/${workspaceId}/create`,
    data
  );
  return response.data;
};


//lay du lieu task
export const getAllTasksQueryFn = async ({
  workspaceId,
  keyword,
  projectId,
  assignedTo,
  priority,
  status,
  dueDate,
  pageNumber,
  pageSize,
}: AllTaskPayloadType): Promise<AllTaskResponseType> => {
  const baseUrl = `/task/workspace/${workspaceId}/all`;

  const queryParams = new URLSearchParams();
  if (keyword) queryParams.append("keyword", keyword);
  if (projectId) queryParams.append("projectId", projectId);
  if (assignedTo) queryParams.append("assignedTo", assignedTo);
  if (priority) queryParams.append("priority", priority);
  if (status) queryParams.append("status", status);
  if (dueDate) queryParams.append("dueDate", dueDate);
  if (pageNumber) queryParams.append("pageNumber", pageNumber?.toString());
  if (pageSize) queryParams.append("pageSize", pageSize?.toString());

  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;
  const response = await API.get(url);
  return response.data;
};

export const editTaskMutationFn = async ({
  workspaceId,
  taskId,
  projectId, // Add projectId parameter
  data,
}: {
  workspaceId: string;
  taskId: string;
  projectId: string; // Add projectId
  data: {
    title: string;
    description: string;
    priority: TaskPriorityEnumType;
    status: TaskStatusEnumType;
    assignedTo: string;
    dueDate: string;
  };
}) => {
  const response = await API.put(
    `/task/${taskId}/project/${projectId}/workspace/${workspaceId}/update`, // Include projectId in URL
    data
  );
  return response.data;
};

export const deleteTaskMutationFn = async ({
  workspaceId,
  taskId,
}: {
  workspaceId: string;
  taskId: string;
}): Promise<{
  message: string;
}> => {
  const response = await API.delete(
    `task/${taskId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};


//********* NOTIFICATIONS ****************
//************* */
export interface Notification {
  _id: string;
  userId: string;
  type:
  | 'MEMBER_REMOVED'
  | 'MEMBER_JOINED'
  | 'WORKSPACE_NAME_CHANGED'
  | 'WORKSPACE_DELETED'
  | 'WORKSPACE_DELETED'
  | 'PROJECT_NAME_CHANGED'
  | 'PROJECT_CREATED'
  | 'PROJECT_DELETED'
  | 'TASK_ASSIGNED'
  | 'TASK_UNASSIGNED'
  | 'TASK_STATUS_CHANGED';

  title: string;
  message: string;
  data: {
    workspaceName?: string;

    // For MEMBER_JOINED
    joinerName?: string;
    joinerProfilePicture?: string;
    joinerId?: string;
    // For MEMBER_REMOVED
    removerName?: string;
    removerProfilePicture?: string;

    // For WORKSPACE_NAME_CHANGED
    oldWorkspaceName?: string;
    newWorkspaceName?: string;
    changerName?: string;
    changerProfilePicture?: string;
    changerId?: string;
    // For WORKSPACE_DELETED
    ownerId?: string;

    // For PROJECT_CREATED
    projectName?: string;
    creatorName?: string;
    creatorProfilePicture?: string;
    creatorId?: string;
    // For PROJECT_NAME_CHANGED
    projectId?: string;
    oldProjectName?: string;
    newProjectName?: string;
    oldProjectEmoji?: string;
    newProjectEmoji?: string;
    // For PROJECT_DELETED
    deleterName?: string;
    deleterProfilePicture?: string;
    deleterId?: string;

    // For TASK_ASSIGNED
    taskId?: string;
    taskTitle?: string;
    assignerName?: string;
    assignerProfilePicture?: string;
    assignerId?: string;
    assignedName?: string;
    assignedProfilePicture?: string;
    assignedId?: string;

    // For TASK_UNASSIGNED
    unassignerName?: string;
    unassignerProfilePicture?: string;
    unassignerId?: string;
    unassignedName?: string;
    unassignedProfilePicture?: string;
    unassignedId?: string;

    // For TASK_STATUS_CHANGED
    oldStatus?: string;
    newStatus?: string;

    workspaceId: string;
  };

  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getUserNotificationsQueryFn = async (limit = 10): Promise<{
  notifications: Notification[];
}> => {
  const response = await API.get(`/notifications?limit=${limit}`);
  return response.data;
};

export const getUnreadNotificationCountQueryFn = async (): Promise<{
  count: number;
}> => {
  const response = await API.get('/notifications/unread-count');
  return response.data;
};

export const markNotificationAsReadMutationFn = async (notificationId: string) => {
  const response = await API.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const getAllUserNotificationsQueryFn = async (): Promise<{
  notifications: Notification[];
}> => {
  const response = await API.get('/notifications?limit=1000'); // Get all notifications
  return response.data;
};



