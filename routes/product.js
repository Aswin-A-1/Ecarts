const express = require("express");
const router = express.Router();
const nocache = require("nocache");
const path = require('path')
const multer = require("multer");
const controller = require("../controllers/productController");
router.use(nocache());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage }).array('img', 4);

const checkSession = async (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      // No userId in session, redirect to the default page
      res.redirect("/admin/login");
    }
  };

router.get("/productmanagement", checkSession, controller.getProductManagement);
router.get("/addproduct", checkSession, controller.getAddProduct);
router.post("/addproduct", upload, controller.postAddProduct);
router.get("/editproduct/:id", checkSession, controller.getEditProduct);
router.post("/editproduct/:id", upload, controller.postEditProduct);
router.get("/unlistproduct/:id", controller.getUnlistProduct);

module.exports = router;
