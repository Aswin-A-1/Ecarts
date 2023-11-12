const User = require("../models/userModel");
const Product = require("../models/productModel");
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
    req.session.destroy((err) => {
      if (err) {
        console.log("Error distroying session: ", err);
      } else {
        res.redirect("/");
      }
    });
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
        console.log(err);
      }
    }
  },

  getHome: async (req, res) => {
    if (req.session.userId) {
      //Redirect to homepage if authenticated
      const products = await Product.find({ isListed: true });
      res.render("userhome", { products });
    } else {
      res.redirect("/");
    }
  },

  getProduct: async (req, res) => {
    if (req.session.userId) {
      //Redirect to homepage if authenticated
      const product = await Product.findOne({ _id: req.params.id });
      res.render("product", { product });
    } else {
      res.redirect("/");
    }
  },

  getRegistration: (req, res) => {
    const otpSent = false;
    res.render("userregistration", { otpSent });
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
    console.log('newotp')
    console.log(otp)
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
};
