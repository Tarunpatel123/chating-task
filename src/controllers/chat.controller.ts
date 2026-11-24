import { Request, Response } from "express";
import chatService from "../services/chat.service";
import userService from "../services/user.service";
import { notFound, ok, serverError, validationFail } from "../utils/response";
import validators from "../validators/chat.validator";

const chatController = {
  create: async (req: Request, res: Response) => {
    try {
      const validationResult = validators.create(req.body);
      if (validationResult.error) return validationFail(res, validationResult.errorMessage);
      const { userAId, userBId } = validationResult.value;

      const usersFound = await userService.countByIds([userAId, userBId]);
      if (usersFound === false) return serverError(res);
      if (usersFound !== 2) return notFound(res, "User not found");

      const result = await chatService.findOrCreate(userAId, userBId);
      if (!result) return serverError(res);

      return ok(
        res,
        result.created ? "Chat created" : "Chat already exists",
        { chatId: result.chat.id },
        result.created ? 201 : 200,
      );
    } catch (error) {
      console.log("error on chat-controller create function failed.", error);
      return serverError(res);
    }
  },
};

export default chatController;
