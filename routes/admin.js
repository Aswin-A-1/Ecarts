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
const upload = multer({ storage: storage }).array('img', 4);

const checkSession = async (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    // No userId in session, redirect to the default page
    res.redirect("/admin/login");
  }
};

router.get("/login", controller.getLogin);
router.get("/logout", controller.getLogout);
router.post("/login", controller.postLogin);
router.get("/usermanagement", checkSession, controller.getUserManagement);
router.get("/productmanagement", checkSession, controller.getProductManagement);
router.get("/categorymanagement", checkSession, controller.getCategoryManagement);
router.get("/ordermanagement", checkSession, controller.getOrderManagement);
router.get("/blockuser/:id", controller.getBlockUser);
router.get("/addcategory", checkSession, controller.getCategory);
router.get("/deletecategory/:id", controller.getDeleteCategory);
router.get("/editcategory/:id", checkSession, controller.getEditCategory);
router.post("/addcategory/:id", controller.postEditCategory);
router.post("/addcategory", controller.postCategory);
router.get("/addproduct", checkSession, controller.getAddProduct);
router.post("/addproduct", upload, controller.postAddProduct);
router.get("/unlistproduct/:id", controller.getUnlistProduct);
router.get("/editproduct/:id", checkSession, controller.getEditProduct);
router.post("/editproduct/:id", upload, controller.postEditProduct);
router.post("/ordrstatus/:id", upload, controller.postUpdateOrderstatus);

module.exports = router;
