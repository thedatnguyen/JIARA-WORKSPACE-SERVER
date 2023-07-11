const {db} = require("../configs/firebase");
const {accountValidator} = require("../validations/accountValidator");
const bcrypt = require("bcrypt");

const errorHandler = (err, res) => res.status(500).send({error: err.message});

module.exports.signup = async (req, res, next) => {
  try {
    const {username,
      firstname,
      lastname,
      avatar,
      phoneNumber,
      email,
      gender,
      password} = req.body;
    const accountsRef = db.collection("accounts");

    // check if account data matched rules
    const {error} = accountValidator(req.body);
    if (error) {
      return res.status(422).send({
        status: "failed",
        error: error.details[0].message,
      });
    }

    // check username and email duplication
    await Promise.all([
      accountsRef
          .where("username", "==", username)
          .get()
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              return res.status(422).send({
                status: "failed",
                message: "username existed",
              });
            }
          }),
      accountsRef
          .where("email", "==", email)
          .get()
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              return res.status(422).send({
                status: "failed",
                message: "email existed",
              });
            }
          }),
    ]);

    const salt = Math.floor(Math.random() * 16);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAccountRef = accountsRef.doc(username);
    const newAccountData = {
      username,
      firstname,
      lastname,
      avatar,
      phoneNumber,
      email,
      gender,
      hashedPassword,
      role: "user",
      isActive: true,
    };
    await newAccountRef.set(newAccountData)
        .then(() => {
          res.status(200).send({
            status: "success",
            data: {
              username,
              email,
            },
          });
        })
        .catch((error) => {
          res.status(400).send({
            status: "failed",
            error: error.message,
          });
        });
  } catch (error) {
    errorHandler(error, res);
  }
};
