import {Router} from "express";
import { protectRoute } from "../middleware/authMid.js";
import { getAllUsers, getMessages } from "../controllers/userCont.js";

const router =Router();

router.get('/', protectRoute, getAllUsers);
router.get('/messages/:userId', protectRoute, getMessages);
export default router;