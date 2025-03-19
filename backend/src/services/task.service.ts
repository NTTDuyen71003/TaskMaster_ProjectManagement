import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { NotFoundException } from "../utils/appError";

export const createTaskService = async (
    workspaceId: string,
    projectId: string,
    userId: string,
    body: {
        title: string;
        description?: string;
        priority: string;
        status: string;
        assignedTo?: string | null;
        dueDate?: string;
    }
) => {
    const { title, description, priority, status, assignedTo, dueDate } = body;

    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "Project not found or does not belong to this workspace"
        );
    }
    if (assignedTo) {
        const isAssignedUserMember = await MemberModel.exists({
            userId: assignedTo,
            workspaceId,
        });

        if (!isAssignedUserMember) {
            throw new Error("Assigned user is not a member of this workspace.");
        }
    }
    const task = new TaskModel({
        title,
        description,
        priority: priority || TaskPriorityEnum.MEDIUM,
        status: status || TaskStatusEnum.TODO,
        assignedTo,
        createdBy: userId,
        workspace: workspaceId,
        project: projectId,
        dueDate,
    });

    await task.save();

    return { task };
};