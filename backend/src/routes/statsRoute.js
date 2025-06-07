import { Router } from "express";
import {protectRoute, requireAdmin} from "../middleware/authMid.js"
import {getStats} from "../controllers/statCont.js"

const router = Router();

router.get("/", protectRoute, requireAdmin, getStats);

export default router;