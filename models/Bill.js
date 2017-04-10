const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userid: mongoose.Schema.Types.ObjectId,
    from: Date,
    until: Date,
    isPaid: Boolean,
    price: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    paidDate: Date,
    transactionDetails: mongoose.Schema.Types.Mixed
}, { timestamps: false });

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;