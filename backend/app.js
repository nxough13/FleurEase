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
const allowedOrigins = [
    'http://localhost:5173',
    'https://fleur-ease.vercel.app',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        // Allow any vercel.app preview URL for this project
        if (allowedOrigins.includes(origin) || /https:\/\/fleur-ease.*\.vercel\.app$/.test(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
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
