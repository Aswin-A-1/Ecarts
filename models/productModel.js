const mongoose = require('mongoose')
const Category = require("./categoryModel");

const productSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Category,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    image: {
        type: [String],
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    isListed: {
        type: Boolean,
        required: true,
    }
})

module.exports = mongoose.model('Product', productSchema)