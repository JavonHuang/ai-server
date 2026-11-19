import Joi from 'joi';


export const userSchema = Joi.object({
  password: Joi.string().alphanum().min(3).max(30).required(),
  userAccount: Joi.string().email().required()
});