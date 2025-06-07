import { Router } from "express";
import { authCallback } from "../controllers/authCont.js";

const router = Router();

router.post("/callback", authCallback)

export default router;