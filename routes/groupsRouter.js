const express = require("express");
const router = new express.Router();
const groupController = require("../controllers/groupController");
const tokenVerifier = require("../middlewares/tokenVerifier");
const groupAccessVerifier = require("../middlewares/groupAccessVerifier");


router.route("/")
    .get(tokenVerifier, groupController.getUserGroup)
    .post(tokenVerifier, groupController.createNewGroup) 

router.route("/:groupId")
    .get(tokenVerifier, groupAccessVerifier, groupController.getGroupData) 
    .post(tokenVerifier, groupController.updateGroup) // for admin only
    .delete(tokenVerifier, groupController.deleteGroup); // admin only

router.route("/:groupId/managers/:managerId")
    .post(tokenVerifier, groupController.addManager) 
    .patch(tokenVerifier, groupController.removeManager)

router.route("/:groupId/members")
    .post(tokenVerifier, groupController.addMembersToGroup) 
    .patch(tokenVerifier, groupController.removeMembersFromGroup); 

router.route("/:groupId/posts")
    .post(tokenVerifier, groupAccessVerifier, groupController.createNewPost) 

router.route("/:groupId/:postId")
    .get(tokenVerifier, groupAccessVerifier, groupController.getPostById) 
    .post(tokenVerifier, groupController.updatePost)
    .delete(tokenVerifier, groupAccessVerifier, groupController.deletePost); 

router.route("/:groupId/:postId/approve")
    .post(tokenVerifier, groupAccessVerifier, groupController.approvePost) 
// reject post: redirect to deletePost

router.route("/:groupId/:postId/comments")
    .post(tokenVerifier, groupAccessVerifier, groupController.comment) 
    .patch(tokenVerifier, groupController.editComment)
    .delete(tokenVerifier, groupAccessVerifier, groupController.deleteComment); 

module.exports = router;

