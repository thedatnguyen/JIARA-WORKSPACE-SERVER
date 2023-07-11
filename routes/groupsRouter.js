const express = require("express");
const router = new express.Router();
const groupController = require("../controllers/groupController");
const tokenVerifier = require("../middlewares/tokenVerifier");
const groupAccessVerifier = require("../middlewares/groupAccessVerifier");


router.route("/")
    .get(tokenVerifier, groupController.getUserGroup)
    .post(tokenVerifier, groupController.createNewGroup)

router.route("/:groupId").get(tokenVerifier, groupAccessVerifier, groupController.getGroupData);

module.exports = router;

