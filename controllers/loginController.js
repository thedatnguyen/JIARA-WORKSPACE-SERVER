const { db } = require("../configs/firebase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const sendResponse = (statusCode, body, res) => {
  res.status(statusCode).send(body);
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const accountData = (await db.collection("accounts").doc(username).get())
      .data();

    if (!accountData) {
      return sendResponse(422, {
        status: "failed",
        message: "username not existed",
      },
        res);
    }
    if (! await bcrypt.compare(password, accountData.hashedPassword)) {
      return sendResponse(422, {
        status: "failed",
        message: "password incorrect",
      },
        res);
    }

    const token = jwt.sign(
      {
        username: accountData.username,
        role: accountData.role,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: 60 * 60 * 24 }); // 24 hours
    res.header("auth-token", token).status(200).send({
      status: "success",
      data: accountData,
      token: token,
    });
    //console.log(res._header);
    
  } catch (error) {
    sendResponse(500, {
      status: "failed",
      message: error.message,
    },
      res);
  }
};
