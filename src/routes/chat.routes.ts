import { Router } from "express";
import chatController from "../controllers/chat.controller";
import messageController from "../controllers/message.controller";

const router = Router();

router.post("/create", chatController.create);

router.post("/:chatId/message/send", messageController.send);
router.get("/:chatId/messages", messageController.list);
router.post("/:chatId/message/:messageId/read", messageController.markRead);
router.post("/:chatId/lastseen", messageController.updateLastSeen);
router.put("/:chatId/message/:messageId", messageController.edit);
router.delete("/:chatId/message/:messageId", messageController.remove);

export default router;
