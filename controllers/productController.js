const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");

module.exports = {

  getAddProduct: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("addproduct", { categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error getting addproduct page");
    }
  },

  getProductManagement: async (req, res) => {
    try {
      
      const products = await Product.find({}).populate("category");
      res.render("productmanagement", { products });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get products. please try again");
    }
  },

  postAddProduct: async (req, res) => {
    const { productname, category, price, model, discription, rating, stock } =
      req.body;
    const newProduct = new Product({
      productname: productname,
      category: category,
      price: price,
      model: model,
      description: discription,
      image: req.files.map((file) => file.path.substring(6)),
      stock: stock,
      isListed: true,
    });

    newProduct.save();
    res.redirect("/products/productmanagement");
  },

  getEditProduct: async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.params.id }).populate(
        "category"
      );
      const categories = await Category.find();
      res.render("editproduct", { product, categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get product edit page.");
    }
  },

  postEditProduct: async (req, res) => {
    const id = req.params.id;
    const image = req.files.map((file) => file.path.substring(6));
    const {
      productname,
      category,
      price,
      model,
      description,
      stock,
      isListed,
    } = req.body;
    await Product.updateOne(
      { _id: id },
      {
        $set: {
          productname: productname,
          category: category,
          price: price,
          model: model,
          description: description,
          rating: rating,
          image: image,
          stock: stock,
          isListed: isListed,
        },
      }
    );
    res.redirect("/products/productmanagement");
  },

  getUnlistProduct: async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    try {
      product.isListed = !product.isListed;
      product.save();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error changing product status");
    }
    res.redirect("/products/productmanagement");
  },

};
