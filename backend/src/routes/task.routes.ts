import { Router } from "express";
import { createTaskController } from "../controllers/task.controller";

const taskRoutes = Router();

taskRoutes.post(
    "/project/:projectId/workspace/:workspaceId/create",
    createTaskController
);
export default taskRoutes;