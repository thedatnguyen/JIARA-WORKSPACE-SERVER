const express = require("express");
const router = new express.Router();
const verifyToken = require('../middlewares/tokenVerifier');
const personalController = require('../controllers/personalController');

router.route('/')
    .post(verifyToken, personalController.updateProfile);

router.route('/resetPassword')
    .post(verifyToken, personalController.changePassword);
module.exports = router;