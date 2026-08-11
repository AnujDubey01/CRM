const pool = require("../config/db");

const CustomerFollowup = {

    async create(data) {
        const {
            customer_id,
            note,
            follow_up_date,
            created_by
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO customer_followups
            (
                customer_id,
                note,
                follow_up_date,
                created_by
            )
            VALUES (?, ?, ?, ?)`,
            [
                customer_id,
                note,
                follow_up_date,
                created_by
            ]
        );

        return result.insertId;
    },

    async findById(id) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM customer_followups
             WHERE id = ?`,
            [id]
        );

        return rows[0];
    },

    async findByCustomerId(customerId) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM customer_followups
             WHERE customer_id = ?
             ORDER BY created_at DESC`,
            [customerId]
        );

        return rows;
    }
};

module.exports = CustomerFollowup;