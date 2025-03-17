import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { NotFoundException } from "../utils/appError";

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