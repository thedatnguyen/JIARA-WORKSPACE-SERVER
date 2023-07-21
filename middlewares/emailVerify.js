const nodeMailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const sendResponse = (statusCode, data, res) => res.status(statusCode).send(data);

const generateEmailText = (username) => {
    const token = jwt.sign(
        {
            username: username,
            role: 'user'
        },
        process.env.TOKEN_SECRET,
        { expiresIn: 60 }); // 1 minute 
    return `Click http://127.0.0.1:5001/verify/${token} to verify your email. Token is just valid for 1 minute.`;
}
// after validate, send verify email
module.exports = async (req, res, next) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: process.env.HOST,
            port: 465,
            secure: true,
            auth: {
                user: 'jiara.workspace@gmail.com',
                pass: 'pfuotlixmzrcbmta',
            },
        })
        await transporter.sendMail({
            from: process.env.USER,
            to: req.body.email,
            subject: 'JIARA WORKSPACE verification email',
            text: generateEmailText(req.body.username),
        })
            .then(() => {
                sendResponse(200, { status: 'success', data: 'Email has been sent' }, res);
            })
    } catch (error) {
        return sendResponse(500, { status: 'failed', message: error.message }, res);
    }
}