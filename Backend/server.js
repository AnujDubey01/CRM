require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes =  require("./routes/auth.routes");
const customerRoutes =  require("./routes/customer.routes");
const customerFollowupRoutes = require("./routes/customerFollowup.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/db-test", async (req, res) => {
    try {
        const [result] = await pool.query("SELECT 1");

        res.json({
            success: true,
            message: "MySQL is working",
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "MySQL connection failed",
            error: error.message
        });
    }
});

app.use("/api/auth",authRoutes);
app.use("/api/customers",customerRoutes);
app.use("/api", customerFollowupRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
