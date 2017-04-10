const biller = require('../helpers/biller');
const grooveClass = require('groove-api');

var groove = new grooveClass(process.env.GROOVEHQ_ACCESS_TOKEN);

/**
 * GET /ticket
 */
exports.getTicket = (req, res) => {
    //check if use has outstanding invoices
    var now = new Date();
    biller.GetCurrentBill(now, req.user, function (bill) {
        if (process.env.ENFORCE_PAYMENT_BEFORE_CREATE_TICKETS=='true') {
            if (!bill || !bill.isPaid) {
                req.flash('errors', { msg: "You have outstanding invoices. Please pay them before proceeding." });
                return res.redirect('/subscr');
            }
        }
        res.render('ticket', {
            title: 'Create New Ticket',
            pagename: 'ticket'
        });
    });
};

/**
 * POST /ticket
 */
exports.postTicket = (req, res) => {
    //check if use has outstanding invoices
    var now = new Date();
    biller.GetCurrentBill(now, req.user, function (bill) {
        if (process.env.ENFORCE_PAYMENT_BEFORE_CREATE_TICKETS == 'true') {
            if (!bill || !bill.isPaid) {
                req.flash('errors', { msg: "You have outstanding invoices. Please pay them before proceeding." });
                return res.redirect('/subscr');
            }
        }

        req.assert('title', 'Title cannot be blank').notEmpty();
        req.assert('request', 'Request cannot be blank').notEmpty();

        const errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            return res.redirect('/ticket');
        }

        //post to groove
        groove.createTicket(req.body.request, req.user.email, process.env.GROOVE_AGENT_EMAIL, null, null, null, null, null, null, req.body.title, null)
            .then(function (result) {
                if (result.message) {
                    req.flash('errors', { msg: result.message });
                    return res.redirect('/dashboard');
                }
                req.flash('success', { msg: 'Thank you. Your request has been submitted.' });
                res.redirect('/dashboard');
            },
            function (err) {
                throw err;
            });
    });
};