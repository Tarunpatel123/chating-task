import { Request, Response } from "express";
import chatService from "../services/chat.service";
import userService from "../services/user.service";
import { fail, notFound, ok, serverError, validationFail } from "../utils/response";
import validators from "../validators/user.validator";

const userController = {
  create: async (req: Request, res: Response) => {
    try {
      const validationResult = validators.create(req.body);
      if (validationResult.error) return validationFail(res, validationResult.errorMessage);
      const { name, email } = validationResult.value;

      const existing = await userService.findByEmail(email);
      if (existing === false) return serverError(res);
      if (existing) return fail(res, "Email already registered", 409);

      const user = await userService.create({ name, email });
      if (!user) return serverError(res);

      return ok(res, "User created", { user }, 201);
    } catch (error) {
      console.log("error on user-controller create function failed.", error);
      return serverError(res);
    }
  },

  chats: async (req: Request, res: Response) => {
    try {
      const validationResult = validators.userId(req.params);
      if (validationResult.error) return validationFail(res, validationResult.errorMessage);
      const { userId } = validationResult.value;

      const user = await userService.findById(userId);
      if (user === false) return serverError(res);
      if (!user) return notFound(res, "User not found");

      const chats = await chatService.listByUser(userId);
      if (chats === false) return serverError(res);

      return ok(res, "Chats fetched", { chats });
    } catch (error) {
      console.log("error on user-controller chats function failed.", error);
      return serverError(res);
    }
  },
};

export default userController;
