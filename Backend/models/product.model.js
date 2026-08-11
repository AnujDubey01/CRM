const pool = require("../config/db");

const Product = {
    
    async create(data) {
        const {
            name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO products
            (
                name,
                sku,
                category,
                unit_price,
                current_stock,
                minimum_stock,
                warehouse
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                sku,
                category,
                unit_price,
                current_stock,
                minimum_stock,
                warehouse
            ]
        );

        return result.insertId;
    },

    async findById(id) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM products
             WHERE id = ?`,
            [id]
        );

        return rows[0];
    },

    async findAll(search, limit, offset) {
        let query = `
            SELECT *
            FROM products
        `;

        const params = [];

        if (search) {
            query += `
                WHERE name LIKE ?
                OR sku LIKE ?
                OR category LIKE ?
            `;

            const searchValue = `%${search}%`;

            params.push(
                searchValue,
                searchValue,
                searchValue
            );
        }

        query += `
            ORDER BY created_at DESC
            LIMIT ${Number(limit)}
            OFFSET ${Number(offset)}
        `;

        const [rows] = await pool.execute(query, params);

        return rows;
    },

    async update(id, data) {
        const {
            name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse
        } = data;

        const [result] = await pool.execute(
            `UPDATE products
             SET
                name = ?,
                sku = ?,
                category = ?,
                unit_price = ?,
                current_stock = ?,
                minimum_stock = ?,
                warehouse = ?
             WHERE id = ?`,
            [
                name,
                sku,
                category,
                unit_price,
                current_stock,
                minimum_stock,
                warehouse,
                id
            ]
        );

        return result;
    },

    async delete(id) {
        const [result] = await pool.execute(
            `DELETE FROM products
             WHERE id = ?`,
            [id]
        );

        return result;
    }
};

module.exports = Product;