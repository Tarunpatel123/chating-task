import Joi from "joi";
import validate from "../utils/validate";

const id = Joi.number().integer().positive();
const messageId = Joi.string().trim().alphanum().max(50);
const text = Joi.string().trim().min(1).max(2000);

const sendSchema = Joi.object<{ chatId: number; senderId: number; text: string }>({
  chatId: id.required(),
  senderId: id.required(),
  text: text.required(),
});

const listSchema = Joi.object<{ chatId: number; limit: number }>({
  chatId: id.required(),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

const readSchema = Joi.object<{ chatId: number; messageId: string; userId: number }>({
  chatId: id.required(),
  messageId: messageId.required(),
  userId: id.required(),
});

const lastSeenSchema = Joi.object<{ chatId: number; userId: number; messageId: string }>({
  chatId: id.required(),
  userId: id.required(),
  messageId: messageId.required(),
});

const editSchema = Joi.object<{ chatId: number; messageId: string; userId: number; text: string }>({
  chatId: id.required(),
  messageId: messageId.required(),
  userId: id.required(),
  text: text.required(),
});

const deleteSchema = Joi.object<{ chatId: number; messageId: string; userId: number }>({
  chatId: id.required(),
  messageId: messageId.required(),
  userId: id.required(),
});

export default {
  send: (data: unknown) => validate(sendSchema, data),
  list: (data: unknown) => validate(listSchema, data),
  read: (data: unknown) => validate(readSchema, data),
  lastSeen: (data: unknown) => validate(lastSeenSchema, data),
  edit: (data: unknown) => validate(editSchema, data),
  remove: (data: unknown) => validate(deleteSchema, data),
};
