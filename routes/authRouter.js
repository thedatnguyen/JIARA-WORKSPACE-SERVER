const express = require("express");
const router = new express.Router();
const signupController = require("../controllers/signupController");
const loginController = require("../controllers/loginController");
const verifyController = require("../controllers/verifyController");
const emailVerify = require('../middlewares/emailVerify');
const tokenVerifier = require('../middlewares/tokenVerifier');


router.post("/signup", signupController.signup, emailVerify);
router.post("/login", loginController.login);
router.get("/verify", tokenVerifier, verifyController.verifyFromEmail);

module.exports = router;
