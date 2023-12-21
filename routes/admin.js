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
const upload = multer({ storage: storage }).single('img');

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
router.get("/dashboard", checkSession, controller.getAdminDashboard);
router.get("/usermanagement", checkSession, controller.getUserManagement);
router.get("/categorymanagement", checkSession, controller.getCategoryManagement);
router.get("/couponmanagement", checkSession, controller.getCouponManagement);
router.get("/offermanagement", checkSession, controller.getOfferManagement);
router.get("/bannermanagement", checkSession, controller.getBannerManagement);
router.get("/blockuser/:id", controller.getBlockUser);
router.get("/addcategory", checkSession, controller.getCategory);
router.get("/addcoupon", checkSession, controller.getCoupon);
router.get("/addoffer", checkSession, controller.getOffer);
router.get("/addbanner", checkSession, controller.getBanner);
router.get("/deletecategory/:id", controller.getDeleteCategory);
router.get("/deletecoupon/:id", controller.getDeleteCoupon);
router.get("/deleteoffer/:id", controller.getDeleteOffer);
router.get("/deletebanner/:id", controller.getDeleteBanner);
router.get("/editcategory/:id", checkSession, controller.getEditCategory);
router.get("/editcoupon/:id", checkSession, controller.getEditCoupon);
router.post("/addcategory/:id", controller.postEditCategory);
router.post("/addcategory", controller.postCategory);
router.post("/addcoupen/:id", controller.postEditCoupen);
router.post("/addcoupen", controller.postCoupen);
router.post("/addbanner",upload, controller.postBanner);
router.post("/addoffer", controller.postOffer);
router.get("/unlistproduct/:id", controller.getUnlistProduct);
router.get("/generate-pdf", controller.getGeneratePdf);
router.get("/salesreport", controller.getExcelReprot);
router.post('/deleteimage', controller.getDeleteImage)

module.exports = router;
