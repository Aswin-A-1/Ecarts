const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Wallet = require("../models/walletModel");

module.exports = {
  getOrderManagement: async (req, res) => {
    try {
      const orders = await Order.find();
      res.render("ordermanagement", { orders });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch orders. Please try again.");
    }
  },

  postUpdateOrderstatus: async (req, res) => {
    try {
      const orderid = req.params.id;
      await Order.updateOne({ _id: orderid }, { status: req.body.status });
      res.redirect("/order/ordermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to update order status.");
    }
  },

  getUserCancelOrder: async (req, res) => {
    try {
      const userid = req.session.userId;
      const orderid = req.params.id;
      const order = await Order.findById(orderid);
      const refund = order.price * order.quantity - order.discount;
      await Order.updateOne({ _id: orderid }, { status: "Cancelled" });
      if (
        order.paymentmethord == "Wallet" ||
        order.paymentmethord == "Razorpay"
      ) {
        await User.updateOne({ _id: userid }, { $inc: { wallet: refund } });
        const currentDate = new Date();
        const newWallet = new Wallet({
          userid: req.session.userId,
          date: currentDate,
          amount: refund,
          creditordebit: "credit",
        });
        newWallet.save();
      }
      res.redirect("/orders");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to cancel order.");
    }
  },

  getUserReturnOrder: async (req, res) => {
    try {
      const userid = req.session.userId;
      const orderid = req.params.id;
      const order = await Order.findById(orderid);
      const amount = order.price * order.quantity - order.discount;
      await Order.updateOne({ _id: orderid }, { status: "Returned" });
      await User.updateOne({ _id: userid }, { $inc: { wallet: amount } });
      const currentDate = new Date();
      const newWallet = new Wallet({
        userid: req.session.userId,
        date: currentDate,
        amount: amount,
        creditordebit: "credit",
      });
      newWallet.save();
      res.redirect("/orders");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to return order.");
    }
  },

  getAdminCancelOrder: async (req, res) => {
    try {
      const userid = req.session.userId;
      const orderid = req.params.id;
      const order = await Order.findById(orderid)
      await Order.updateOne({ _id: orderid }, { status: "Cancelled" });
      const refund = order.price * order.quantity - order.discount;
      if (
        order.paymentmethord == "Wallet" ||
        order.paymentmethord == "Razorpay"
      ) {
        console.log('refunding')
        await User.updateOne({ _id: userid }, { $inc: { wallet: refund } });
        const currentDate = new Date();
        const newWallet = new Wallet({
          userid: req.session.userId,
          date: currentDate,
          amount: refund,
          creditordebit: "credit",
        });
        newWallet.save();
      }
      res.redirect("/order/ordermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to cancel order by admin.");
    }
  },
};
