var async = require('async');
const mailsender = require('../helpers/mailsender');
const biller = require('../helpers/biller');

exports.NewUser = function (req, callback) {
    async.waterfall([
        SendMailToAdmin(req),
        SendMailToUser(req),        
        CreateFirstInvoice(req),
    ], function (error, success) {
        if (error)
        {
            throw error;
        }
        callback(null);
    });
};

function SendMailToAdmin(req) {
    //send mail to admin that new user has signed up
    return function (callback) {
        mailsender.sendMail(
            process.env.ADMIN_EMAIL,
            process.env.ADMIN_EMAIL,
            'New user has signed up to ' + process.env.APP_NAME,
            'User email:' + req.body.email)
            .then(function (result) {
                callback();
            }, function (err) {
                callback(err);
            });
    };
};

function SendMailToUser(req) {
    //send welcome email to the user
    return function (callback) {
        var baseUrl = req.protocol + '://' + req.get('host');
        mailsender.sendMail(
            req.body.email,
            process.env.ADMIN_EMAIL,
            'Welcome to ' + process.env.APP_NAME,
            'Hi and welcome to ' + process.env.APP_NAME + "!<br/>Start by <a href='" + baseUrl + "/ticket'>creating a ticket</a>.")
            .then(function (result) {
                callback();
            },function (err) {
                callback(err);
            });
    };
};

function CreateFirstInvoice(req) {
    //send me a mail that new user has signed up
    return function (callback) {
        var now = new Date();
        biller.GetCurrentBill(now, req.user, function (bill) {
            if (!bill) {
                biller.PrepareCurrentPeriodBill(req.user, function (user) {
                    callback();
                });
            }
            else {
                callback();
            }
        });
    };
};