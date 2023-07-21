const { db } = require('../configs/firebase');

module.exports = async (req, res, next) => {
    try {
        const { username } = res.locals; // token verify success, get username
        const { groupId } = req.params;
        const groupRef = await db.collection('groups').doc(groupId).get();
        const groupData = groupRef.data();

        if (!groupData) {
            return res.status(400).send({ status: 'failed', message: 'groupId not found' });
        }

        const members = groupData.usernames;
        const managers = groupData.managers;

        if(managers.includes(username)){
            res.locals.groupRole = 'manager';
        }else{
            if(members.includes(username)){
                res.locals.groupRole = 'member'
            }else {
                return res.status(401).send({ message: 'access denied' });
            }
        }
        res.locals.groupData = groupData;
        next();

    } catch (error) {
        return res.status(500).send({ status: 'failed', message: error.message });
    }
}
