const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/coupenModel");
const Offer = require("../models/offerModel");
const Address = require("../models/addressModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const PDFDocument  = require('pdfkit-table')
const ExcelJS = require('exceljs')
require("dotenv").config();

module.exports = {
  getLogin: (req, res) => {
    try {
      if (req.session.admin) {
        //Redirect to dashboard if authenticated
        res.redirect("/admin/usermanagement");
      } else {
        res.render("adminlogin");
      }
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Error occurred during login. Please try again.");
    }
  },

  postLogin: (req, res) => {
    const { username, password } = req.body;
    const admin = {
      username: "admin",
      password: "admin@567",
    };

    if (username === admin.username && password === admin.password) {
      req.session.admin = admin.username;
      // res.render("admindashboard", { admin: admin.username, users });
      res.redirect("/admin/dashboard");
    } else {
      res.render("adminlogin", { message: "login failed!" });
    }
  },

  getLogout: (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.log("Error distroying session: ", err);
        } else {
          res.redirect("/admin/login");
        }
      });
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Error occurred during logout. Please try again.");
    }
  },

  // getAdminDashboard: async (req, res) => {
  //   try {
  //     const users = await User.find();
  //     res.render("admindashboard", { users });
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).send("Failed to fetch dashboard data. Please try again.");
  //   }
  // },

  getAdminDashboard: async (req, res) => {
    try {
  
      const dailyOrders = await Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderdate" } },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
  
      const { dates, orderCounts, totalOrderCount } = dailyOrders.reduce(
        (result, order) => {
          result.dates.push(order._id);
          result.orderCounts.push(order.orderCount);
          result.totalOrderCount += order.orderCount;
          return result;
        },
        { dates: [], orderCounts: [], totalOrderCount: 0 }
      );
      console.log('count daily', dates, "", dailyOrders);
  
  
  
  
      const monthlyOrders = await Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$orderdate" },
              month: { $month: "$orderdate" },
            },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
      console.log(monthlyOrders)
  
      // Extract only the order counts
      const orderCount = monthlyOrders.map(order => order.orderCount);
      
      const monthlyData = monthlyOrders.reduce((result, order) => {
        const monthYearString = `${order._id.year}-${String(order._id.month).padStart(2, '0')}`;
        result.push({
          month: monthYearString,
          orderCount: order.orderCount,
        });
        return result;
      }, [])
      let monthdata = orderCount

      const yearlyOrders = await Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y", date: "$orderdate" } },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
      const { years, orderCounts3, totalOrderCount3 } = yearlyOrders.reduce(
        (result, order) => {
          result.years.push(order._id);
          result.orderCounts3.push(order.orderCount);
          result.totalOrderCount3 += order.orderCount;
          return result;
        },
        { years: [], orderCounts3: [], totalOrderCount3: 0 }
      );
      console.log(dailyOrders, orderCounts, monthdata, totalOrderCount3)
      res.render('admindashboard', { dailyOrders, dates, orderCounts, monthdata, totalOrderCount3 });
  
    } catch (error) {
      console.error('Error fetching and aggregating orders:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  getUserManagement: async (req, res) => {
    try {
      const users = await User.find();
      res.render("usermanagement", { users });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch user data. Please try again.");
    }
  },

  getCategoryManagement: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("categorymanagement", { categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch categories. Please try again.");
    }
  },

  getCouponManagement: async (req, res) => {
    try {
      const coupons = await Coupon.find();
      res.render("coupenmanagement", { coupons });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch coupons. Please try again.");
    }
  },

  getOfferManagement: async (req, res) => {
    try {
      const offers = await Offer.find();
      res.render("offermanagement", { offers });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch offers. Please try again.");
    }
  },

  getBlockUser: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id });
      user.isBlocked = !user.isBlocked;
      user.save();
      res.redirect("/admin/usermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to block user.");
    }
  },

  getCategory: async (req, res) => {
    try {
      res.render("addcategory");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get category edit page.");
    }
  },

  getCoupon: async (req, res) => {
    try {
      res.render("addcoupen");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get addcoupon page.");
    }
  },

  getOffer: async (req, res) => {
    try {
      const products = await Product.find()
      const categories = await Category.find()
      res.render("addoffer", { categories, products });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get addoffer page.");
    }
  },

  getDeleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      await Category.findByIdAndDelete(categoryId);
      res.redirect("/admin/categorymanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon.");
    }
  },

  getDeleteCoupon: async (req, res) => {
    try {
      const couponId = req.params.id;
      await Coupon.findByIdAndDelete(couponId);
      res.redirect("/admin/couponmanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon");
    }
  },

  getDeleteOffer: async (req, res) => {
    try {
      const offerId = req.params.id;
      await Offer.findByIdAndDelete(offerId);
      res.redirect("/admin/offermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete offer");
    }
  },

  getDeleteCoupon: async (req, res) => {
    try {
      const couponId = req.params.id;
      await Coupon.findByIdAndDelete(couponId);
      res.redirect("/admin/couponmanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon");
    }
  },

  getEditCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const category = await Category.findOne({ _id: id });
      res.render("editcategory", { category: category });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the category edit page.");
    }
  },

  getEditCoupon: async (req, res) => {
    try {
      const id = req.params.id;
      const coupon = await Coupon.findOne({ _id: id });
      res.render("editcoupon", { coupon: coupon });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the coupon edit page.");
    }
  },

  postEditCategory: async (req, res) => {
    const id = req.params.id;
    const categoryname = req.body.categoryname;
    try {
      await Category.updateOne(
        { _id: id },
        { $set: { category: categoryname } }
      );
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to edit category.");
    }
    res.redirect("/admin/categorymanagement");
  },

  postEditCoupen: async (req, res) => {
    const id = req.params.id;
    const { coupencode, discount, expiryDate, limit } = req.body;
    try {
      await Coupon.updateOne(
        { _id: id },
        { $set: { code: coupencode, discount: discount, expiryDate: expiryDate, limit: limit } }
      );
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to edit coupen.");
    }
    res.redirect("/admin/couponmanagement");
  },

  postCategory: async (req, res) => {
    const category = req.body.categoryname;
    const isthere = await Category.findOne({ category: category });
    if (isthere === null) {
      try {
        const newCategory = new Category({
          category: category,
        });
        newCategory.save();
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error inserting category");
      }
      res.redirect("/admin/categorymanagement");
    } else {
      res.render("addcategory", { message: "Category already exist!" });
    }
  },

  postCoupen: async (req, res) => {
    const { coupencode, discount, expiryDate, limit } = req.body;
    const isthere = await Coupon.findOne({ code: coupencode });
    if (isthere === null) {
      try {
        const newCoupen = new Coupon({
          code: coupencode,
          discount: discount,
          expiryDate: expiryDate,
          limit: limit,
        });
        newCoupen.save();
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error inserting coupon");
      }
      res.redirect("/admin/couponmanagement");
    } else {
      res.render("addcategory", { message: "Category already exist!" });
    }
  },

  postOffer: async (req, res) => {
    const { product, category, discount, expiryDate } = req.body;
    const isthere = await Offer.findOne({ $or: [ { applicableProduct: product }, { applicableCategorie: category } ] });
    if (isthere === null) {
      try {
        const newOffer = new Offer({
          applicableProduct: product,
          applicableCategorie: category,
          discount: discount,
          expiryDate: expiryDate,
          isActive: true,

        });
        newOffer.save();
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error inserting offer");
      }
      res.redirect("/admin/offermanagement");
    } else {
      const products = await Product.find()
      const categories = await Category.find()
      res.render("addoffer", { message: "Offer already exist!", products, categories });
    }
  },

  getUnlistProduct: async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    try {
      product.isListed = !product.isListed;
      product.save();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error changing product status");
    }
    res.redirect("/admin/productmanagement");
  },

  getGeneratePdf: async (req, res) => {
    try {
      const startingDate = new Date(req.query.startingdate);
      const endingDate = new Date(req.query.endingdate);
  
      // Fetch orders within the specified date range
      const orders = await Order.find({
        orderdate: { $gte: startingDate, $lte: new Date(endingDate.getTime() + 86400000) },
        "products.status": "Delivered",
      });
      let addressDetails
      for(let address of orders){
          addressDetails = await Address.findById(address.addressid);
        ;
      }
      console.log(orders)
      // Create a PDF document
      const doc = new PDFDocument();
      const filename = "sales_report.pdf";
  
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");
  
      doc.pipe(res);
  
      // Add content to the PDF document
      doc.text("Sales Report", { align: "center", fontSize: 10, margin: 2 });
  
      // Define the table data
      const tableData = {
        headers: [
          "Username",
          "Product Name",
          "Price",
          "Quantity",
          "Address",
          "City",
          "Pincode",
          "Phone",
        ],
        // rows: orders.map((order) => [
        //   order.user,
        //   order.products.map((product) => product.product).join(", "),
        //   order.products.map((product) => product.price).join(", "),
        //   order.products.map((product) => product.quantity).join(", "),
        //   addressDetails.address,
        //   addressDetails.city,
        //   addressDetails.pincode,
        //   addressDetails.phone,
        // ]),
        rows: orders.map(order => [
          order.user,
          order.products
            .filter(product => product.status === "Delivered")
            .map(product => product.product)
            .join(", "),
          order.products
            .filter(product => product.status === "Delivered")
            .map(product => product.price)
            .join(", "),
          order.products
            .filter(product => product.status === "Delivered")
            .map(product => product.quantity)
            .join(", "),
          addressDetails.address,
          addressDetails.city,
          addressDetails.pincode,
          addressDetails.phone,
        ]),

      };
  
      // Draw the table
      await doc.table(tableData, {
        prepareHeader: () => doc.font("Helvetica-Bold"),
        prepareRow: () => doc.font("Helvetica"),
      });
  
      // Finalize the PDF document
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  getExcelReprot: async (req, res) => {
    try {
      const startdate = new Date(req.query.startingdate);
      const Endingdate = new Date(req.query.endingdate);
      Endingdate.setDate(Endingdate.getDate() + 1);
  
      const orderCursor = await Order.aggregate([
        {
          $match: {
            orderdate: { $gte: startdate, $lte: Endingdate }
          }
        }
      ]);
      console.log(orderCursor)
  
      if (orderCursor.length === 0) {
        return res.redirect('/admin/salesreport');
      }
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
  
      // Add data to the worksheet
      worksheet.columns = [
        { header: 'Username', key: 'username', width: 15 },
        { header: 'Product Name', key: 'productname', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 15 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Order Date', key: 'orderdate', width: 18 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'City', key: 'city', width: 20 },      // Add City column
        { header: 'Pincode', key: 'pincode', width: 15 }, // Add Pincode column
        { header: 'Phone', key: 'phone', width: 15 }      // Add Phone column
      ];
  
      for (const orderItem of orderCursor) {
        const addressDetails = await Address.findById(orderItem.addressid);
      for (const product  of orderItem.products) {
        if (product.status === "Delivered") {
          worksheet.addRow({
            'username': orderItem.user,
            'productname': product.product,
            'quantity': product.quantity,
            'price': product.price,
            'status': product.status,
            'orderdate': orderItem.orderdate,
            'address': addressDetails ? addressDetails.address : 'N/A',
            'city': addressDetails ? addressDetails.city : 'N/A',
            'pincode': addressDetails ? addressDetails.pincode : 'N/A',
            'phone': addressDetails ? addressDetails.phone : 'N/A'
          });
        }
      }
    }
  
      // Generate the Excel file and send it as a response
      workbook.xlsx.writeBuffer().then((buffer) => {
        const excelBuffer = Buffer.from(buffer);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=excel.xlsx');
        res.send(excelBuffer);
      });
    } catch (error) {
      console.error('Error creating or sending Excel file:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  getDeleteImage: async (req, res) => {
    try {
      const id = req.body.productid;
      const index = req.body.index;
      const product = await Product.findById(id);
      product.image.splice(index, 1)
      await product.save()
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the coupon edit page.");
    }
  },

};
