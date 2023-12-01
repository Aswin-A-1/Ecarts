const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
    },
    user:{
        type: String,
    },
    productid: {
        type: mongoose.Schema.Types.ObjectId,
    },
    product: {
        type: String,
    },
    price: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    quantity: {
        type: Number,
    },
    addressid: {
        type: mongoose.Schema.Types.ObjectId,
    },
    paymentmethord: {
        type: String,
    },
    razorpaypaymentid: {
        type: String,
    },
    orderdate: {
        type: Date,
    },
    status: {
        type: String,
    },
})

module.exports = mongoose.model('Order', orderSchema)