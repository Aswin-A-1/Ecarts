const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");

module.exports = {
  getCart: async (req, res) => {
    const cart = await Cart.find({ userid: req.session.userId });
    res.render("cart", { cart , userId: req.session.userId});
  },

  getAddCart: async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.id;
    const cart = await Cart.findOne({ userid: userId, productid: productId });
    if (cart != null) {
      cart.quantity++;
      cart.save();
      const productData = await Product.findOne({ _id: productId });
      res.redirect(`/product/${productData._id}`);
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
      res.redirect(`/product/${productData._id}`);
    }
  },
};
