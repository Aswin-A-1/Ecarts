const express = require('express')
const app = express()
const path = require('path')
const morgan=require('morgan')
const mongoose = require('mongoose')
const userRoute = require('./routes/user')
const adminRoute = require('./routes/admin')
const cartRoute = require('./routes/cart')
const session = require("express-session")
const crypto = require('crypto')
const mongoURI = 'mongodb://127.0.0.1:27017/ecartdb'
const secret = crypto.randomBytes(32).toString('hex')
app.use(
    session({
      secret: secret,
      resave: false,
      saveUninitialized: true,
    })
)
app.use(morgan('tiny'))
//mongodb connection
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Set EJS as the view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//Static files
app.use('/static', express.static(path.join(__dirname, 'public')))

// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: false }))


app.use('/', userRoute)
app.use('/admin', adminRoute)
app.use('/cart', cartRoute)


app.listen(3000, () => {
    console.log('app running on port: 3000')
})