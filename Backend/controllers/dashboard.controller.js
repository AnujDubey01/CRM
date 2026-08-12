const Dashboard = require("../models/dashboard.model");

const getDashboard = async (req, res) => {
    try {
        const data = await Dashboard.getMetrics();

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Dashboard metrics error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching dashboard metrics"
        });
    }
};

const getDashboardLowStock = async (req, res) => {
    try {
        const data = await Dashboard.getLowStockProducts();

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Dashboard low stock error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching low-stock products"
        });
    }
};

module.exports = {
    getDashboard,
    getDashboardLowStock
};
