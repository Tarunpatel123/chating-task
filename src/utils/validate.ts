import Joi from "joi";

export type ValidationResult<T> = { error: true; errorMessage: string } | { error: false; value: T };

const validate = <T>(schema: Joi.ObjectSchema<T>, data: unknown): ValidationResult<T> => {
  const { error, value } = schema.validate(data, { stripUnknown: true });
  if (error) {
    return { error: true, errorMessage: (error.details[0]?.message || "Invalid input").replace(/"/g, "") };
  }
  return { error: false, value: value as T };
};

export default validate;
