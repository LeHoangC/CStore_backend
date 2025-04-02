var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "cuong.devv@gmail.com",
        pass: process.env.PASS_MAIL,
    },
});

module.exports = { transporter }