'use strict'

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transporter = nodemailer.createTransport(smtpTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: eval(process.env.SMTP_IS_SECURE),
    ignoreTLS: eval(process.env.SMTP_IGNORE_TLS),
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
}));

/**
 * Send via Nodemailer
 */
exports.sendMail = (to, from, subject, body, callback) => {
    callback = callback || function () { };//initialize callback
    return new Promise(function (resolve, reject) {
        var mailOptions = {
            to: to,
            from: from,
            subject: subject,
            html: body
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                reject(err);// reject as promise
                return callback(err);// return callback using "error-first-pattern"
            }
            resolve(info);// resolve as promise
            return callback(null, info);// return callback using "error-first-pattern"
        });
    });
};
