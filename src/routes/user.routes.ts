import { Router } from "express";
import userController from "../controllers/user.controller";

const router = Router();

router.post("/create", userController.create);
router.get("/:userId/chats", userController.chats);

export default router;
