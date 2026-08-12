const pool = require("../config/db");

const StockMovement = {

    async create(data) {
        const {
            product_id,
            quantity,
            movement_type,
            reason,
            created_by
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO stock_movements
            (
                product_id,
                quantity,
                movement_type,
                reason,
                created_by
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                product_id,
                quantity,
                movement_type,
                reason,
                created_by
            ]
        );

        return result.insertId;
    },

    async findByProductId(productId) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM stock_movements
             WHERE product_id = ?
             ORDER BY created_at DESC`,
            [productId]
        );

        return rows;
    },

    async findById(id) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM stock_movements
             WHERE id = ?`,
            [id]
        );

        return rows[0];
    }
};

module.exports = StockMovement;