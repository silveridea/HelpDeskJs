const biller = require('../helpers/biller');
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_SKEY);
const mongoose = require('mongoose');
const User = require('../models/User');
const Bill = require('../models/Bill');
/**
 * GET /subscr
 */
exports.getSubscrList = (req, res) => {
    var now = new Date();
    Bill.find({ userid: req.user.id })
        .exec(function (err, bills) {
            if (err) throw err;
            var outstandingBills = [];
            var paidBills = [];
            if (bills) {
                bills.forEach(function (bill) {
                    if (bill.isPaid) {
                        paidBills.push(bill);
                    }
                    else {
                        outstandingBills.push(bill);
                    }
                });
            }
            res.render('subscr/list', {
                title: 'My Subscriptions',
                pagename: 'subscr',
                outstandingBills: outstandingBills,
                paidBills: paidBills,
                moment: moment,
                publishableKey: process.env.STRIPE_PKEY,
                email: req.user.email
            });
        });
};
/**
 * POST /api/stripe
 * Make a payment.
 */
exports.postStripe = (req, res) => {
    const stripeToken = req.body.stripeToken;
    const stripeEmail = req.body.stripeEmail;
    var tempBillids = req.body.billid.split(";");
    //remove empty ones and map to objectid
    var billids = tempBillids.filter(function (bill) {
        return (bill);
    }).map(function (bill) {
        return mongoose.Types.ObjectId(bill);
    });

    Bill.find({ userid: req.user.id })
        .where('_id').in(billids)
        .where('isPaid').equals(false)
        .exec(function (err, bills) {
            if (err)
                throw err;
            if (bills &&
                bills.length > 0) {

                var totalOutstandingAmount = 0;
                var aggBillids = "";
                for (var i = 0; i < bills.length; i++) {
                    totalOutstandingAmount = totalOutstandingAmount + (bills[i].price * 100);
                    aggBillids = aggBillids + bills[i].id + ";";
                }

                stripe.charges.create({
                    amount: totalOutstandingAmount,
                    currency: 'usd',
                    source: stripeToken,
                    description: stripeEmail,
                    metadata: { bill_ids: aggBillids },
                },
                    (err, charge) => {

                        if (err && err.type === 'StripeCardError') {
                            req.flash('errors', { msg: 'Your card has been declined.' });
                            return res.redirect('/subscr');
                        }
                        if (charge.status != "succeeded") {
                            req.flash('errors', { msg: 'General payment error 1, please contact us.' });
                            return res.redirect('/subscr');
                        }
                        var tempChargedBillids = charge.metadata.bill_ids.split(";");
                        var chargedBillids = tempChargedBillids.filter(function (bill) {
                            return (bill);
                        }).map(function (bill) {
                            return mongoose.Types.ObjectId(bill);
                        });
                        var now = new Date();
                        var paidAmount1 = charge.amount / 100 / chargedBillids.length;

                        Bill.update({
                            userid: req.user.id,
                            _id: { "$in": chargedBillids }
                        },
                            {
                                isPaid: true,
                                paidAmount: paidAmount1,
                                paidDate: now,
                                transactionDetails: {
                                    id: charge.id,
                                    balance_transaction: charge.balance_transaction
                                }
                            },
                            { multi: true }, function (err, raw) {
                                if (err)
                                    throw err;

                                //find the oldest paid bill
                                Bill.findOne({ isPaid: true })
                                    .sort({ from: 'asc' })
                                    .exec(function (err, oldestPaidBill) {
                                        if (err)
                                            throw err;

                                        Bill.findOne({ isPaid: true })
                                            .sort({ until: 'desc' })
                                            .exec(function (err, newestPaidBill) {
                                                if (err)
                                                    throw err;

                                                User.findById(req.user.id)
                                                    .exec(function (err, user1) {
                                                        if (err)
                                                            throw err;

                                                        if (!user1.subscription.subscrValidFrom)
                                                            user1.subscription.subscrValidFrom = oldestPaidBill.from;
                                                        user1.subscription.subscrValidUntil = newestPaidBill.until;
                                                        user1.save(function (err, user2) {
                                                            if (err)
                                                                throw err;
                                                                //set confirmation email to be sent by stripe to the customer
                                                            req.flash('success', { msg: 'Your card has been successfully charged.' });
                                                            return res.redirect('/subscr');
                                                        });
                                                    });
                                            });
                                    });
                            });
                    });
            }
            else {
                req.flash('errors', { msg: 'Wrong Bill ID' });
            }
        });
};