const express = require('express')
const router = express.Router()
const controller = require("../controllers/cartController")

router.get('/', controller.getCart)
router.get('/addtocart/:id', controller.getAddCart)

module.exports = router;