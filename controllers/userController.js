const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");
const Wsihlist = require("../models/wishlistModel");
const Wallet = require("../models/walletModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = {
  getLogin: (req, res) => {
    if (req.session.userId) {
      //Redirect to homepage if authenticated
      res.redirect("/userhome");
    } else {
      res.render("userlogin");
    }
  },

  getLogout: (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          res.status(500).send("Error logging out");
        } else {
          res.redirect("/");
        }
      });
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Error occurred during login. Please try again.");
    }
  },

  postLogin: async (req, res) => {
    const { email, password } = req.body;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^.{8,}$/;
    if (!emailPattern.test(email) || !passwordPattern.test(password)) {
      res.render("userlogin", {
        message: "Email and password should be valid!",
      });
    } else {
      try {
        const user = await User.findOne({ email: email });
        if (user != null) {
          //Checking password match
          if (password === user.password) {
            if (!user.isBlocked) {
              //Adding session details
              req.session.userId = user._id;
              req.session.username = user.username;
              res.redirect("/userhome");
            } else {
              res.render("userlogin", {
                message: "This account is blocked!",
              });
            }
          } else {
            res.render("userlogin", {
              message: "login failed, Incorrect password!",
            });
          }
        } else {
          res.render("userlogin", { message: "login failed!" });
        }
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error in login.");
      }
    }
  },

  getHome: async (req, res) => {
    try {
      const userId = req.session.userId;
      const products = await Product.find({
        isListed: true,
        stock: { $gt: 0 },
      });
      const wishlistItems = await Wsihlist.find({ userid: req.session.userId });
      const wishlistProductIds = wishlistItems.map((item) => item.productid);

      const wishlistProducts = await Product.find({
        _id: { $in: wishlistProductIds },
      }).select('productname');
      res.render("userhome", { products, userId, wishlistProducts });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get homepage. Please try again.");
    }
  },

  getProduct: async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.params.id });
      res.render("product", { product, userId: req.session.userId });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get productpage.");
    }
  },

  getRegistration: (req, res) => {
    try {
      const otpSent = false;
      res.render("userregistration", { otpSent });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get registratiion.");
    }
  },

  postRegistration: async (req, res) => {
    const { username, email, password } = req.body;
    req.session.data = req.body;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //Username validation
    if (
      username === null ||
      username.trim() === "" ||
      password === null ||
      password.trim() === ""
    ) {
      res.render("userregistration", {
        message: "Enter valid username and password!",
      });
    } else {
      //Email validation
      if (!emailPattern.test(email)) {
        res.render("userregistration", { message: "Email not valid!" });
      } else {
        const data = await User.findOne({ email: email });
        if (data == null) {
          //OTP generator
          const generateOTP = (length) => {
            const digits = "0123456789";
            let OTP = "";

            for (let i = 0; i < length; i++) {
              const randomIndex = crypto.randomInt(0, digits.length);
              OTP += digits[randomIndex];
            }

            return OTP;
          };

          //EmailSending
          const sendOtpEmail = async (email, otp) => {
            // console.log(process.env.EMAIL_USER)
            // console.log(process.env.EMAIL_PASSWORD)
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: "One-Time Password (OTP) for Authentication  for ECart",
              text: `Your Authentication OTP is: ${otp}`,
            };

            transporter.sendMail(mailOptions, async (error, info) => {
              if (error) {
                return console.error("Error:", error);
              }
              console.log("Email sent:", info.response);
            });
          };

          const otp = generateOTP(6);
          req.session.otp = otp;
          await sendOtpEmail(email, otp);

          res.redirect("/otpvarification");
        } else {
          res.render("userregistration", { message: "Email already exist!" });
        }
      }
    }
  },

  resendOtp: async (req, res) => {
    const data = req.session.data;

    //OTP generator
    const generateOTP = (length) => {
      const digits = "0123456789";
      let OTP = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, digits.length);
        OTP += digits[randomIndex];
      }

      return OTP;
    };

    //EmailSending
    const sendOtpEmail = async (email, otp) => {
      // console.log(process.env.EMAIL_USER)
      // console.log(process.env.EMAIL_PASSWORD)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "One-Time Password (OTP) for Authentication  for ECart",
        text: `Your Authentication OTP is: ${otp}`,
      };

      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          return console.error("Error:", error);
        }
        console.log("Email sentagain:", info.response);
      });
    };
    const otp = generateOTP(6);
    req.session.otp = otp;
    await sendOtpEmail(data.email, otp);
    res.redirect("/otpvarification");
  },

  getOtpVarification: (req, res) => {
    try {
      const otp = req.session.otp;
      res.render("otpverification");
    } catch (err) {
      console.log(err);
    }
  },

  postOtpVarification: async (req, res) => {
    const enteredOtp = req.body.otp;
    const otp = req.session.otp;
    console.log(otp);
    if (enteredOtp === otp) {
      const userData = req.session.data;
      const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        wallet: 0,
        isBlocked: false,
      });

      //User data insertion
      newUser.save();
      res.redirect("/");
    } else {
      res.render("otpverification", { message: "OTP is incorrect!" });
    }
  },

  getForgotPassword: (req, res) => {
    try {
      res.render("forgotpassword");
    } catch (err) {
      console.log(err);
    }
  },

  postForgotPassword: async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user != null) {
      req.session.email = email;
      //OTP generator
      const generateOTP = (length) => {
        const digits = "0123456789";
        let OTP = "";

        for (let i = 0; i < length; i++) {
          const randomIndex = crypto.randomInt(0, digits.length);
          OTP += digits[randomIndex];
        }

        return OTP;
      };

      //EmailSending
      const sendOtpEmail = async (email, otp) => {
        // console.log(process.env.EMAIL_USER)
        // console.log(process.env.EMAIL_PASSWORD)
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "One-Time Password (OTP) for Authentication  for ECart",
          text: `Your Authentication OTP is: ${otp}`,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            return console.error("Error:", error);
          }
          console.log("Email sent:", info.response);
        });
      };

      const otp = generateOTP(6);
      req.session.otp = otp;
      await sendOtpEmail(email, otp);
      res.redirect("/forgotpswotpverify");
    } else {
      res.render("forgotpassword", { message: "Email not registered!" });
    }
  },

  getFgtPswOtpVerify: async (req, res) => {
    try {
      res.render("fpotpverification");
    } catch (err) {
      console.log(err);
    }
  },

  postFgtPswOtpVerify: async (req, res) => {
    if (req.body.otp === req.session.otp) {
      res.redirect("/newpassword");
    } else {
      res.render("fpotpverification", { message: "OTP icorrect!" });
    }
  },

  getNewPassword: async (req, res) => {
    try {
      res.render("newpassword");
    } catch (err) {
      console.log(err);
    }
  },

  postNewPassword: async (req, res) => {
    if (req.body.password === req.body.cpassword) {
      await User.updateOne(
        { email: req.session.email },
        { $set: { password: req.body.password } }
      );
      res.redirect("/");
    } else {
      res.render("newpassword", { message: "Enter same password!" });
    }
  },

  getProfile: async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({ _id: id });
      res.render("userprofile", { user });
    } catch (err) {
      console.log(err);
    }
  },

  getAddress: async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await User.findOne({ _id: userId });
      const addresses = await Address.find({ userid: userId });
      res.render("address", { user, userId, addresses });
    } catch (err) {
      console.log(err);
    }
  },

  getWallet: async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await User.findOne({ _id: userId });
      const wallethistory = await Wallet.find({ userid: userId })
      res.render("wallet", { user, userId, wallethistory });
    } catch (err) {
      console.log(err);
    }
  },

  getAddAddress: async (req, res) => {
    try {
      res.render("addaddress");
    } catch (err) {
      console.log(err);
    }
  },

  postAddAddress: async (req, res) => {
    const { firstname, lastname, address, city, state, pincode, phone } =
      req.body;
    const newAddress = new Address({
      userid: req.session.userId,
      firstname: firstname,
      lastname: lastname,
      address: address,
      city: city,
      state: state,
      pincode: pincode,
      phone: phone,
    });

    try {
      newAddress.save();
      res.redirect("/useraddress");
    } catch (err) {
      console.log("Error saving address: ", err);
    }
  },

  getAddressEdit: async (req, res) => {
    try {
      const addressData = await Address.findOne({ _id: req.params.id });
      res.render("editaddress", { addressData });
    } catch (err) {
      console.log(err);
    }
  },

  postAddressEdit: async (req, res) => {
    try {
      await Address.updateOne(
        { _id: req.params.id },
        {
          $set: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            phone: req.body.phone,
          },
        }
      );
      res.redirect("/useraddress");
    } catch (err) {
      console.log("Error updating address: ", err);
    }
  },

  getAddressDelete: async (req, res) => {
    const addressId = req.params.id;
    try {
      await Address.findByIdAndDelete(addressId);
    } catch (err) {
      console.log("Error deleting the address: ", err);
    }
    res.redirect("/useraddress");
  },

  getOrders: async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await User.findOne({ _id: userId });
      const orders = await Order.find({ userid: userId });
      res.render("orders", { user, userId, orders });
    } catch (err) {
      cconsole.log("Error getting orders: ", err);
    }
  },

  getCancelOrder: async (req, res) => {
    try {
      const orderId = req.params.id;
      await Order.findByIdAndDelete(orderId);
      res.redirect("/orders");
    } catch (err) {
      console.log("Error in canceling orders: ", err);
    }
  },

  getSearch: async (req, res) => {
    // try {
    //   const searchQuery = req.query.search;
    //   let filter = {};

    //   if (searchQuery) {
    //     const regexPattern = new RegExp(searchQuery, "i");
    //     filter = { productname: { $regex: regexPattern } };
    //     const filteredProducts = await Product.find(filter);
    //     res.json(filteredProducts);
    //   } else {
    //     const firstFourProducts = await Product.find({}).limit(4);
    //     res.json(firstFourProducts);
    //   }
    // } catch (err) {
    //   console.log(err);
    //   res.status(500).json({ error: "Internal Server Error" });
    // }
    try {
      const searchQuery = req.query.search;
      let productFilter = {};
      let categoryFilter = {};

      if (searchQuery) {
        const regexPattern = new RegExp(searchQuery, "i");

        // Find products matching the query
        productFilter = { productname: { $regex: regexPattern } };

        // Find categories matching the query
        categoryFilter = { category: { $regex: regexPattern } };
      }

      const matchingProducts = await Product.find(productFilter).populate(
        "category"
      );
      const matchingCategories = await Category.find(categoryFilter);
      const response = {
        products: matchingProducts,
        categories: matchingCategories,
      };

      res.json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error while searaching." });
    }
  },

  getShop: async (req, res) => {
    try {
      const userId = req.session.userId;
      const productsByCategory = await Product.aggregate([
        {
          $match: { isListed: true, stock: { $gt: 0 } },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        {
          $unwind: "$categoryInfo",
        },
        {
          $group: {
            _id: "$categoryInfo.category",
            products: {
              $push: "$$ROOT",
            },
          },
        },
      ]);
      const products = await Product.find({
        isListed: true,
        stock: { $gt: 0 },
      });
      const wishlistItems = await Wsihlist.find({ userid: req.session.userId });
      const wishlistProductIds = wishlistItems.map((item) => item.productid);

      const wishlistProducts = await Product.find({
        _id: { $in: wishlistProductIds },
      }).select('productname');
      res.render("shop", { products, productsByCategory, userId, wishlistProducts });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error getting shop.");
    }
  },
  getShopByCategory: async (req, res) => {
    try {
      const userId = req.session.userId;
      const categoryName = req.params.category;
      const category = await Category.findOne({ category: categoryName });
      const products = await Product.find({ category: category._id });
      const wishlistItems = await Wsihlist.find({ userid: req.session.userId });
      const wishlistProductIds = wishlistItems.map((item) => item.productid);

      const wishlistProducts = await Product.find({
        _id: { $in: wishlistProductIds },
      }).select('productname');
      res.render("shopbycategory", { products, userId, categoryName, wishlistProducts });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error getting shop by category.");
    }
  },
};
