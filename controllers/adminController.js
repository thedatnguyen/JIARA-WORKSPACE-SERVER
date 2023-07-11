
const {db} = require("../configs/firebase");

// Read
module.exports.getAllAccount = async (req, res, next) => {
  try {
    const adminAccounts = await db.collection("adminAccount").get();
    const data = [];
    adminAccounts.forEach((account) => {
      data.push(account.data());
    });
    res.status(200).send({
      status: "success",
      message: "get data successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

module.exports.getAccountById = async (req, res, next) => {
  try {
    const {id} = req.params;
    const adminAccount = await db.collection("adminAccount").doc(id).get();
    const data = adminAccount.data();
    const [status, message] = (data === undefined) ?
            ["failed", "id not exist"] : ["success", "get data successfully"];
    res.status(200).send({status, message, data});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

// Create
module.exports.addAdminAccount = async (req, res, next) => {
  const {username,
    firstname,
    lastname,
    avatar,
    phoneNumber,
    email,
    gender,
    hashKey,
    hashPassword,
    isActive} = req.body;
  try {
    const adminAccount = db.collection("adminAccount").doc();
    const adminAccountObj = {
      username,
      firstname,
      lastname,
      avatar,
      phoneNumber,
      email,
      gender,
      hashKey,
      hashPassword,
      isActive,
    };
    adminAccount.set(adminAccountObj);

    res.status(200).send({
      status: "success",
      message: "admin account added successfully",
      data: adminAccountObj,
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

// Update
module.exports.updateAdminAccount = async (req, res, next) => {
  try {
    const {body: {newPassword}, params: {id}} = req;
    const adminAccount = db.collection("adminAccount").doc(id);
    await adminAccount.update({
      hashPassword: newPassword,
    })
        .then(async () => res.status(200).send({
          status: "success",
          message: "admin account added successfully",
          data: (await adminAccount.get()).data(),
        }))
        .catch((err) => res.status(500).json({error: err.message}));
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

// delete


// create group
module.exports.createNewGroup = async (req, res, next) => {
  try {
    const {groupName} = req.body;
    const groupRef = db.collection("groups").doc();
    const groupData = {
      groupId: groupRef.id,
      groupName,
      usernames: [],
      postIds: [],
    };
    await groupRef.set(groupData)
        .then(() => res.status(200).send({
          status: "success",
          data: groupData,
        }))
        .catch((error) => res.status(400).json({error: error.message}));
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

module.exports.getAllGroups = async (req, res, next) => {
  try {
    const groupsData = await db.collection("groups").get();
    const data = [];
    groupsData.forEach((group) => {
      data.push(group.data());
    });
    res.status(200).send({
      status: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

module.exports.getGroupById = async (req, res, next) => {
  try {
    const {id} = req.params;
    const groupRef = await db.collection("groups").doc(id).get();
    const data = groupRef.data();
    let status = "failed";
    if (data !== undefined) status = "success";
    res.status(200).send({status, data});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};
