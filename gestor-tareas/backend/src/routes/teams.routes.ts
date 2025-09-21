import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware";
import { createTeam, addMember, getMyTeams, getTeamTasks } from "../controllers/teams.controller";

const router = Router();

router.post("/", authRequired(), createTeam);
router.post("/:id/members", authRequired(), addMember);
router.get("/", authRequired(), getMyTeams);
router.get("/:id/tasks", authRequired(), getTeamTasks);

export default router;
