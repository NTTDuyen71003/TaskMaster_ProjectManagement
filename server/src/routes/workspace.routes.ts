import { Router } from "express";
import { changeWorkspaceMemberRoleController, createWorkspaceController, deleteWorkspaceByIdController, getAllWorkspacesUserIsMemberController, getOwnerWorkspacesCountController, getWorkspaceAnalyticsController, getWorkspaceByIdController, getWorkspaceMembersController, removeMemberFromWorkspaceController, updateWorkspaceByIdController } from "../controllers/workspace.controller";

const workspaceRoutes = Router();

workspaceRoutes.post("/create/new", createWorkspaceController);

workspaceRoutes.get("/all", getAllWorkspacesUserIsMemberController);

workspaceRoutes.get("/:id", getWorkspaceByIdController);

workspaceRoutes.get("/members/:id", getWorkspaceMembersController);

workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);

workspaceRoutes.put(
    "/change/member/role/:id",
    changeWorkspaceMemberRoleController
);

// Check if member has tasks before removal
// workspaceRoutes.post(
//     "/members/check-tasks/:id",
//     checkMemberHasTasksController
// );

// Remove member route 
workspaceRoutes.delete(
  "/members/delete/:id",
  removeMemberFromWorkspaceController
);

workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

// Count workspace number b4 delete
workspaceRoutes.get("/owner/count", getOwnerWorkspacesCountController);

workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);

export default workspaceRoutes;