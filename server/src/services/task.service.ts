import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { taskAssignedNotificationService, taskDeletedNotificationService, taskStatusChangedNotificationService, taskUnassignedNotificationService } from "./notification.service";


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

    // Send notification if task is assigned to someone other than the creator
    if (assignedTo && assignedTo !== userId) {
        try {
            await taskAssignedNotificationService(
                userId,
                assignedTo,
                workspaceId,
                (task._id as string | { toString(): string }).toString(),
                title,
                projectId
            );
        } catch (error) {
            console.error('Error sending task assigned notification:', error);
        }
    }

    return { task };
};


export const getAllTasksService = async (
    workspaceId: string,
    filters: {
        projectId?: string;
        status?: string[];
        priority?: string[];
        assignedTo?: string[];
        keyword?: string;
        dueDate?: string;
    },
    pagination: {
        pageSize: number;
        pageNumber: number;
    }
) => {
    const query: Record<string, any> = {
        workspace: workspaceId,
    };
    // Nếu có projectId thì thêm vào query
    if (filters.projectId) {
        query.project = filters.projectId;
    }
    // Nếu có status, sử dụng toán tử $in để lọc ra các 
    //task có status trong mảng status
    if (filters.status && filters.status?.length > 0) {
        query.status = { $in: filters.status };
    }
    // Nếu có priority, sử dụng toán tử $in để lọc ra các
    //task có priority trong mảng priority
    if (filters.priority && filters.priority?.length > 0) {
        query.priority = { $in: filters.priority };
    }
    // Nếu có assignedTo, sử dụng toán tử $in để lọc ra các
    //task có assignedTo trong mảng assignedTo
    if (filters.assignedTo && filters.assignedTo?.length > 0) {
        query.assignedTo = { $in: filters.assignedTo };
    }
    // Nếu có keyword, sử dụng regex để tìm kiếm các task
    //có title chứa keyword
    if (filters.keyword && filters.keyword !== undefined) {
        query.title = { $regex: filters.keyword, $options: "i" };
    }
    // Nếu có dueDate, lọc ra các task có dueDate bằng với
    //dueDate truyền vào
    if (filters.dueDate) {
        query.dueDate = {
            $eq: new Date(filters.dueDate),
        };
    }

    //Pagination Setup
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;
    //Tìm tất cả các task theo query và sắp xếp theo thời gian tạo mới nhất
    const [tasks, totalCount] = await Promise.all([
        TaskModel.find(query)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 })
            .populate("assignedTo", "_id name profilePicture -password")
            .populate("project", "_id emoji name"),
        TaskModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        tasks,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    };
};


export const getTaskByIdService = async (
    workspaceId: string,
    projectId: string,
    taskId: string
) => {
    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "Project not found or does not belong to this workspace"
        );
    }

    const task = await TaskModel.findOne({
        _id: taskId,
        workspace: workspaceId,
        project: projectId,
    }).populate("assignedTo", "_id name profilePicture -password");

    if (!task) {
        throw new NotFoundException("Task not found");
    }

    return task;
};


// Update task service
export const updateTaskService = async (
    workspaceId: string,
    projectId: string,
    taskId: string,
    userId: string, // Add userId parameter
    body: {
        title: string;
        description?: string;
        priority: string;
        status: string;
        assignedTo?: string | null;
        dueDate?: string;
    }
) => {
    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "Project not found or does not belong to this workspace"
        );
    }

    const task = await TaskModel.findById(taskId);

    if (!task || task.project.toString() !== projectId.toString()) {
        throw new NotFoundException(
            "Task not found or does not belong to this project"
        );
    }

    // Store old values for comparison - ensure consistent string format
    const oldAssignedTo = task.assignedTo?.toString();
    const oldStatus = task.status;

    const updatedTask = await TaskModel.findByIdAndUpdate(
        taskId,
        {
            ...body,
        },
        { new: true }
    );

    if (!updatedTask) {
        throw new BadRequestException("Failed to update task");
    }

    // Handle assignment change notifications
    const newAssignedTo = body.assignedTo;
    
    if (oldAssignedTo !== newAssignedTo) {
        try {
            // If someone was unassigned
            if (oldAssignedTo && oldAssignedTo !== newAssignedTo) {
                // Convert userId to string for consistent comparison
                const userIdString = userId.toString();
                
                // Only send notification if the person being unassigned is NOT the one making the change
                if (oldAssignedTo !== userIdString) {
                    await taskUnassignedNotificationService(
                        userId,
                        oldAssignedTo,
                        workspaceId,
                        taskId,
                        body.title,
                        projectId
                    );
                }
            }
            
            // If someone new was assigned
            if (newAssignedTo) {
                // Convert userId to string for consistent comparison
                const userIdString = userId.toString();
                
                // Only send notification if the person being assigned is NOT the one making the change
                if (newAssignedTo !== userIdString) {
                    await taskAssignedNotificationService(
                        userId,
                        newAssignedTo,
                        workspaceId,
                        taskId,
                        body.title,
                        projectId
                    );
                }
            }
        } catch (error) {
            console.error('Error sending task assignment change notifications:', error);
        }
    }

    // Handle status change notifications
    if (oldStatus !== body.status) {
        try {
            await taskStatusChangedNotificationService(
                userId,
                taskId,
                body.title,
                oldStatus,
                body.status,
                workspaceId,
                projectId,
                newAssignedTo || undefined
            );
        } catch (error) {
            console.error('Error sending task status change notification:', error);
        }
    }

    return { updatedTask };
};


export const deleteTaskService = async (
    workspaceId: string,
    taskId: string,
    userId: string // Add userId parameter to know who is deleting the task
) => {
    const task = await TaskModel.findOne({
        _id: taskId,
        workspace: workspaceId,
    }).populate('project', '_id name emoji'); // Populate project details

    if (!task) {
        throw new NotFoundException(
            "Task not found or does not belong to the specified workspace"
        );
    }

    // Store task details before deletion for notification
    const taskTitle = task.title;
    const projectId = task.project._id.toString();
    const assignedUserId = task.assignedTo?.toString();

    // Delete the task
    await TaskModel.findByIdAndDelete(taskId);

    // Send notification after successful deletion
    try {
        await taskDeletedNotificationService(
            userId,
            workspaceId,
            projectId,
            taskId,
            taskTitle,
            assignedUserId
        );
    } catch (error) {
        console.error('Error sending task deleted notification:', error);
        // Don't throw here - task deletion was successful, just notification failed
    }

    return;
};