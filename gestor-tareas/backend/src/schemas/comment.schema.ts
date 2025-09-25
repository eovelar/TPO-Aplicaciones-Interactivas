import Joi from "joi";

export const createCommentSchema = Joi.object({
  contenido: Joi.string().trim().min(1).max(2000).required(),
});
