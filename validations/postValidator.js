const joi = require("joi");

module.exports.postValidator = (data) => {
  const rules = joi.object({
    title: joi.string().min(1).required(),
    content: joi.string().min(1).required(),
    pictures: joi.array().items(joi.string()),
    tags: joi.array().items(joi.string())
  });

  return rules.validate(data);
};
