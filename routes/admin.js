const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");
const nocache = require("nocache");
const path = require('path')
const multer = require("multer");
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
const upload = multer({ storage: storage });

router.get("/login", controller.getLogin);
router.get("/logout", controller.getLogout);
router.post("/login", controller.postLogin);
router.get("/usermanagement", controller.getUserManagement);
router.get("/productmanagement", controller.getProductManagement);
router.get("/categorymanagement", controller.getCategoryManagement);
router.get("/blockuser/:id", controller.getBlockUser);
router.get("/addcategory", controller.getCategory);
router.get("/deletecategory/:id", controller.getDeleteCategory);
router.post("/addcategory", controller.postCategory);
router.get("/addproduct", controller.getAddProduct);
router.post("/addproduct", upload.single("img"), controller.postAddProduct);
router.get("/unlistproduct/:id", controller.getUnlistProduct);
router.get("/editproduct/:id", controller.getEditProduct);
router.post("/editproduct/:id", upload.single("img"), controller.postEditProduct);

module.exports = router;
