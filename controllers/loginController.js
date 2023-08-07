const { db } = require("../configs/firebase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dropbox = require("../dropbox");

const sendResponse = (statusCode, body, res) => {
	res.status(statusCode).send(body);
};

module.exports.login = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		const accountRef = db.collection("accounts").doc(username)
		const accountData = (await accountRef.get()).data();

		if (!accountData) {
			return sendResponse(422, { message: "username not existed" }, res);
		}
		if (! await bcrypt.compare(password, accountData.hashedPassword)) {
			return sendResponse(422, { message: "password incorrect" }, res);
		}

		// sign token
		const token = jwt.sign(
			{
				username: accountData.username,
				role: accountData.role,
				chatAccountId: accountData.chatAccountId
			},
			process.env.TOKEN_SECRET,
			{ expiresIn: 60 * 60 * 24 }); // 24 hours

		res.header("auth-token", token).status(200).send({
			avatar: accountData.avatar,
			username: accountData.username,
			gender: accountData.gender,
			avatar: accountData.avatar,
			avatarUrl: accountData.avatarUrl,
			role: accountData.role,
			firstname: accountData.firstname,
			lastname: accountData.lastname,
			email: accountData.email,
			gender: accountData.gender,
			phoneNumber: accountData.phoneNumber,
			token: token,
		});
		//console.log(res._header);

	} catch (error) {
		
		sendResponse(500, { message: error.message }, res);
	}
};
