const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const token = req.header("authToken");
  //console.log('authToken', token);
  if (!token) { // token is missing
    return res.status(401).send({
      status: "failed",
      message: "Access denied",
    });
  }

  try {
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      res.locals = decoded;
    });
    next();
  } catch (error) {
    return res.status(400).send({ //token is invalid
      status: "failed",
      message: "invalid token",
    });
  }
};
