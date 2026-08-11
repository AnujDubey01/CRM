const pool = require("../config/db");

const Customer = {

    async create(data) {
        const {
            name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO customers
            (
                name,
                mobile,
                email,
                business_name,
                gst_number,
                customer_type,
                address,
                status,
                follow_up_date,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                mobile,
                email,
                business_name,
                gst_number,
                customer_type,
                address,
                status,
                follow_up_date,
                notes
            ]
        );

        return result.insertId;
    },

    // getOne
    async findById(id) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM customers
             WHERE id = ?`,
            [id]
        );

        return rows[0];
    },

    // getAll
    async findAll(search, limit, offset) {
    let query = `SELECT * FROM customers`;
    const params = [];

    if (search) {
        query += `
            WHERE name LIKE ?
            OR mobile LIKE ?
            OR email LIKE ?
            OR business_name LIKE ?
        `;

        const searchValue = `%${search}%`;

        params.push(
            searchValue,
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
        mobile,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes
    } = data;

    const [result] = await pool.execute(
        `UPDATE customers
         SET
            name = ?,
            mobile = ?,
            email = ?,
            business_name = ?,
            gst_number = ?,
            customer_type = ?,
            address = ?,
            status = ?,
            follow_up_date = ?,
            notes = ?
         WHERE id = ?`,
        [
            name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes,
            id
        ]
    )

        return result;
    },

    async delete(id) {
    const [result] = await pool.execute(
        `DELETE FROM customers
         WHERE id = ?`,
        [id]
    );

    return result;
}
};

module.exports = Customer;