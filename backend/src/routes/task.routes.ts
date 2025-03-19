import { Router } from "express";
import { createTaskController, getAllTasksController, getTaskByIdController } from "../controllers/task.controller";

const taskRoutes = Router();

taskRoutes.post(
    "/project/:projectId/workspace/:workspaceId/create",
    createTaskController
);

taskRoutes.get("/workspace/:workspaceId/all", getAllTasksController);

taskRoutes.get(
    "/:id/project/:projectId/workspace/:workspaceId",
    getTaskByIdController
);

export default taskRoutes;