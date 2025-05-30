import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/appError";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";
import ProjectModel from "../models/project.model";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { memberRemovedNotificationService, workspaceNameChangedNotificationService } from "./notification.service";


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


// Check member before delete
// export const checkMemberHasTasksService = async (
//     workspaceId: string,
//     memberId: string
// ) => {
//     // Check if the member has any tasks assigned to them in this workspace
//     const tasksCount = await TaskModel.countDocuments({
//         workspace: workspaceId,
//         assignedTo: memberId,
//         status: { $ne: TaskStatusEnum.DONE } // Only count non-completed tasks
//     });

//     return {
//         hasTasks: tasksCount > 0,
//         tasksCount
//     };
// };


// Remove member service
export const removeMemberFromWorkspaceService = async (
    workspaceId: string,
    memberIdToRemove: string,
    requestingUserId: string
) => {
    // Check if workspace exists
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundException("Workspace not found");
    }

    // Check if the requesting user has permission to remove members
    const requestingMember = await MemberModel.findOne({
        userId: requestingUserId,
        workspaceId,
    }).populate("role");

    if (!requestingMember) {
        throw new UnauthorizedException(
            "You are not a member of this workspace",
            ErrorCodeEnum.ACCESS_UNAUTHORIZED
        );
    }

    // Check if requesting user has REMOVE_MEMBER permission
    const hasRemovePermission = requestingMember.role?.name === Roles.OWNER;
    if (!hasRemovePermission) {
        throw new UnauthorizedException(
            "You don't have permission to remove members",
            ErrorCodeEnum.ACCESS_UNAUTHORIZED
        );
    }

    // Find the member to be removed
    const memberToRemove = await MemberModel.findOne({
        userId: memberIdToRemove,
        workspaceId,
    }).populate("role");

    if (!memberToRemove) {
        throw new NotFoundException("Member not found in this workspace");
    }

    // Prevent removing the workspace owner
    if (memberToRemove.role?.name === Roles.OWNER) {
        throw new BadRequestException("Cannot remove the workspace owner");
    }

    // Prevent self-removal (optional)
    if (requestingUserId === memberIdToRemove) {
        throw new BadRequestException("Cannot remove yourself from the workspace");
    }

    // Check if member has pending tasks
    // const { hasTasks, tasksCount } = await checkMemberHasTasksService(workspaceId, memberIdToRemove);
    // if (hasTasks) {
    //     throw new BadRequestException(
    //         `Cannot remove member. They have ${tasksCount} pending tasks assigned to them.`
    //     );
    // }

    // Remove the member
    await MemberModel.findOneAndDelete({
        userId: memberIdToRemove,
        workspaceId,
    });

    // 
    // Create notification for the removed member
    try {
        await memberRemovedNotificationService(
            memberIdToRemove,
            requestingUserId,
            workspaceId
        );
    } catch (error) {
        console.error('Failed to create removal notification:', error);
        // Don't fail the entire operation if notification creation fails
    }

    // Update user's currentWorkspace if the removed member had this as current workspace
    const user = await UserModel.findById(memberIdToRemove);
    if (user && user.currentWorkspace?.toString() === workspaceId) {
        // Find another workspace the user is a member of
        const otherMembership = await MemberModel.findOne({
            userId: memberIdToRemove
        }).populate("workspaceId");

        user.currentWorkspace = otherMembership
            ? otherMembership.workspaceId._id
            : null;
        await user.save();
    }

    return {
        message: "Member removed successfully",
        removedMember: {
            userId: memberIdToRemove,
            workspaceId: workspaceId
        }
    };
};


// Update workspace
export const updateWorkspaceByIdService = async (
    workspaceId: string,
    body: {
        name: string;
        description?: string;
    },
    userId: string
) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundException("Workspace not found");
    }

    const oldName = workspace.name;
    const newName = body.name;
    const isNameChanged = oldName && newName && oldName !== newName;

    const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(
        workspaceId,
        { ...body },
        { new: true }
    );

    if (!updatedWorkspace) {
        throw new BadRequestException("Failed to update workspace");
    }

    // Handle notification if name changed
    if (isNameChanged) {
        try {
            await workspaceNameChangedNotificationService(
                userId,
                workspaceId,
                oldName,
                newName
            );
        } catch (error) {
            console.error("Failed to send workspace name change notification:", error);
            // Silent fail to avoid breaking main logic
        }
    }

    return { updatedWorkspace };
};


// Delete workspace
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

        // // Check if user is the owner
        // if (workspace.owner.toString() !== userId) {
        //     throw new BadRequestException(
        //         "You are not authorized to delete this workspace"
        //     );
        // }

        // Check if this is the owner's last workspace
        const ownerWorkspacesCount = await WorkspaceModel.countDocuments({ owner: userId });
        if (ownerWorkspacesCount <= 1) {
            throw new BadRequestException(
                "Cannot delete the last workspace. You must have at least one workspace remaining."
            );
        }

        const user = await UserModel.findById(userId).session(session);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        // Delete related projects
        await ProjectModel.deleteMany({ workspace: workspace._id }).session(
            session
        );

        // Delete related tasks
        await TaskModel.deleteMany({ workspace: workspace._id }).session(session);

        // Delete workspace members (should only be the owner at this point)
        await MemberModel.deleteMany({
            workspaceId: workspace._id,
        }).session(session);

        // Update user's currentWorkspace if this was their current workspace
        if (user?.currentWorkspace?.equals(workspaceId)) {
            const memberWorkspace = await MemberModel.findOne({ userId }).session(
                session
            );
            user.currentWorkspace = memberWorkspace
                ? memberWorkspace.workspaceId
                : null;

            await user.save({ session });
        }

        // Delete the workspace
        await workspace.deleteOne({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return {
            currentWorkspace: user.currentWorkspace,
        };
    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
