const { db } = require("../configs/firebase");

const sendResponse = (statusCode, body, res) => {
    res.status(statusCode).send(body);
};


module.exports.getUserGroup = async (req, res, next) => {
    try {
        const username = res.locals.username;
        const accountRef = await db.collection("accounts").doc(username).get();
        const { groupIds } = accountRef.data();
        let data = []
        await Promise.all(
            groupIds.map(async groupId => {
                const groupRef = await db.collection("groups").doc(groupId).get();
                const groupData = groupRef.data();
                data.push({
                    groupName: groupData.groupName,
                    numberOfPosts: groupData.postIds.length
                })
            })
        );
        sendResponse(200, { status: 'success', data: data }, res);
    } catch (error) {
        sendResponse(500, { status: 'failed', message: error.message }, res);
    }
}

module.exports.getGroupData = async (req, res, next) => {
    try {
        const { postIds } = res.locals.groupData;
        let data = []
        await Promise.all(
            postIds.map(async postId => {
                const postRef = await db.collection('posts').doc(postId).get();
                const postData = postRef.data();
                data.push(postData);
            })
        );
        sendResponse(200, { status: 'success', data: data }, res);
    } catch (error) {
        sendResponse(500, { status: 'failed', message: error.message }, res);
    }
}

module.exports.createNewGroup = async (req, res, next) => {
    try {
        if(res.locals.role !== 'admin'){
            return sendResponse(401, {status: 'failed', message: 'access denied'}, res);
        }
        let newGroupRef = db.collection('groups').doc();
        const newGroupObj = {
            groupId: newGroupRef.id,
            groupName: req.body.groupName,
            postIds: [],
            usernames: [],
            managers: req.body.managers || []
        }
        await newGroupRef.set(newGroupObj);
        sendResponse(200, {status: 'success', data: newGroupObj}, res);
    } catch (error) {
        sendResponse(500, { status: 'failed', message: error.message }, res);
    }
}

module.exports.deleteGroup = async (req, res, next) => {
    try {
        const {groupId} = req.params;
        const data = await db.collection('groups').doc(groupId).delete();
        sendResponse(200, { status: 'success', message: data}, res);
    } catch (error) {
        sendResponse(500, { status: 'failed', message: error.message }, res);
    }
}


