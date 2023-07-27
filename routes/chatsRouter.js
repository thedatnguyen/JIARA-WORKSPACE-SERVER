const express = require("express");
const router = new express.Router();
const verifyToken = require('../middlewares/tokenVerifier');
const chatsController = require('../controllers/chatsController');

router.route("/")
    .get(verifyToken, chatsController.provideChat);

module.exports = router;

