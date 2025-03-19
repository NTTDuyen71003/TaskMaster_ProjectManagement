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