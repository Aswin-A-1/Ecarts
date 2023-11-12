const express = require('express')
const router = express.Router()
const controller = require('../controllers/userController')
const nocache = require('nocache')
router.use(nocache())

router.get('/', controller.getLogin)
router.post('/', controller.postLogin)
router.get('/userhome', controller.getHome)
router.get('/product/:id', controller.getProduct)
router.get('/userregistration', controller.getRegistration)
router.post('/userregistration', controller.postRegistration)
router.get('/resendotp', controller.resendOtp)
router.get('/otpvarification', controller.getOtpVarification)
router.post('/otpvarification', controller.postOtpVarification)
router.get('/logout', controller.getLogout)

module.exports = router