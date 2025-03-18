import { ErrorCodeEnum } from "../enums/error-code.enum";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/appError";

export const getMemberRoleInWorkspace = async (
    userId: string,
    workspaceId: string
) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundException("Workspace not found");
    }
    // Tìm kiếm một thành viên trong MemberModel dựa trên cả userId và workspaceId. 
    // Đưa ra vai trò của thành viên đó
    const member = await MemberModel.findOne({
        userId,
        workspaceId,
    }).populate("role");

    if (!member) {
        throw new UnauthorizedException(
            "You are not a member of this workspace",
            ErrorCodeEnum.ACCESS_UNAUTHORIZED
        );
    }

    const roleName = member.role?.name;
    // Trả về Vai Trò của Thành Viên
    return { role: roleName };
};
export const joinWorkspaceByInviteService = async (
    userId: string,
    inviteCode: string
) => {
    // Tìm workspace bằng mã mời
    const workspace = await WorkspaceModel.findOne({ inviteCode }).exec();
    if (!workspace) {
        throw new NotFoundException("Invalid invite code or workspace not found");
    }

    // Kiểm tra user đã là member hay chưa
    const existingMember = await MemberModel.findOne({
        userId,
        workspaceId: workspace._id,
    }).exec();

    if (existingMember) {
        throw new BadRequestException("You are already a member of this workspace");
    }

    const role = await RoleModel.findOne({ name: Roles.MEMBER });

    if (!role) {
        throw new NotFoundException("Role not found");
    }

    // Thêm người dùng vào workspace với vai trò thành viên
    const newMember = new MemberModel({
        userId,
        workspaceId: workspace._id,
        role: role._id,
    });
    await newMember.save();

    return { workspaceId: workspace._id, role: role.name };
};
