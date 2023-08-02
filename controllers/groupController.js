const { db } = require("../configs/firebase");

const sendResponse = (statusCode, body, res) => {
    res.status(statusCode).send(body);
};

const checkDuplicateAndAdd = (arr, ele) => {
    const set = new Set(arr.concat(ele));
    return Array.from(set).flat();
}

const checkAndRemove = (arr, removeArr, except) => {
    if (!Array.isArray(removeArr)) {
        removeArr = [removeArr];
    }
    return arr.filter(item => !removeArr.includes(item) || item === except);
}

// groups
module.exports.getUserGroup = async (req, res, next) => {
    try {
        const { username, role } = res.locals;

        let data = [];

        if (role === "admin") {
            const groupsRef = db.collection("groups");
            const snapshot = await groupsRef.get();
            snapshot.forEach(element => {
                data.push(element.data());
            });
        } else {
            const accountRef = await db.collection("accounts").doc(username).get();
            const { groupIds } = accountRef.data();
            await Promise.all(
                groupIds.map(async groupId => {
                    const groupRef = await db.collection("groups").doc(groupId).get();
                    const groupData = groupRef.data();
                    if (!groupData) return;
                    data.push({
                        groupId: groupData.groupId,
                        groupName: groupData.groupName,
                        numberOfPosts: groupData.postIds.length
                    })
                })
            );
        }
        sendResponse(200, { groups: data }, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups
module.exports.createNewGroup = async (req, res, next) => {
    try {
        if (res.locals.role !== 'admin') {
            return sendResponse(422, { message: 'access denied' }, res);
        }
        let { managers } = req.body;
        if (!Array.isArray(managers)) {
            managers = [managers];
        }
        let newGroupRef = db.collection('groups').doc();
        const newGroupObj = {
            groupId: newGroupRef.id,
            groupName: req.body.groupName,
            postIds: [],
            usernames: [],
            managers: managers || [],
            usernames: managers || [],
        }
        await newGroupRef.set(newGroupObj);
        sendResponse(200, { data: newGroupObj }, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups:groupId
module.exports.updateGroup = async (req, res, next) => {
    try {
        const { role } = res.locals;
        const { groupId } = req.params;

        if (role !== 'admin') {
            return sendResponse(422, { message: 'admin required' }, res);
        }
        const { managers, groupName } = req.body;
        const groupRef = db.collection('groups').doc(groupId);
        await groupRef.update({ managers: managers, groupName: groupName });
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }

}

// groups:groupId
module.exports.getGroupData = async (req, res, next) => {
    try {
        const { postIds, managers, groupId, groupName, usernames } = res.locals.groupData;
        let posts = []
        await Promise.all(
            postIds.map(async postId => {
                const postRef = await db.collection('posts').doc(postId).get();
                const postData = postRef.data();
                if (postData) {
                    posts.push(postData)
                }
            })
        );
        sendResponse(200, { managers, posts, groupId, groupName, members: usernames }, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups/:groupId
module.exports.deleteGroup = async (req, res, next) => {
    try {
        const { role } = res.locals;
        if (role !== 'admin') {
            return sendResponse(422, { message: 'admin required' }, res);
        }
        const { groupId } = req.params;
        const data = await db.collection('groups').doc(groupId).delete();
        sendResponse(200, { message: data }, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}


// groups/:groupId/managers/:managerId
module.exports.addManager = async (req, res, next) => {
    try {
        const { username, role } = res.locals;
        const { groupId, managerId } = req.params;

        let groupRef = db.collection('groups').doc(groupId);
        const groupData = (await groupRef.get()).data();
        let managers = groupData.managers;
        let members = groupData.usernames;

        if (role !== 'admin' && !managers.includes(username)) {
            return sendResponse(422, { message: 'Admin or manager required' }, res);
        }

        const managersUpdate = checkDuplicateAndAdd(managers, managerId);
        const membersUpdate = checkDuplicateAndAdd(members, managerId);

        await groupRef.update({ managers: managersUpdate, usernames: membersUpdate });
        sendResponse(204, {}, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

/* NOT TESTED YET */

// groups/:groupId/managers/:managerId
module.exports.removeManager = async (req, res, next) => {
    try {
        const { username, role } = res.locals;
        const { groupId, managerId } = req.params;

        let groupRef = db.collection('groups').doc(groupId);
        const groupData = (await groupRef.get()).data();
        let managers = groupData.managers;

        if (role !== 'admin' && !managers.includes(username)) {
            return sendResponse(422, { message: 'Admin or manager required' }, res);
        }

        const managersUpdate = checkAndRemove(managers, managerId);

        await groupRef.update({ managers: managersUpdate });
        sendResponse(204, {}, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups/:groupId/managers  
module.exports.addListManagers = async (req, res, next) => {
    try {
        const { username, role } = res.locals;
        const { managerIds } = req.body;

        let groupRef = db.collection('groups').doc(groupId);
        const groupData = (await groupRef.get()).data();
        let managers = groupData.managers;
        let members = groupData.usernames;

        if (role !== 'admin' && !managers.includes(username)) {
            return sendResponse(422, { message: 'Admin or manager required' }, res);
        }

        const managersUpdate = checkDuplicateAndAdd(managers, managerIds);
        const membersUpdate = checkDuplicateAndAdd(members, managerIds);

        await groupRef.update({ managers: managersUpdate, usernames: membersUpdate });
        sendResponse(204, {}, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

/* NOT TESTED YET */


// groups/:groupId/members
module.exports.addMembersToGroup = async (req, res, next) => {
    try {
        const { username, role } = res.locals;
        const { groupId } = req.params;
        const newMembers = req.body;

        let groupRef = db.collection('groups').doc(groupId);
        const groupData = (await groupRef.get()).data();
        const managers = groupData.managers;

        if (role !== 'admin' && !managers.includes(username)) {
            return sendResponse(422, { message: 'Admin or manager required' }, res);
        }

        const members = groupData.usernames;
        const membersUpdate = checkDuplicateAndAdd(members, newMembers);
        await groupRef.update({ usernames: membersUpdate });
        sendResponse(204, {}, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups/:groupId/members
// body: removeMembers []
module.exports.removeMembersFromGroup = async (req, res, next) => {
    try {
        const { username, role } = res.locals;
        const { groupId } = req.params;
        const removeMembers = req.body;

        let groupRef = db.collection('groups').doc(groupId);
        const groupData = (await groupRef.get()).data();
        const managers = groupData.managers;

        if (role !== 'admin' && !managers.includes(username)) {
            return sendResponse(422, { message: 'Admin or manager required' }, res);
        }

        const members = groupData.usernames;
        const membersUpdate = checkAndRemove(members, removeMembers, username);
        await groupRef.update({ usernames: membersUpdate });
        sendResponse(204, {}, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups/:groupId/post
module.exports.createNewPost = async (req, res, next) => {
    try {
        const { username } = res.locals;
        const { groupId } = req.params;
        const post = req.body; // new post

        // validate post
        const { postValidator } = require('../validations/postValidator');
        const { error } = postValidator(post);
        if (error) {
            return sendResponse(400, { message: error.details[0].message }, res);
        }

        let groupRef = db.collection('groups').doc(groupId);
        const groupData = (await groupRef.get()).data();

        let postRef = db.collection('posts').doc();
        post.postId = postRef.id;
        post.approve = (res.locals.groupRole === 'manager') // if user is manager, approve else not
        post.username = username;
        post.comments = [];

        const message = post.approve ? 'Post created successfully' : 'Post created successfully, waiting for managers to appove...';

        const groupPostIds = groupData.postIds;

        await Promise.all([
            postRef.set(post),
            groupRef.update({ postIds: groupPostIds.concat(post.postId) })
        ])

        sendResponse(200, { message }, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups/:groupId/:postId
module.exports.getPostById = async (req, res, next) => {
    try {
        const { postId } = req.params;

        const postRef = db.collection('posts').doc(postId);
        const postData = (await (postRef.get())).data();

        let comments = [];

        const commentIds = postData.comments;
        await Promise.all(
            commentIds.map(async commentId => {
                const comment = await db.collection('comments').doc(commentId).get();
                const commentData = comment.data();
                comments.push(commentData);
            })
        )

        postData.comments = comments;

        sendResponse(200, { postData }, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups/:groupId/:postId
module.exports.updatePost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const postRef = db.collection('posts').doc(postId);
        const postData = (await (postRef.get())).data();

        // verify author
        const { username } = res.locals;
        if (postData.username !== username) {
            return sendResponse(422, { message: 'Author is required' }, res);
        }

        // validate post
        const { tags, title, content } = req.body;
        const { postValidator } = require('../validations/postValidator');
        const { error } = postValidator(req.body);
        if (error) {
            return sendResponse(400, { message: error.details[0].message }, res);
        }

        // add edit history
        let history = postData.history;
        if (history === undefined) {
            history = []
        }
        history.push(JSON.stringify({
            'content': postData.content,
            'tags': postData.tags,
            'title': postData.title
        }))

        await postRef.update({ title: title, content: content, tags: tags, history: history })
        sendResponse(204, {}, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups/:groupId/:postId
module.exports.deletePost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const postRef = db.collection('posts').doc(postId);
        const postData = (await (postRef.get())).data();

        const { username, groupRole } = res.locals;
        if (username !== postData.username && groupRole !== 'manager') {
            return sendResponse(422, { message: 'author or manager is required' }, res);
        }

        await postRef.delete();
        sendResponse(204, {}, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups/:groupId/:postId/approve
module.exports.approvePost = async (req, res, next) => {
    try {
        const { groupRole } = res.locals;
        const { postId } = req.params;

        if (groupRole !== 'manager') {
            return sendResponse(422, { message: 'manager required' }, res);
        }
        const postRef = db.collection('posts').doc(postId);
        await postRef.update({ approve: true });
        sendResponse(200, { message: `post with id ${postId} approved` }, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}

// groups/:groupId/:postId/comments
module.exports.comment = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const comment = req.body;

        // validate comment
        const { commentValidator } = require('../validations/commentValidator');
        const { error } = commentValidator(req.body);
        if (error) {
            return sendResponse(400, { message: error.details[0].message }, res);
        }

        const commentRef = db.collection('comments').doc();
        comment.commentId = commentRef.id;
        comment.username = res.locals.username;
        comment.postId = postId;

        const postRef = db.collection('posts').doc(postId);
        const comments = (await postRef.get()).data().comments;

        await Promise.all([
            commentRef.set(comment),
            postRef.update({ comments: comments.concat(commentRef.id) })
        ])

        sendResponse(204, {}, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}
// groups/:groupId/:postId/comments
module.exports.editComment = async (req, res, next) => {
    try {
        const { username } = res.locals;
        const comment = req.body;
        const commentId = comment.commentId;

        // validate comment
        const { commentValidator } = require('../validations/commentValidator');
        const { error } = commentValidator(req.body);
        if (error) {
            return sendResponse(400, { message: error.details[0].message }, res);
        }

        const commentRef = db.collection('comments').doc(commentId);
        const commentData = (await commentRef.get()).data()

        if (commentData.username !== username) {
            return sendResponse(422, { message: 'author required' }, res);
        }
        await commentRef.update({ content: comment.content });
        return sendResponse(204, {}, res);

    } catch (error) {
        return sendResponse(500, { message: error.message }, res);
    }
}

// groups/:groupId/:postId/comments
module.exports.deleteComment = async (req, res, next) => {
    try {
        const { username, groupRole } = res.locals;
        const comment = req.body;
        const commentId = comment.commentId;

        const commentRef = db.collection('comments').doc(commentId);
        const commentData = (await commentRef.get()).data()
        console.log(commentId);
        console.log(username);
        console.log(commentData);
        if (commentData.username !== username && groupRole !== 'manager') {
            return sendResponse(422, { message: 'author or manager required' }, res);
        }

        const { postId } = req.params;
        const postRef = db.collection('posts').doc(postId);
        const comments = (await postRef.get()).data()
            .comments.filter(item => item !== commentId);

        await Promise.all([
            commentRef.delete(),
            postRef.update({ comments: comments })
        ])

        return sendResponse(204, {}, res);

    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}



