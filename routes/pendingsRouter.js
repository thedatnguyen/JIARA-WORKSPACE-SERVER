const express = require("express");
const router = new express.Router();
const verifyToken = require('../middlewares/tokenVerifier');
const pendingsController = require('../controllers/pendingsController');

router.route("/")
    .get(verifyToken, pendingsController.getPendings)

router.route("/approve")
    .post(verifyToken, pendingsController.approvePending)

router.route("/reject")
    .post(verifyToken, pendingsController.rejectPending)

module.exports = router;

