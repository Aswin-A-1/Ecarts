const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");

module.exports = {

  getWishlist: async (req, res) => {
    // const cart = await Cart.find({ userid: req.session.userId });
    res.render("wishlist", { userId: req.session.userId });
  },
  
};
