const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");

module.exports = {

    getOrderManagement: async (req, res) => {
      try {
        const orders = await Order.find();
        res.render("ordermanagement", { orders });
      } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
      }
    },

    postUpdateOrderstatus: async (req, res) => {
      try {
        const orderid = req.params.id;
        await Order.updateOne({ _id: orderid }, { status: req.body.status });
        res.redirect("/order/ordermanagement");
      } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
      }
    },

}