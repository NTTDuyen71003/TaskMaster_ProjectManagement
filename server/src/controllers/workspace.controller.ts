import { Response } from 'express';
import { Request } from 'express';
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { changeRoleSchema, createWorkspaceSchema, updateWorkspaceSchema, workspaceIdSchema } from '../validation/workspace.validation';
import { HTTPSTATUS } from '../config/http.config';
import { changeMemberRoleService, getWorkspaceMembersService, createWorkspaceService, deleteWorkspaceService, getAllWorkspacesUserIsMemberService, getWorkspaceAnalyticsService, getWorkspaceByIdService, removeMemberFromWorkspaceService, updateWorkspaceByIdService } from '../services/workspace.service';
import { getMemberRoleInWorkspace } from '../services/member.service';
import { roleGuard } from '../utils/roleGuard';
import { Permissions } from "../enums/role.enum";
import WorkspaceModel from '../models/workspace.model';
import { z } from 'zod';

export const createWorkspaceController = asyncHandler(
    async (req: Request, res: Response) => {
        const body = createWorkspaceSchema.parse(req.body);
        const userId = req.user?._id;

        // Backend validation: Check if workspace with the same name exists for this user
        const existingWorkspace = await WorkspaceModel.findOne({
            userId: userId, // Assuming workspaces are user-specific
            name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') },
        });

        if (existingWorkspace) {
            return res.status(409).json({
                error: "Workspace with this name already exists"
            });
        }

        const { workspace } = await createWorkspaceService(userId, body);

        return res.status(HTTPSTATUS.CREATED).json({
            message: "Workspace created successfully",
            workspace,
        });
    }
);


export const getAllWorkspacesUserIsMemberController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const { workspaces } = await getAllWorkspacesUserIsMemberService(userId);

        return res.status(HTTPSTATUS.OK).json({
            message: "User workspaces fetched successfully",
            workspaces,
        });
    }
);

export const getWorkspaceByIdController = asyncHandler(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;
        // Kiểm tra vai trò của người dùng hiện tại, xác định người dùng 
        //có quyền truy cập vào workspace không ?
        await getMemberRoleInWorkspace(userId, workspaceId);

        const { workspace } = await getWorkspaceByIdService(workspaceId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace fetched successfully",
            workspace,
        });
    }
);

export const getWorkspaceMembersController = asyncHandler(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.VIEW_ONLY]);

        const { members, roles } = await getWorkspaceMembersService(workspaceId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace members retrieved successfully",
            members,
            roles,
        });
    }
);

export const getWorkspaceAnalyticsController = asyncHandler(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.VIEW_ONLY]);

        const { analytics } = await getWorkspaceAnalyticsService(workspaceId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace analytics retrieved successfully",
            analytics,
        });
    }
);

export const changeWorkspaceMemberRoleController = asyncHandler(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const { memberId, roleId } = changeRoleSchema.parse(req.body);

        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);

        const { member } = await changeMemberRoleService(
            workspaceId,
            memberId,
            roleId
        );

        return res.status(HTTPSTATUS.OK).json({
            message: "Member Role changed successfully",
            member,
        });
    }
);

// Check user before delete controller
// const checkMemberTasksSchema = z.object({
//     memberId: z.string(),
// });

// export const checkMemberHasTasksController = asyncHandler(
//     async (req: Request, res: Response) => {
//         const workspaceId = workspaceIdSchema.parse(req.params.id);
//         const { memberId } = checkMemberTasksSchema.parse(req.body);
//         const requestingUserId = req.user?._id;

//         // Check if requesting user has permission
//         const { role } = await getMemberRoleInWorkspace(requestingUserId, workspaceId);
//         roleGuard(role, [Permissions.REMOVE_MEMBER]);

//         const result = await checkMemberHasTasksService(workspaceId, memberId);

//         return res.status(HTTPSTATUS.OK).json({
//             message: "Member task check completed",
//             ...result,
//         });
//     }
// );


// Remove member controller
const removeMemberSchema = z.object({
    memberId: z.string(),
});

export const removeMemberFromWorkspaceController = asyncHandler(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const { memberId } = removeMemberSchema.parse(req.body);
        const requestingUserId = req.user?._id;

        const result = await removeMemberFromWorkspaceService(
            workspaceId,
            memberId,
            requestingUserId
        );

        return res.status(HTTPSTATUS.OK).json({
            message: result.message,
            removedMember: result.removedMember,
        });
    }
);


// Update workspace controller
export const updateWorkspaceByIdController = asyncHandler(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const body = updateWorkspaceSchema.parse(req.body);
        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.EDIT_WORKSPACE]);

        // Get the current workspace to compare names
        const currentWorkspace = await WorkspaceModel.findById(workspaceId);
        if (!currentWorkspace) {
            return res.status(HTTPSTATUS.NOT_FOUND).json({
                message: "Workspace not found"
            });
        }

        const { updatedWorkspace } = await updateWorkspaceByIdService(
            workspaceId,
            body,
            userId // pass userId to service
        );

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace updated successfully",
            updatedWorkspace,
        });
    }
);


// Count number of workspace
export const getOwnerWorkspacesCountController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;
        const count = await WorkspaceModel.countDocuments({ owner: userId });
        return res.status(HTTPSTATUS.OK).json({ count });
    }
);


// Delete workspace controller
export const deleteWorkspaceByIdController = asyncHandler(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.DELETE_WORKSPACE]);

        const { currentWorkspace } = await deleteWorkspaceService(
            workspaceId,
            userId
        );

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace deleted successfully",
            currentWorkspace,
        });
    }
);