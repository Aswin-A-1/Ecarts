const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = {
  getLogin: (req, res) => {
    if (req.session.admin) {
      //Redirect to dashboard if authenticated
      res.redirect("/admin/usermanagement");
    } else {
      res.render("adminlogin");
    }
  },

  postLogin: (req, res) => {
    const { username, password } = req.body;
    const admin = {
      username: "admin",
      password: "admin@567",
    };

    if (username === admin.username && password === admin.password) {
      req.session.admin = admin.username;
      // res.render("admindashboard", { admin: admin.username, users });
      res.redirect("/admin/usermanagement");
    } else {
      res.render("adminlogin", { message: "login failed!" });
    }
  },

  getLogout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log("Error distroying session: ", err);
      } else {
        res.redirect("/admin/login");
      }
    });
  },

  getUserManagement: async (req, res) => {
    if (req.session.admin) {
      //Redirect to usermanagement if authenticated
      const users = await User.find()
      res.render("usermanagement", { users });
    } else {
      res.redirect("/admin/login");
    }
  },

  getProductManagement: async (req, res) => {
    if (req.session.admin) {
      //Redirect to productmanagement if authenticated
      const products = await Product.find()
    
      res.render("productmanagement",{products} );
    } else {
      res.redirect("/admin/login");
    }
  },
  
  getCategoryManagement: async (req, res) => {
    if (req.session.admin) {
      //Redirect to categorymanagement if authenticated
      const categories = await Category.find()
      res.render("categorymanagement", { categories });
    } else {
      res.redirect("/admin/login");
    }
  },

  getBlockUser: async (req, res) => {
    const user = await User.findOne({ _id: req.params.id })
    user.isBlocked = !user.isBlocked
    user.save()
    res.redirect('/admin/usermanagement')
  },

  getCategory: async (req, res) => {
    
    res.render('addcategory')
  },

  getDeleteCategory: async (req, res) => {
    const categoryId = req.params.id
    await Category.findByIdAndDelete(categoryId)
    res.redirect('/admin/categorymanagement')
  },

  postCategory: async (req, res) => {
    const category = req.body.categoryname
    const newCategory = new Category({
      category: category,
    })
    newCategory.save()
    res.redirect('/admin/categorymanagement')
  },

  getAddProduct: async (req, res) => {
    const categories = await Category.find()
    res.render('addproduct', { categories })
  },

  postAddProduct: async (req, res) => {
    const { productname, category, price, model, discription, rating } = req.body
    const newProduct = new Product({
      productname: productname,
      category: category,
      price: price,
      model: model,
      description: discription,
      rating: rating,
      image: req.file.path.substring(6),
      isListed: true,
    })

    newProduct.save()
    res.redirect('/admin/productmanagement')
  },

  getUnlistProduct: async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id })
    product.isListed = !product.isListed
    product.save()
    res.redirect('/admin/productmanagement')
  },

  getEditProduct: async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id })
    const categories = await Category.find()
    res.render('editproduct', { product, categories })
  },

  postEditProduct: async (req, res) => {
    const id = req.params.id
    const image = req.file.path.substring(6)
    const { productname, category, price, model, description, rating, isListed } = req.body
    await Product.updateOne({_id: id}, {$set: {productname: productname, category: category, price: price, model: model, description: description, rating: rating, image: image, isListed: isListed}})
    res.redirect('/admin/productmanagement')
  },

};
