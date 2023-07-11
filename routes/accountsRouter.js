const express = require("express");
const router = new express.Router();
const verifyToken = require("../middlewares/tokenVerifier");
const accountsController = require("../controllers/accountsController");

router.route("/")
    .get(verifyToken, accountsController.getAllAccounts);

router.route("/:username")
    .get(verifyToken, accountsController.getAccountByUsername);

module.exports = router;
