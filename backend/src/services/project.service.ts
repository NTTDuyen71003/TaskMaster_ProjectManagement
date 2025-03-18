import ProjectModel from "../models/project.model";

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
