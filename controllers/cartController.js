const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");

module.exports = {
  getCart: async (req, res) => {
    const cart = await Cart.find({ userid: req.session.userId });
    res.render("cart", { cart, userId: req.session.userId });
  },

  getAddCart: async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.id;
    const cart = await Cart.findOne({ userid: userId, productid: productId });
    if (cart != null) {
      cart.quantity++;
      cart.save();
      const productData = await Product.findOne({ _id: productId });
      res.redirect('/cart');
    } else {
      const userData = await User.findOne({ _id: userId });
      const productData = await Product.findOne({ _id: productId });
      const newCart = new Cart({
        userid: userData._id,
        user: userData.username,
        productid: productData._id,
        product: productData.productname,
        price: productData.price,
        quantity: 1,
        image: productData.image[0],
      });

      newCart.save();
      res.redirect('/cart');
    }
  },

  getRemoveCart: async (req, res) => {
    const productId = req.params.id;
    const cart = await Cart.findByIdAndDelete(productId)
    res.redirect('/cart')
  },

  getAddQuantity: async (req, res) => {
    const productId = req.params.id;
    const cart = await Cart.findOne({ _id: productId });
    cart.quantity++;
    cart.save();
    res.json({ updatedQuantity: cart.quantity })
  },

  getSubQuantity: async (req, res) => {
    const productId = req.params.id;
    const cart = await Cart.findOne({ _id: productId });
    if (cart.quantity > 1) {
      cart.quantity--;
      cart.save();
      res.json({ updatedQuantity: cart.quantity })
    } else {
        res.redirect("/cart");
    }
  },

  getCheckOut: async (req, res) => {
    const cart = await Cart.find( { userid: req.session.userId } )
    const addresses = await Address.find( { userid: req.session.userId } )
    res.render('checkout', { userid: req.session.userId, cart, addresses })
  },
  
  postPlaceOrder: async (req, res) => {
    const cart = await Cart.find( { userid: req.session.userId } )
    const currentDate = new Date();
    for( const item of cart ){
      const newOrder = new Order({
        userid: item.userid,
        user: item.user,
        productid: item.productid,
        product: item.product,
        price: item.price,
        quantity: item.quantity,
        addressid: req.body.address,
        orderdate: currentDate,
        status: 'pending',
      })
      
      newOrder.save()
      await Product.updateOne( { _id: item.productid }, { $inc: { stock: -item.quantity } } )
    }
    await Cart.deleteMany( { userid: req.session.userId } )
    res.render('orderconfirm')
  },
};
