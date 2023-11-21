const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
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
    const users = await User.find()
    res.render("usermanagement", { users });
  },

  getProductManagement: async (req, res) => {
    const products = await Product.find()
    
      res.render("productmanagement",{products} );
  },
  
  getCategoryManagement: async (req, res) => {
    const categories = await Category.find()
      res.render("categorymanagement", { categories });
  },

  getOrderManagement: async (req, res) => {
    const orders = await Order.find()
      res.render("ordermanagement", { orders });
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

  getEditCategory: async (req, res) => {
    const id = req.params.id
    const category = await Category.findOne( { _id: id } )
    res.render('editcategory', { category: category })
  },

  postEditCategory: async (req, res) => {
    const id = req.params.id
    const categoryname = req.body.categoryname
    await Category.updateOne({_id: id}, {$set: { category: categoryname }})
    res.redirect('/admin/categorymanagement')
  },

  postCategory: async (req, res) => {
    const category = req.body.categoryname
    const isthere = await Category.findOne( { category: category } )
    if(isthere === null){
      const newCategory = new Category({
        category: category,
      })
      newCategory.save()
      res.redirect('/admin/categorymanagement')
    } else {
      res.render('addcategory', { message: 'Category already exist!' })
    }
  },

  getAddProduct: async (req, res) => {
    const categories = await Category.find()
    res.render('addproduct', { categories })
  },

  postAddProduct: async (req, res) => {
    const { productname, category, price, model, discription, rating, stock } = req.body
    const newProduct = new Product({
      productname: productname,
      category: category,
      price: price,
      model: model,
      description: discription,
      rating: rating,
      image: req.files.map(file => file.path.substring(6)),
      stock: stock,
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
    const image = req.files.map(file => file.path.substring(6))
    const { productname, category, price, model, description, rating, stock, isListed } = req.body
    await Product.updateOne({_id: id}, {$set: {productname: productname, category: category, price: price, model: model, description: description, rating: rating, image: image,stock: stock, isListed: isListed}})
    res.redirect('/admin/productmanagement')
  },

  postUpdateOrderstatus: async (req, res) => {
    const orderid = req.params.id
    await Order.updateOne( { _id: orderid }, { status: req.body.status } )
    res.redirect('/admin/ordermanagement')
  },

};
