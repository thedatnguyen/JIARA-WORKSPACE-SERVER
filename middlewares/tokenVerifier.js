const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("authToken");
    if (!token) { // token is missing
      return res.status(401).send({
        status: "failed",
        message: "Access denied",
      });
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (decoded === undefined) {
        return res.status(401).send({ message: 'token is expired, login again' });
      }
      res.locals = decoded;
    });
    next();
  } catch (error) {
    return res.status(400).send({ //token is invalid
      status: "failed",
      message: "invalid token",
    });
  }
}

