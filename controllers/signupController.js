const { db } = require("../configs/firebase");
const { accountValidator } = require("../validations/accountValidator");
const bcrypt = require("bcrypt");

const errorHandler = (err, res) => res.status(500).send({ error: err.message });

module.exports.signup = async (req, res, next) => {
  try {
    const { username,
      firstname,
      lastname,
      avatar,
      phoneNumber,
      email,
      gender,
      password } = req.body;
    const accountsRef = db.collection("accounts");

    // check if account data matched rules
    const { error } = accountValidator(req.body);
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

    /*** if accounts validated ***/
    // add account to pendings collection
    const hashedPassword = await bcrypt.hash(password, Math.floor(Math.random() * 16));
    const pendingsRef = db.collection('pendings').doc(username);
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
      verify: false
    };
    await pendingsRef.set(newAccountData);
    
    // send verification email
    next();


    // after user verify email, add new account to pending;
    
  } catch (error) {
    return errorHandler(error, res);
  }
};
