const express = require("express");
const router = new express.Router();
const verifyToken = require('../middlewares/tokenVerifier');
const personalController = require('../controllers/personalController');
const emailVerifier = require('../middlewares/emailVerify');

router.route('/')
    .post(verifyToken, personalController.updateProfile);

router.route('/resetPassword')
    .post(verifyToken, personalController.changePassword)
    .patch(personalController.forgetPassword, emailVerifier)

router.route('/test').post(personalController.test);
module.exports = router;