const Bill = require('../models/Bill');

exports.GetCurrentBill = function (now, user, callback) {
    Bill.findOne({ userid: user.id })
        .where('from').lte(now)
        .where('until').gte(now)
        .exec(function (err, bill) {
            if (err) throw err;
            return callback(bill);
        });
};
exports.PrepareCurrentPeriodBill = function (user, callback) {
        var now = new Date();
        exports.GetCurrentBill(now, user, function (bill) {
            if (!bill) {
                //no bills, generate new bill
                var end = new Date(now);
                end.setMonth(end.getMonth() + 1);

                const newBill = new Bill({
                    userid: user.id,
                    from: now,
                    until: end,
                    isPaid: false,
                    price: parseFloat(process.env.MONTHLY_PRICE),
                    paidAmount: 0,
                    paidDate: null,
                    transactionDetails: null
                });
                newBill.save((err) => {
                    if (err) { throw err; }
                    return callback(user);
                });
            }
            else {
                return callback(user);
            }
    });
};