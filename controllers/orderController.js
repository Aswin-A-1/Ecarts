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
      const productid = req.params.productid;
      await Order.updateOne({ _id: orderid, 'products.productid': productid }, { $set: { 'products.$.status': req.body.status } });
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

      const productid = req.params.productid;
      await Order.updateOne({ _id: orderid, 'products.productid': productid }, { $set: { 'products.$.status': "Cancelled" } });
      const product = order.products.find(product => product.productid == productid);

      const refund = product.price * product.quantity - product.discount;
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
      await Product.updateOne({ _id: productid }, { $inc: { stock: product.quantity } });
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

      const productid = req.params.productid;
      await Order.updateOne({ _id: orderid, 'products.productid': productid }, { $set: { 'products.$.status': "Returned" } });
      const product = order.products.find(product => product.productid == productid);

      const refund = product.price * product.quantity - product.discount;
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
      return res.status(500).send("Failed to return order.");
    }
  },

  getAdminCancelOrder: async (req, res) => {
    try {
      const userid = req.session.userId;
      const orderid = req.params.id;
      const order = await Order.findById(orderid)
      const productid = req.params.productid;
      await Order.updateOne({ _id: orderid, 'products.productid': productid }, { $set: { 'products.$.status': "Cancelled" } });
      const product = order.products.find(product => product.productid == productid);

      const refund = product.price * product.quantity - product.discount;

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
      res.redirect("/order/ordermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to cancel order by admin.");
    }
  },
};
