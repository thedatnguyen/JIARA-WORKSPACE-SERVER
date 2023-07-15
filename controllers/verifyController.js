const {db} = require('../configs/firebase');

const sendResponse = (statusCode, data, res) => {
    res.status(statusCode).send(data);
}
module.exports.verifyFromEmail = async (req, res, next) => {
    try {
        const {username} = res.locals;
        const pendingRef = db.collection('pendings').doc(username);
        await pendingRef.update({verify: true});
        sendResponse(200, {status: 'success', data: `${username} verified`}, res);
    } catch (error) {
        sendResponse(500, {status: 'failed', message: error.message}, res);
    }
}