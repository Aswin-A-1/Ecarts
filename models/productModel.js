const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: true,
    },
    category: {
        type: String,
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
    isListed: {
        type: Boolean,
        required: true,
    }
})

module.exports = mongoose.model('Product', productSchema)