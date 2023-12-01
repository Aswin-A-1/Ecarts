const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/coupenModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = {
  getLogin: (req, res) => {
    try {
      if (req.session.admin) {
        //Redirect to dashboard if authenticated
        res.redirect("/admin/usermanagement");
      } else {
        res.render("adminlogin");
      }
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Internal Server Error");
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
    try {
      req.session.destroy((err) => {
        if (err) {
          console.log("Error distroying session: ", err);
        } else {
          res.redirect("/admin/login");
        }
      });
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Internal Server Error");
    }
  },

  getUserManagement: async (req, res) => {
    try {
      const users = await User.find();
      res.render("usermanagement", { users });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getCategoryManagement: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("categorymanagement", { categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getCouponManagement: async (req, res) => {
    try {
      const coupons = await Coupon.find();
      res.render("coupenmanagement", { coupons });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getBlockUser: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id });
      user.isBlocked = !user.isBlocked;
      user.save();
      res.redirect("/admin/usermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getCategory: async (req, res) => {
    try {
      res.render("addcategory");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getCoupon: async (req, res) => {
    try {
      res.render("addcoupen");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getDeleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      await Category.findByIdAndDelete(categoryId);
      res.redirect("/admin/categorymanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getDeleteCoupon: async (req, res) => {
    try {
      const couponId = req.params.id;
      await Coupon.findByIdAndDelete(couponId);
      res.redirect("/admin/couponmanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getEditCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const category = await Category.findOne({ _id: id });
      res.render("editcategory", { category: category });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getEditCoupon: async (req, res) => {
    try {
      const id = req.params.id;
      const coupon = await Coupon.findOne({ _id: id });
      res.render("editcoupon", { coupon: coupon });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  postEditCategory: async (req, res) => {
    const id = req.params.id;
    const categoryname = req.body.categoryname;
    try {
      await Category.updateOne(
        { _id: id },
        { $set: { category: categoryname } }
      );
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error updating category");
    }
    res.redirect("/admin/categorymanagement");
  },

  postEditCoupen: async (req, res) => {
    const id = req.params.id;
    const { coupencode, discount, expiryDate, limit } = req.body;
    try {
      await Coupon.updateOne(
        { _id: id },
        { $set: { code: coupencode, discount: discount, expiryDate: expiryDate, limit: limit } }
      );
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error updating category");
    }
    res.redirect("/admin/couponmanagement");
  },

  postCategory: async (req, res) => {
    const category = req.body.categoryname;
    const isthere = await Category.findOne({ category: category });
    if (isthere === null) {
      try {
        const newCategory = new Category({
          category: category,
        });
        newCategory.save();
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error inserting category");
      }
      res.redirect("/admin/categorymanagement");
    } else {
      res.render("addcategory", { message: "Category already exist!" });
    }
  },

  postCoupen: async (req, res) => {
    const { coupencode, discount, expiryDate, limit } = req.body;
    const isthere = await Coupon.findOne({ code: coupencode });
    if (isthere === null) {
      try {
        const newCoupen = new Coupon({
          code: coupencode,
          discount: discount,
          expiryDate: expiryDate,
          limit: limit,
        });
        newCoupen.save();
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error inserting coupon");
      }
      res.redirect("/admin/couponmanagement");
    } else {
      res.render("addcategory", { message: "Category already exist!" });
    }
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
    res.redirect("/admin/productmanagement");
  },
};
