const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("authToken");
    if (!token) { // token is missing
      return res.status(401).send({message: 'missing token'});
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (!decoded) {
        return res.status(401).send({ message: 'token is expired, login again' });
      }
      res.locals = decoded;
      next();
    });
  } catch (error) {
    console.log(error.message);
    return res.status(401).send({ //token is invalid
      message: "invalid token",
    });
  }
}

