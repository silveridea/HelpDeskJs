'use strict'

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
var transporter = null;
if (process.env.SMTP_SERVER && process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD) {
    transporter = nodemailer.createTransport(smtpTransport({
        host: process.env.SMTP_SERVER,
        port: process.env.SMTP_PORT,
        secure: eval(process.env.SMTP_IS_SECURE),
        ignoreTLS: eval(process.env.SMTP_IGNORE_TLS),
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD
        }
    }));
}
/**
 * Send via Nodemailer
 */
exports.sendMail = (to, from, subject, body, callback) => {
    return new Promise(function (resolve, reject) {
        if (transporter) {
            var mailOptions = {
                to: to,
                from: from,
                subject: subject,
                html: body
            };
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    if (callback)
                        reject(callback(err));
                    reject(err);
                }
                if (callback)
                    resolve(callback(null, info));
                resolve(info);
            });
        }
        else {
            if (callback)
                resolve(callback(null, null));
            resolve(null);
        }
    });
};