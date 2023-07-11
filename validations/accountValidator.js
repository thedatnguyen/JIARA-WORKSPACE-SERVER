const joi = require("joi");

module.exports.accountValidator = (data) => {
  const rules = joi.object({
    username: joi.string().min(6).max(25).required(),
    firstname: joi.string().min(1).max(25).required(),
    lastname: joi.string().min(1).max(25).required(),
    phoneNumber: joi.number().min(10).required(),
    email: joi.string().email().required(),
    password: joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9_@]{6,20}$")).required(),
    avatar: joi.string().allow(""),
    gender: joi.string().required(),
  });

  return rules.validate(data);
};
