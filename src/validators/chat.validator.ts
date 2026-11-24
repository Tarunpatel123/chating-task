import Joi from "joi";
import validate from "../utils/validate";

const id = Joi.number().integer().positive();

const createSchema = Joi.object<{ userAId: number; userBId: number }>({
  userAId: id.required(),
  userBId: id.required().invalid(Joi.ref("userAId")).messages({ "any.invalid": "userAId and userBId must be different" }),
});

export default {
  create: (data: unknown) => validate(createSchema, data),
};
