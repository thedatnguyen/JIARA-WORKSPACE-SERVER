const { db } = require('../configs/firebase');
const dropbox = require('../dropbox');
const bcrypt = require("bcrypt");

module.exports.updateProfile = async (req, res, next) => {
    try {
        const { username } = res.locals;
        const accountRef = db.collection('accounts').doc(username);
        const avatarId = (await accountRef.get()).data().avatar;
        const { phoneNumber, base64Avatar } = req.body;

        let avatarBuffer = (base64Avatar)
            ? Buffer.from(base64Avatar, 'base64')
            : undefined

        await Promise.allSettled([
            dropbox.updateImage(avatarId, avatarBuffer),
            accountRef.update({ phoneNumber: phoneNumber })
        ])
            .then(async () => {
                res.status(204).send();
            })
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

module.exports.changePassword = async (req, res, next) => {
    try {
        const { username } = res.locals;
        const { currentPassword, newPassword } = req.body;
        const accountRef = db.collection('accounts').doc(username);
        const { hashedPassword } = (await accountRef.get()).data();

        // check current password
        if (! await bcrypt.compare(currentPassword, hashedPassword)) {
            return res.status(422).send({ message: 'password incorrect' });
        }

        // change password
        const newHashedPassword = await bcrypt.hash(newPassword, Math.floor(Math.random() * 16));
        await accountRef.update({ hashedPassword: newHashedPassword })
            .then(res.status(204).send());

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

module.exports.forgetPassword = async (req, res, next) => {
    try {
        const { email, username } = req.body;
        const account = await db.collection('accounts').doc(username).get();
        const accountData = account.data();
        if(!accountData) {
            return res.status(422).send({message: 'username does not exist!'});
        }
        if(accountData.email !== email){
            return res.status(422).send({message: 'email incorrect!'});
        }
        next();
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}