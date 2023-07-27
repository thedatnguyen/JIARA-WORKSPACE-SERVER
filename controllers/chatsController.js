const weavy = require('../weavy');

const sendResponse = (statusCode, data, res) => res.status(statusCode).send(data);

module.exports.provideChat = async (req, res, next) => {
    try {
        const { username } = res.locals;
        const { idToChat } = req.query;
        let accessToken;
        let chatId;

        // get user auth token
        await weavy.provideChatTokenForUser(username)
            .then(apiRes => accessToken = apiRes.data.access_token);

        // get conversation id
        // if conversation is not exits then create new
        if (idToChat) {
            await weavy.createNewChat(idToChat, accessToken)
                .then(apiRes => chatId = apiRes.data.id);
        }
        sendResponse(200, { accessToken, chatId }, res);
    } catch (error) {
        sendResponse(500, { message: error.message }, res);
    }
}
