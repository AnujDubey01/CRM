const pool = require("../config/db");

const Dashboard = {
    async getMetrics() {
        const [counts] = await pool.execute(
            `SELECT
                (SELECT COUNT(*) FROM customers) AS totalCustomers,
                (SELECT COUNT(*) FROM products) AS totalProducts,
                (
                    SELECT COUNT(*)
                    FROM products
                    WHERE current_stock <= minimum_stock
                ) AS lowStockProducts,
                (
                    SELECT COUNT(*)
                    FROM sales_challans
                    WHERE status = 'confirmed'
                    AND YEAR(created_at) = YEAR(CURRENT_DATE())
                    AND MONTH(created_at) = MONTH(CURRENT_DATE())
                ) AS monthlyChallans`
        );

        return counts[0];
    },

    async getLowStockProducts() {
        const [rows] = await pool.execute(
            `SELECT
                id,
                name,
                sku,
                current_stock,
                minimum_stock,
                warehouse
             FROM products
             WHERE current_stock <= minimum_stock
             ORDER BY current_stock ASC, name ASC`
        );

        return rows;
    }
};

module.exports = Dashboard;
