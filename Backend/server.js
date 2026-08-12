require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes =  require("./routes/auth.routes");
const customerRoutes =  require("./routes/customer.routes");
const customerFollowupRoutes = require("./routes/customerFollowup.routes");
const productRoutes = require("./routes/product.routes");
const stockMovementRoutes = require("./routes/stockMovement.routes");
const challanRoutes = require("./routes/challan.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

// Configure CORS to allow your frontend domains
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173', // Local Vite dev server
            'http://localhost:3000', // Alternative local dev port
            'http://127.0.0.1:5173', // Local Vite with 127.0.0.1
            process.env.FRONTEND_URL // Environment variable for production frontend
        ];
        
        // Allow all Vercel domains
        const isVercelDomain = origin.includes('.vercel.app');
        const isAllowedOrigin = allowedOrigins.includes(origin);
        
        if (isAllowedOrigin || isVercelDomain) {
            return callback(null, true);
        }
        
        // Log blocked origins for debugging
        console.log('CORS blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow cookies and auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin'
    ]
};

app.use(cors(corsOptions));

// Add debugging for CORS issues
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No Origin'}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CRM Backend API is running",
        version: "1.0.0"
    });
});

app.get("/db-test", async (req, res) => {
    try {
        const [result] = await pool.query("SELECT 1");

        res.json({
            success: true,
            message: "MySQL is working",
            result
        });
    } catch (error) {
        console.error("DB test error:", error);

        res.status(500).json({
            success: false,
            message: "MySQL connection failed",
        });
    }
});

app.use("/api/auth",authRoutes);
app.use("/api/customers",customerRoutes);
app.use("/api", customerFollowupRoutes);
app.use("/api/products", productRoutes);
app.use("/api", stockMovementRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
