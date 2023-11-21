const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
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
      res.status(500).send("Internal Server Error");
    }
  },

  postLogin: async (req, res) => {
    const { email, password } = req.body;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      res.render("userlogin", { message: "Email not valid!" });
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
        return res.status(500).send("Internal Server Error");
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
      res.render("userhome", { products, userId });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getProduct: async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.params.id });
      res.render("product", { product });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },

  getRegistration: (req, res) => {
    try {
      const otpSent = false;
      res.render("userregistration", { otpSent });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
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
    const otp = req.session.otp;
    res.render("otpverification");
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
    res.render("forgotpassword");
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
    res.render("fpotpverification");
  },

  postFgtPswOtpVerify: async (req, res) => {
    if (req.body.otp === req.session.otp) {
      res.redirect("/newpassword");
    } else {
      res.render("fpotpverification", { message: "OTP icorrect!" });
    }
  },

  getNewPassword: async (req, res) => {
    res.render("newpassword");
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
    const id = req.params.id;
    const user = await User.findOne({ _id: id });
    res.render("userprofile", { user });
  },

  getAddress: async (req, res) => {
    const userId = req.session.userId;
    const user = await User.findOne({ _id: userId });
    const addresses = await Address.find({ userid: userId });
    res.render("address", { user, userId, addresses });
  },

  getAddAddress: async (req, res) => {
    res.render("addaddress");
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

    newAddress.save();
    res.redirect("/useraddress");
  },

  getAddressEdit: async (req, res) => {
    const addressData = await Address.findOne({ _id: req.params.id });
    res.render("editaddress", { addressData });
  },

  postAddressEdit: async (req, res) => {
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
  },

  getAddressDelete: async (req, res) => {
    const addressId = req.params.id;
    await Address.findByIdAndDelete(addressId);
    res.redirect("/useraddress");
  },

  getOrders: async (req, res) => {
    const userId = req.session.userId;
    const user = await User.findOne({ _id: userId });
    const orders = await Order.find({ userid: userId });
    res.render("orders", { user, userId, orders });
  },

  getCancelOrder: async (req, res) => {
    const orderId = req.params.id;
    await Order.findByIdAndDelete(orderId);
    res.redirect("/orders");
  },
};
