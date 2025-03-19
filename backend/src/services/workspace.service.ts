import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";
import ProjectModel from "../models/project.model";

export const createWorkspaceService = async (
    userId: string,
    body: {
        name: string;
        description?: string | undefined;
    }
) => {
    const { name, description } = body;

    const user = await UserModel.findById(userId);

    if (!user) {
        throw new NotFoundException("User not found");
    }

    const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });

    if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
    }
    //Tạo workspace mới
    const workspace = new WorkspaceModel({
        name: name,
        description: description,
        owner: user._id,
    });

    await workspace.save();
    //Thêm người dùng vào workspace với vai trò chủ sở hữu
    const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
    });

    await member.save();
    //Cập nhật workspace hiện tại của người dùng
    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save();

    return {
        workspace,
    };
};

// Tiến hành lấy tất cả các workspace mà người dùng đó là thành viên
export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
    const memberships = await MemberModel.find({ userId })
        .populate("workspaceId")
        .select("-password")
        .exec();
    //trích xuất danh sách các không gian làm việc từ trường workspaceId trong mỗi đối tượng membership.
    const workspaces = memberships.map((membership) => membership.workspaceId);

    return { workspaces };
};

export const getWorkspaceByIdService = async (workspaceId: string) => {
    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
        throw new NotFoundException("Workspace not found");
    }
    //Lấy tất cả thành viên trong workspace 
    const members = await MemberModel.find({
        workspaceId,
    }).populate("role");

    const workspaceWithMembers = {
        ...workspace.toObject(),
        members,
    };

    return {
        //Trả về thông tin của workspace và danh sách thành viên
        workspace: workspaceWithMembers,
    };
};

//Lấy tất cả thành viên trong workspace
export const getWorkspaceMembersService = async (workspaceId: string) => {
    // Tìm tất cả thành viên trong MemberModel dựa trên workspaceId
    const members = await MemberModel.find({
        workspaceId,
    })
        .populate("userId", "name email profilePicture -password")
        .populate("role", "name");
    const roles = await RoleModel.find({}, { name: 1, _id: 1 })
        .select("-permission")
        .lean();
    return { members, roles };
};

export const getWorkspaceAnalyticsService = async (workspaceId: string) => {

    const currentDate = new Date();
    //Đếm số lượng công việc trong workspace
    const totalTasks = await TaskModel.countDocuments({
        workspace: workspaceId,
    });
    //Đếm số lượng công việc quá hạn  và trạng thái của công việc không phải là DONE
    const overdueTasks = await TaskModel.countDocuments({
        workspace: workspaceId,
        dueDate: { $lt: currentDate }, // lt: less than
        status: { $ne: TaskStatusEnum.DONE }, // ne: not equal
    });

    const completedTasks = await TaskModel.countDocuments({
        workspace: workspaceId,
        status: TaskStatusEnum.DONE,
    });

    const analytics = {
        totalTasks,
        overdueTasks,
        completedTasks,
    };

    return { analytics };
};

export const changeMemberRoleService = async (
    workspaceId: string,
    memberId: string,
    roleId: string
) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundException("Workspace not found");
    }

    const role = await RoleModel.findById(roleId);
    if (!role) {
        throw new NotFoundException("Role not found");
    }

    const member = await MemberModel.findOne({
        userId: memberId,
        workspaceId: workspaceId,
    });

    if (!member) {
        throw new Error("Member not found in the workspace");
    }

    member.role = role;
    await member.save();

    return {
        member,
    };
};

export const updateWorkspaceByIdService = async (
    workspaceId: string,
    body: {
        name: string;
        description?: string;
    }
) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundException("Workspace not found");
    }
    const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(
        workspaceId,
        {
            ...body,
        },
        { new: true }
    );
    if (!updatedWorkspace) {
        throw new BadRequestException("Failed to update workspace");
    }

    return {
        updatedWorkspace,
    };
};

export const deleteWorkspaceService = async (
    workspaceId: string,
    userId: string
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const workspace = await WorkspaceModel.findById(workspaceId).session(
            session
        );
        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        // // Kiểm tra quyền xóa workspace, chỉ chủ sở hữu mới có quyền này
        if (workspace.owner.toString() !== userId) {
            throw new BadRequestException(
                "You are not authorized to delete this workspace"
            );
        }

        const user = await UserModel.findById(userId).session(session);
        if (!user) {
            throw new NotFoundException("User not found");

        }
        // Xóa các dự án liên quan đến workspace
        await ProjectModel.deleteMany({ workspace: workspace._id }).session(
            session
        );

        // Xóa các task liên quan đến workspace
        await TaskModel.deleteMany({ workspace: workspace._id }).session(session);

        // Xóa các thành viên của workspace
        await MemberModel.deleteMany({
            workspaceId: workspace._id,
        }).session(session);

        // Nếu không gian làm việc bị xóa là không gian làm việc hiện tại của người dùng, 
        // cập nhật lại trường currentWorkspace cho người dùng.
        if (user?.currentWorkspace?.equals(workspaceId)) {
            const memberWorkspace = await MemberModel.findOne({ userId }).session(
                session
            );
            // Cập nhật currentWorkspace của người dùng
            user.currentWorkspace = memberWorkspace
                ? memberWorkspace.workspaceId
                : null;

            await user.save({ session }); // Cập nhật lại user
        }
        // Xóa không gian làm việc
        await workspace.deleteOne({ session });

        // Commit transaction (xác nhận tất cả các thay đổi)
        await session.commitTransaction();

        session.endSession();

        return {
            currentWorkspace: user.currentWorkspace,
        };
    } catch (error) {
        // Nếu có lỗi xảy ra, rollback transaction (hoàn tác mọi thay đổi)
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
