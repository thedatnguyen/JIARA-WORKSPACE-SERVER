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
    const body = { name: username, expires_in: 24 * 24 * 60 * 30 }; // 1 month
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': process.env.WEAVY_TOKEN_FACTORY
        }
    }
    return await axios.post(url, body, configs)
}

// if chat does not exist then create new
// module.exports.addUserToChat = async (username, chatId) => {
//     const url = `${process.env.WAEVY_BASE_URL}/api/apps/init`;
//     const body = {
//         app: { uid: chatId, type: "Chat" },
//         user: { uid: username }
//     }
//     const configs = {
//         headers: {
//             'content-type': 'application/json',
//             'Authorization': process.env.WEAVY_TOKEN_FACTORY
//         }
//     }
//     return await axios.post(url, body, configs);
// }

module.exports.createNewChat = async (chatId) => {
    const url = `${process.env.WAEVY_BASE_URL}/api/apps/init`;
    const body = {
        app: { uid: chatId, type: "Chat" },
    }
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': process.env.WEAVY_TOKEN_FACTORY
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



