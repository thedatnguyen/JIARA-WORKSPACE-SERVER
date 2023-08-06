const axios = require('axios');
const { Dropbox } = require('dropbox');
const { v4: uuid } = require('uuid');

module.exports.getRefreshAndAccessToken = async (req, res, next) => {
    try {
        // console.log(req)
        const url = 'https://api.dropbox.com/oauth2/token';
        const body = new URLSearchParams({
            'code': 'Cpp6GnfFS-kAAAAAAAAAVtgctKy7XOls_igwEPK8qno',
            'grant_type': 'authorization_code'
        })
        const configs = {
            auth: {
                username: 'oxh34w90q2wx6zf',
                password: 'zoieaed0fdz1iq7'
            }
        }
        await axios.post(url, body, configs)
            .then(dropboxRes => console.log(dropboxRes.data))
            .catch(err => console.error(err.response.data));
    } catch (error) {
        res.send(JSON.stringify(error));
    }
}

module.exports.getAccessToken = async () => {
    try {
        const url = 'https://api.dropbox.com/oauth2/token';
        const body = new URLSearchParams({
            'refresh_token': process.env.DROPBOX_REFRESH_TOKEN,
            'grant_type': 'refresh_token',
            'client_id': process.env.DROPBOX_APP_KEY,
            'client_secret': process.env.DROPBOX_APP_SECRET
        })
        return axios.post(url, body);
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

module.exports.loadImageFromId = async (id) => {
    let dropboxAccessToken;
    await this.getAccessToken()
        .then(dropboxRes => dropboxAccessToken = dropboxRes.data.access_token);

    var dbx = new Dropbox({ accessToken: dropboxAccessToken });
    return await dbx.filesDownload({ path: id })
}

module.exports.updateImage = async (id, content) => {
    if (!content) return;
    let dropboxAccessToken;
    await this.getAccessToken()
        .then(dropboxRes => dropboxAccessToken = dropboxRes.data.access_token);

    var dbx = new Dropbox({ accessToken: dropboxAccessToken });
    return await dbx.filesUpload({
        path: id,
        contents: content,
        mode: 'overwrite'
    })
}

module.exports.uploadImage = async (content) => {
    if (!content) return;
    let dropboxAccessToken;
    await this.getAccessToken()
        .then(dropboxRes => dropboxAccessToken = dropboxRes.data.access_token);

    var dbx = new Dropbox({ accessToken: dropboxAccessToken });
    return await dbx.filesUpload({
        path: `/avatars/${uuid()}.png`,
        contents: content
    })
}

module.exports.deleteImageById = async (id) => {
    let dropboxAccessToken;
    await this.getAccessToken()
        .then(dropboxRes => dropboxAccessToken = dropboxRes.data.access_token);

    var dbx = new Dropbox({ accessToken: dropboxAccessToken });
    return await dbx.filesDeleteV2({
        path: id
    })
}