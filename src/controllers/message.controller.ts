import { Request, Response } from "express";
import chatService from "../services/chat.service";
import messageService from "../services/message.service";
import { fail, notFound, ok, serverError, validationFail } from "../utils/response";
import validators from "../validators/message.validator";

const NOT_MEMBER = "You are not a member of this chat";

const messageController = {
  send: async (req: Request, res: Response) => {
    try {
      const validationResult = validators.send({ ...req.body, ...req.params });
      if (validationResult.error) return validationFail(res, validationResult.errorMessage);
      const { chatId, senderId, text } = validationResult.value;

      const isMember = await chatService.isMember(chatId, senderId);
      if (isMember === null) return serverError(res);
      if (!isMember) return fail(res, NOT_MEMBER, 403);

      const message = await messageService.send(chatId, senderId, text);
      if (!message) return serverError(res);

      chatService.touch(chatId);

      return ok(res, "Message sent", { message }, 201);
    } catch (error) {
      console.log("error on message-controller send function failed.", error);
      return serverError(res);
    }
  },

  list: async (req: Request, res: Response) => {
    try {
      const validationResult = validators.list({ ...req.query, ...req.params });
      if (validationResult.error) return validationFail(res, validationResult.errorMessage);
      const { chatId, limit } = validationResult.value;

      const chat = await chatService.findById(chatId);
      if (chat === false) return serverError(res);
      if (!chat) return notFound(res, "Chat not found");

      const messages = await messageService.list(chatId, limit);
      if (!messages) return serverError(res);

      return ok(res, "Messages fetched", { messages });
    } catch (error) {
      console.log("error on message-controller list function failed.", error);
      return serverError(res);
    }
  },

  markRead: async (req: Request, res: Response) => {
    try {
      const validationResult = validators.read({ ...req.body, ...req.params });
      if (validationResult.error) return validationFail(res, validationResult.errorMessage);
      const { chatId, messageId, userId } = validationResult.value;

      const isMember = await chatService.isMember(chatId, userId);
      if (isMember === null) return serverError(res);
      if (!isMember) return fail(res, NOT_MEMBER, 403);

      const message = await messageService.findById(chatId, messageId);
      if (message === false) return serverError(res);
      if (!message) return notFound(res, "Message not found");

      if (message.senderId === userId) return ok(res, "Own message, no read receipt needed");
      if (message.readBy[userId]) return ok(res, "Message already read");

      const updated = await messageService.markRead(chatId, messageId, userId);
      if (!updated) return serverError(res);

      return ok(res, "Message marked as read");
    } catch (error) {
      console.log("error on message-controller markRead function failed.", error);
      return serverError(res);
    }
  },

  updateLastSeen: async (req: Request, res: Response) => {
    try {
      const validationResult = validators.lastSeen({ ...req.body, ...req.params });
      if (validationResult.error) return validationFail(res, validationResult.errorMessage);
      const { chatId, userId, messageId } = validationResult.value;

      const isMember = await chatService.isMember(chatId, userId);
      if (isMember === null) return serverError(res);
      if (!isMember) return fail(res, NOT_MEMBER, 403);

      const message = await messageService.findById(chatId, messageId);
      if (message === false) return serverError(res);
      if (!message) return notFound(res, "Message not found");

      const updated = await messageService.updateLastSeen(chatId, userId, messageId);
      if (!updated) return serverError(res);

      return ok(res, "Last seen updated");
    } catch (error) {
      console.log("error on message-controller updateLastSeen function failed.", error);
      return serverError(res);
    }
  },

  edit: async (req: Request, res: Response) => {
    try {
      const validationResult = validators.edit({ ...req.body, ...req.params });
      if (validationResult.error) return validationFail(res, validationResult.errorMessage);
      const { chatId, messageId, userId, text } = validationResult.value;

      const message = await messageService.findById(chatId, messageId);
      if (message === false) return serverError(res);
      if (!message || message.isDeleted) return notFound(res, "Message not found");
      if (message.senderId !== userId) return fail(res, "You can only edit your own message", 403);

      const updated = await messageService.edit(chatId, messageId, text);
      if (!updated) return serverError(res);

      return ok(res, "Message updated", { message: updated });
    } catch (error) {
      console.log("error on message-controller edit function failed.", error);
      return serverError(res);
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const validationResult = validators.remove({ ...req.body, ...req.params });
      if (validationResult.error) return validationFail(res, validationResult.errorMessage);
      const { chatId, messageId, userId } = validationResult.value;

      const message = await messageService.findById(chatId, messageId);
      if (message === false) return serverError(res);
      if (!message || message.isDeleted) return notFound(res, "Message not found");
      if (message.senderId !== userId) return fail(res, "You can only delete your own message", 403);

      const deleted = await messageService.remove(chatId, messageId);
      if (!deleted) return serverError(res);

      return ok(res, "Message deleted");
    } catch (error) {
      console.log("error on message-controller remove function failed.", error);
      return serverError(res);
    }
  },
};

export default messageController;
