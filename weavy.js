const axios = require('axios');

module.exports.createUser = async (username) => {
    const url = `${process.env.WAEVY_BASE_URL}/api/users`;
    const body = { uid: username };
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': process.env.WEAVY_TOKEN_FACTORY
        }
    }
    return await axios.post(url, body, configs);
}


// if user does not exits then create new
module.exports.provideChatTokenForUser = async (username) => {
    // create user with uid {username}
    const url = `${process.env.WAEVY_BASE_URL}/api/users/${username}/tokens`;
    const body = { expires_in: 24 * 24 * 60 * 30 }; // 1 month
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': process.env.WEAVY_TOKEN_FACTORY
        }
    }
    return await axios.post(url, body, configs)
}


module.exports.createNewChat = async (idToChat, accessToken) => {
    const url = `${process.env.WAEVY_BASE_URL}/api/conversations`;
    const body = {
        members: [idToChat]
    }
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    }
    return await axios.post(url, body, configs);
}

module.exports.addUsersToChat = async (usernames, chatId) => {
    const url = `${process.env.WAEVY_BASE_URL}/api/apps/${chatId}/members`;
    const body = usernames;
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': process.env.WEAVY_TOKEN_FACTORY
        }
    }
    return await axios.post(url, body, configs);
}

module.exports.getLastMessage = (chatId) => {
    let result = {};
    const url = `${process.env.WAEVY_BASE_URL}/api/apps/${chatId}/messages`;
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': process.env.WEAVY_TOKEN_FACTORY
        }
    }
    axios.get(url, configs)
        .then(apiResponse => {
            const messagesCount = apiResponse.data.count;
            result.lastMessage = apiResponse.data.data[messagesCount - 1].text;
        })
        .catch(err => {
            result.err = err.message;
        })
    return result;
}

module.exports.changeChatAvatar = async (id, avatarUrl) => {
    const url = `https://f1746aae94594612865d8f61eb9291e7.weavy.io/api/users/${id}`;
    const body = {
        picture: avatarUrl
    }
    const configs = {
        headers: {
            Authorization: process.env.WEAVY_TOKEN_FACTORY,
            'content-type': 'application/json'
        }
    }
    await axios.patch(url, body, configs);
}


