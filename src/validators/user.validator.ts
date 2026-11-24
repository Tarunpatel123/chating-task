import Joi from "joi";
import validate from "../utils/validate";

const createSchema = Joi.object<{ name: string; email: string }>({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
});

const userIdSchema = Joi.object<{ userId: number }>({
  userId: Joi.number().integer().positive().required(),
});

export default {
  create: (data: unknown) => validate(createSchema, data),
  userId: (data: unknown) => validate(userIdSchema, data),
};
