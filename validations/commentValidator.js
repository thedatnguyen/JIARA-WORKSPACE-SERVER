const joi = require("joi");

module.exports.commentValidator = (data) => {
  const rules = joi.object({
    content: joi.string().min(1),
    commentId: joi.string(),
  });

  return rules.validate(data);
};
