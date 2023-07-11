const {db} = require("../configs/firebase");
const sendResponse = (statusCode, body, res) => {
  res.status(statusCode).send(body);
};

module.exports.getAllAccounts = async (req, res, next) => {
  try {
    const accountsRef = await db.collection("accounts").get();
    const data = [];
    accountsRef.forEach((accountRef) => {
      data.push(accountRef.data());
    });
    sendResponse(200, {status: "success", data: data}, res);
  } catch (error) {
    sendResponse(500, {status: "failed", message: error.message}, res);
  }
};

module.exports.getAccountByUsername = async (req, res, next) => {
  try {
    const {username} = req.params;
    const accountData = (await db.collection("accounts").doc(username).get())
        .data();
    if (!accountData) {
      return sendResponse(422,
          {status: "failed", message: "username not existed"},
          res);
    }
    sendResponse(200, {status: "success", data: accountData}, res);
  } catch (error) {
    sendResponse(500, {status: "failed", message: error.message}, res);
  }
};
