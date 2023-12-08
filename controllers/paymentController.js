const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Razorpay = require('razorpay');
require("dotenv").config();

const razorpayInstance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

module.exports = {

    // postCreateRazorpayOrder: async (req, res) => {
    //   try {
    //     const amount = req.body.amount

    //     const razorpayOrder = await razorpayInstance.orders.create({
    //       amount: amount,
    //       currency: 'INR',
    //       receipt: 'receipt#1',
    //   });
    //   } catch (err) {
    //     console.error(err);
    //     return res.status(500).send("Internal Server Error");
    //   }
    // },

    // postCreateRazorpayOrder: async (req, res) => {
    //   try {
    //     const razorpayInstance = new Razorpay({
    //       key_id: process.env.KEY_ID,
    //       key_secret: process.env.KEY_SECRET,
    //     });
    
    //     const amount = req.body.amount; // Assuming totalPrice is defined
    
    //     const options = {
    //       amount: amount,
    //       currency: 'INR',
    //       receipt: 'order_rcptid_11',
    //     };
    
    //     // Creating the order
    //     razorpayInstance.orders.create(options, function (err, order) {
    //       if (err) {
    //         console.error(err);
    //        res.status(500).send('Error creating order');
    //        return;
    //       }
    
    //       console.log(order);
    //       // Add order price to the response object
    //       res.send({ orderId: order.id });
    
    //       // Replace razorpayOrderId and razorpayPaymentId with actual values
    //       const { validatePaymentVerification } = require('./dist/utils/razorpay-utils');
    //       validatePaymentVerification(
    //         { order_id: order.id, payment_id: req.body.razorpayPaymentId }, // Assuming razorpayPaymentId is in req.body
    //         req.body.signature, // Assuming signature is in req.body
    //         process.env.KEY_SECRET, // Replace with your actual secret key
    //       );
    
    //       // Redirect to /orderdata on successful payment
    //       res.redirect('/orderdata');
    //     });
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Internal Server Error');
    //   }
    // }
 
     postCreateRazorpayOrder: async (req, res) => {
      console.log('entervthe razpr');
      try {
        var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET });
        var options = {
          amount: totalPrice,
          currency: "INR",
          receipt: "order_rcptid_11",
        };
    
        // Creating the order
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.error(err);
            res.status(500).send("Error creating order");
            return;
          }
    
          // console.log(order);
          // Add orderprice to the response object
          res.send({ orderId: order.id });
    
          // Replace razorpayOrderId and razorpayPaymentId with actual values
          var { validatePaymentVerification, validateWebhookSignature } = require('./dist/utils/razorpay-utils');
          validatePaymentVerification(
            { "order_id": order.id, "payment_id": razorpayPaymentId }, // Make sure razorpayPaymentId is defined
            signature, // Make sure signature is defined
            secret
          );
    
          // Redirect to /orderdata on successful payment
          // res.redirect('/orderdata');
        });
      } catch (error) {
        console.error(error);
        res.status(500).send("Error creating razorpay order.");
      }
    },

}