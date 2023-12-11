const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/coupenModel");
const Offer = require("../models/offerModel");
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
      res.status(500).send("Error occurred during login. Please try again.");
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
      res.status(500).send("Error occurred during logout. Please try again.");
    }
  },

  getUserManagement: async (req, res) => {
    try {
      const users = await User.find();
      res.render("usermanagement", { users });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch user data. Please try again.");
    }
  },

  getCategoryManagement: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("categorymanagement", { categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch categories. Please try again.");
    }
  },

  getCouponManagement: async (req, res) => {
    try {
      const coupons = await Coupon.find();
      res.render("coupenmanagement", { coupons });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch coupons. Please try again.");
    }
  },

  getOfferManagement: async (req, res) => {
    try {
      const offers = await Offer.find();
      res.render("offermanagement", { offers });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch offers. Please try again.");
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
      return res.status(500).send("Failed to block user.");
    }
  },

  getCategory: async (req, res) => {
    try {
      res.render("addcategory");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get category edit page.");
    }
  },

  getCoupon: async (req, res) => {
    try {
      res.render("addcoupen");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get addcoupon page.");
    }
  },

  getOffer: async (req, res) => {
    try {
      const products = await Product.find()
      const categories = await Category.find()
      res.render("addoffer", { categories, products });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get addoffer page.");
    }
  },

  getDeleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      await Category.findByIdAndDelete(categoryId);
      res.redirect("/admin/categorymanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon.");
    }
  },

  getDeleteCoupon: async (req, res) => {
    try {
      const couponId = req.params.id;
      await Coupon.findByIdAndDelete(couponId);
      res.redirect("/admin/couponmanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon");
    }
  },

  getDeleteOffer: async (req, res) => {
    try {
      const offerId = req.params.id;
      await Offer.findByIdAndDelete(offerId);
      res.redirect("/admin/offermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete offer");
    }
  },

  getDeleteCoupon: async (req, res) => {
    try {
      const couponId = req.params.id;
      await Coupon.findByIdAndDelete(couponId);
      res.redirect("/admin/couponmanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon");
    }
  },

  getEditCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const category = await Category.findOne({ _id: id });
      res.render("editcategory", { category: category });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the category edit page.");
    }
  },

  getEditCoupon: async (req, res) => {
    try {
      const id = req.params.id;
      const coupon = await Coupon.findOne({ _id: id });
      res.render("editcoupon", { coupon: coupon });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the coupon edit page.");
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
      return res.status(500).send("Failed to edit category.");
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
      return res.status(500).send("Failed to edit coupen.");
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

  postOffer: async (req, res) => {
    const { product, category, discount, expiryDate } = req.body;
    const isthere = await Offer.findOne({ $or: [ { applicableProduct: product }, { applicableCategorie: category } ] });
    if (isthere === null) {
      try {
        const newOffer = new Offer({
          applicableProduct: product,
          applicableCategorie: category,
          discount: discount,
          expiryDate: expiryDate,
          isActive: true,

        });
        newOffer.save();
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error inserting offer");
      }
      res.redirect("/admin/offermanagement");
    } else {
      const products = await Product.find()
      const categories = await Category.find()
      res.render("addoffer", { message: "Offer already exist!", products, categories });
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
