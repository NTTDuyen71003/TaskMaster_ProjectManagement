import mongoose from "mongoose";
import { TaskStatusEnum } from "../enums/task.enum";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { BadRequestException, NotFoundException } from "../utils/appError";

export const createProjectService = async (
    userId: string,
    workspaceId: string,
    body: {
        emoji?: string;
        name: string;
        description?: string;
    }
) => {
    const project = new ProjectModel({
        ...(body.emoji && { emoji: body.emoji }),
        name: body.name,
        description: body.description,
        workspace: workspaceId,
        createdBy: userId,
    });

    await project.save();

    return { project };
};

export const getProjectsInWorkspaceService = async (
    workspaceId: string,
    pageSize: number,
    pageNumber: number
) => {
    // Tìm tất cả các dự án trong không gian làm việc
    const totalCount = await ProjectModel.countDocuments({
        workspace: workspaceId,
    });
    // Tính toán số lượng dự án cần bỏ qua
    const skip = (pageNumber - 1) * pageSize;

    const projects = await ProjectModel.find({
        workspace: workspaceId,
    })
        .skip(skip)
        .limit(pageSize)
        .populate("createdBy", "_id name profilePicture -password")
        // Sắp xếp theo thời gian tạo mới nhất
        .sort({ createdAt: -1 });
    // Tính toán tổng số trang, nếu có phần dư thì sẽ thêm 1 trang nữa
    const totalPages = Math.ceil(totalCount / pageSize);

    return { projects, totalCount, totalPages, skip };
};

export const getProjectByIdAndWorkspaceIdService = async (
    workspaceId: string,
    projectId: string
) => {
    const project = await ProjectModel.findOne({
        _id: projectId,
        workspace: workspaceId,
    }).select("_id emoji name description");

    if (!project) {
        throw new NotFoundException(
            "Project not found or does not belong to the specified workspace"
        );
    }

    return { project };
};

export const getProjectAnalyticsService = async (
    workspaceId: string,
    projectId: string
) => {
    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "Project not found or does not belong to this workspace"
        );
    }

    const currentDate = new Date();

    // Đếm tổng số công việc trong dự án
    const totalTasks = await TaskModel.countDocuments({
        project: projectId,
    });

    // Đếm số công việc quá hạn (dueDate < currentDate và chưa hoàn thành)
    const overdueTasks = await TaskModel.countDocuments({
        project: projectId,
        dueDate: { $lt: currentDate },
        status: { $ne: TaskStatusEnum.DONE }
    });

    // Đếm số công việc đã hoàn thành
    const completedTasks = await TaskModel.countDocuments({
        project: projectId,
        status: TaskStatusEnum.DONE,
    });

    const analytics = {
        totalTasks,
        overdueTasks,
        completedTasks,
    };

    return {
        analytics,
    };
};

export const updateProjectService = async (
    workspaceId: string,
    projectId: string,
    body: {
        emoji?: string;
        name: string;
        description?: string;
    }
) => {
    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "Project not found or does not belong to this workspace"
        );
    }

    const updatedProject = await ProjectModel.findByIdAndUpdate(
        projectId,
        {
            ...body,
        },
        { new: true }
    );
    if (!updatedProject) {
        throw new BadRequestException("Failed to update project");
    }
    return { updatedProject };
};

export const deleteProjectService = async (
    workspaceId: string,
    projectId: string
) => {
    const project = await ProjectModel.findOne({
        _id: projectId,
        workspace: workspaceId,
    });

    if (!project) {
        throw new NotFoundException(
            "Project not found or does not belong to the specified workspace"
        );
    }

    await project.deleteOne();

    await TaskModel.deleteMany({
        project: project._id,
    });

    return project;
};
