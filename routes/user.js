const express = require('express')
const router = express.Router()
const User = require("../models/userModel");
const controller = require('../controllers/userController')
const nocache = require('nocache')
router.use(nocache())

const checkSessionAndBlocked = async (req, res, next) => {
    if (req.session.userId) {
      const userDetials = await User.findOne({ _id: req.session.userId });
      if (!userDetials.isBlocked) {
        // User is not blocked, proceed to the next middleware or route handler
        next();
      } else {
        // User is blocked, destroy the session and redirect
        req.session.destroy((err) => {
          if (err) {
            console.log("Error destroying session: ", err);
            res.redirect("/");
          } else {
            res.redirect("/");
          }
        });
      }
    } else {
      // No userId in session, redirect to the default page
      res.redirect("/");
    }
  };

router.get('/', controller.getLogin)
router.post('/', controller.postLogin)
router.get('/userhome', checkSessionAndBlocked, controller.getHome)
router.get('/product/:id', checkSessionAndBlocked, controller.getProduct)
router.get('/userregistration', controller.getRegistration)
router.post('/userregistration', controller.postRegistration)
router.get('/resendotp', controller.resendOtp)
router.get('/otpvarification', controller.getOtpVarification)
router.post('/otpvarification', controller.postOtpVarification)
router.get('/logout', controller.getLogout)
router.get('/forgotpassword', controller.getForgotPassword)
router.post('/forgotpassword', controller.postForgotPassword)
router.get('/forgotpswotpverify', controller.getFgtPswOtpVerify)
router.post('/forgotpswotpverify', controller.postFgtPswOtpVerify)
router.get('/newpassword', controller.getNewPassword)
router.post('/newpassword', controller.postNewPassword)
router.get('/userprofile/:id', checkSessionAndBlocked, controller.getProfile)
router.get('/useraddress', checkSessionAndBlocked, controller.getAddress)
router.get('/addaddress', controller.getAddAddress)
router.post('/addaddress', controller.postAddAddress)
router.get('/addressedit/:id', controller.getAddressEdit)
router.post('/addressedit/:id', controller.postAddressEdit)
router.get('/addressdelete/:id', controller.getAddressDelete)
router.get('/orders', controller.getOrders)
router.get('/cancelorder/:id', controller.getCancelOrder)

module.exports = router