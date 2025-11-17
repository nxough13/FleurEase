const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')

const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');
const category = require('./routes/category');

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit: "50mb", extended: true }));
// Configure CORS with specific options
const corsOptions = {
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);
app.use('/api/v1', category);

module.exports = app
