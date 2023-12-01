const express = require("express");
const router = express.Router();
const controller = require("../controllers/paymentController");

router.post("/createrazorpayorder", controller.postCreateRazorpayOrder);

module.exports = router;