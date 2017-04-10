const moment = require('moment');
const biller = require('../helpers/biller');
const grooveClass = require('groove-api');

var groove = new grooveClass(process.env.GROOVEHQ_ACCESS_TOKEN);

var getCustomerEmailFromLink = function (link) {
    var result = ""
    if (link) {
        var splt = link.split("/");
        result = splt[splt.length - 1];
    }
    return result;
};

/**
 * GET /dashboard
 */
exports.index = (req, res, next) => {
    //check if use has outstanding invoices
    var now = new Date();
    biller.GetCurrentBill(now, req.user, function (bill) {
        if (!bill || !bill.isPaid) {
            req.flash('warnings', { msg: "You have outstanding invoices. <a class='lnk' href='/subscr'>View invoices</a>" });
        }
        //callback example
        //groove.getTickets(null, req.user.email, null, null, null, null, function (err, ticketsresult) {
        //    if (err) {
        //        next(err);
        //    }
        //    res.render('dashboard/indexgroove', {
        //        title: 'Dashboard',
        //        pagename: 'dashboard',
        //        tickets: ticketsresult.tickets,
        //        moment: moment
        //    });
        //});

        //promise example
        groove.getTickets(null, req.user.email)
            .then(function (ticketsresult) {
                res.render('dashboard/index', {
                    title: 'Dashboard',
                    pagename: 'dashboard',
                    tickets: ticketsresult.tickets,
                    moment: moment
                });
            },
            function (err)
            {
                throw err;  
            })
            .catch(next);
    });
};

exports.getMessages = (req, res, next) => {
    var ticketId = req.params.ticketId;
    groove.getTicket(ticketId)
        .then(function (ticketresult) {
            var customerEmail = getCustomerEmailFromLink(ticketresult.ticket.links.customer.href);
            if (customerEmail &&
                customerEmail.toLowerCase() == req.user.email.toLowerCase()) {
                    groove.getMessages(ticketId, null, null)
                        .then(function (messagesresult) {
                            res.render('dashboard/messages', {
                                title: 'Messages',
                                pagename: 'messages',
                                messages1: messagesresult.messages,
                                moment: moment,
                                ticketId: ticketId
                            });
                        });
            }
            else {
                throw new Error("This ticket does not belong to the current user");
            }
        },
        function (err) {
            throw err;
        })
        .catch(next);
};
exports.postMessage = (req, res, next) => {
    req.assert('ticketid1', 'TicketId cannot be empty').notEmpty();
    req.assert('text1', 'Text cannot be empty').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/dashboard');
    }

    var ticketId = req.params.ticketId;
    if (ticketId != req.body.ticketid1) {
        throw new Error("Ticket id not valid");
    }
    groove.getTicket(ticketId)
        .then(function (ticketresult) {
            var customerEmail = getCustomerEmailFromLink(ticketresult.ticket.links.customer.href);
            if (customerEmail &&
                customerEmail.toLowerCase() == req.user.email.toLowerCase()) {
                groove.createMessage(ticketId, req.body.text1)
                    .then(function (result) {
                        req.flash('success', { msg: 'Message was added successfully.' });
                        res.redirect('/dashboard/messages/' + ticketId);
                    });
            }
            else {
                throw new Error("This ticket does not belong to the current user");
            }
        })
        .catch(next);
};