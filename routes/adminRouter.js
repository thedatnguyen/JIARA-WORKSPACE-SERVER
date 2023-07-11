const express = require("express");
const router = new express.Router();
const adminController = require("../controllers/adminController");

// router.route('/')
//     .get(adminController.getAllAccount)
//     .post(adminController.addAdminAccount);

// router.route('/:id')
//     .get(adminController.getAccountById)
//     .put(adminController.updateAdminAccount)

router.route("/groups")
    .get(adminController.getAllGroups)
    .post(adminController.createNewGroup);
// .put()
// .delete()

router.route("/groups/:id")
    .get(adminController.getGroupById);
module.exports = router;

