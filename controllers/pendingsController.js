const { db } = require('../configs/firebase');
const sendResponse = (statusCode, data, res) => res.status(statusCode).send(data);
const weavy = require('../weavy');

module.exports.getPendings = async (req, res, next) => {
    try {
        //console.log(req.headers);
        if (res.locals.role !== 'admin') {
            return sendResponse(401, { status: 'failed', message: 'access denied' }, res);
        }
        let pendingsRef = await db.collection('pendings').where("verify", "==", true).get();
        let data = [];
        pendingsRef.forEach(pendingRef => {
            data.push(pendingRef.data());
        });
        sendResponse(200, { status: 'success', data: data }, res);
    } catch (error) {
        sendResponse(500, { status: 'failed', message: error.message }, res);
    }
}

module.exports.approvePending = async (req, res, next) => {
    try {
        if (res.locals.role !== 'admin') {
            return sendResponse(401, { status: 'failed', message: 'admin role required' }, res);
        }
        const { username } = req.body;
        let pendingRef = await db.collection('pendings').doc(username).get();
        let pending = pendingRef.data();
        if (!pending) {
            return sendResponse(400, { status: 'failed', message: 'bad request, username does not exist' });
        }

        const { firstname, lastname, avatar, phoneNumber, email, gender, hashedPassword } = pending

        // create chat account for user
        let chatAccountId;
        await weavy.createUser(username)
            .then(weavyResponse => {
                chatAccountId = weavyResponse.data.id;
            })

        const accountData = {
            username,
            firstname,
            lastname,
            avatar,
            phoneNumber,
            email,
            gender,
            hashedPassword,
            role: "user",
            isActive: true,
            groupIds: [],
            chatAccountId: chatAccountId,
        };
        await Promise.all([
            db.collection('accounts').doc(username).set(accountData),
            db.collection('pendings').doc(username).delete()
        ])
            .then(() => sendResponse(200, { status: 'success', data: `${pending.username} approved`}, res))
            .catch(err => sendResponse(500, { status: 'failed', message: err.message }, res));
    } catch (error) {
        sendResponse(500, { status: 'failed', message: error.message }, res);
    }
}

module.exports.rejectPending = async (req, res, next) => {
    try {
        if (res.locals.role !== 'admin') {
            return sendResponse(401, { status: 'failed', message: 'access denied' }, res);
        }
        const { username } = req.body;
        let pendingRef = await db.collection('pendings').doc(username).get();
        let pending = pendingRef.data();
        if (!pending) {
            return sendResponse(400, { status: 'failed', message: 'bad request, username does not exist' });
        }
        await db.collection('pendings').doc(username).delete()
            .then(() => sendResponse(200, { status: 'success', data: `${pending.username} rejected` }, res))
            .catch(err => sendResponse(500, { status: 'failed', message: err.message }, res));
    } catch (error) {
        sendResponse(500, { status: 'failed', message: error.message }, res);
    }
}