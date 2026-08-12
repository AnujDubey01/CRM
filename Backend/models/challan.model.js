const pool = require("../config/db");

const buildPagination = (page, limit) => ({
    page,
    limit,
    offset: (page - 1) * limit
});

const Challan = {
    async createDraft({ customerId, items, createdBy }, connection) {
        const db = connection || pool;
        const totalQuantity = items.reduce(
            (sum, item) => sum + Number(item.quantity),
            0
        );

        const tempNumber = `TMP-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

        const [challanResult] = await db.execute(
            `INSERT INTO sales_challans
            (
                challan_number,
                customer_id,
                total_quantity,
                status,
                created_by
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                tempNumber,
                customerId,
                totalQuantity,
                "draft",
                createdBy
            ]
        );

        const challanId = challanResult.insertId;
        const challanNumber = `CH-${String(challanId).padStart(6, "0")}`;

        await db.execute(
            `UPDATE sales_challans
             SET challan_number = ?
             WHERE id = ?`,
            [challanNumber, challanId]
        );

        for (const item of items) {
            await db.execute(
                `INSERT INTO challan_items
                (
                    challan_id,
                    product_id,
                    product_name,
                    sku,
                    quantity,
                    unit_price
                )
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    challanId,
                    item.product_id,
                    item.product_name,
                    item.sku,
                    item.quantity,
                    item.unit_price
                ]
            );
        }

        return {
            id: challanId,
            challan_number: challanNumber
        };
    },

    async findById(id, connection, lockForUpdate = false) {
        const db = connection || pool;
        const lockClause = lockForUpdate ? " FOR UPDATE" : "";
        const [rows] = await db.execute(
            `SELECT *
             FROM sales_challans
             WHERE id = ?${lockClause}`,
            [id]
        );

        return rows[0];
    },

    async findItemsByChallanId(challanId, connection, lockForUpdate = false) {
        const db = connection || pool;
        const lockClause = lockForUpdate ? " FOR UPDATE" : "";
        const [rows] = await db.execute(
            `SELECT *
             FROM challan_items
             WHERE challan_id = ?
             ORDER BY id ASC${lockClause}`,
            [challanId]
        );

        return rows;
    },

    async getProductSnapshots(productIds, connection) {
        const db = connection || pool;
        const placeholders = productIds.map(() => "?").join(", ");
        const [rows] = await db.execute(
            `SELECT id, name, sku, unit_price, current_stock
             FROM products
             WHERE id IN (${placeholders})`,
            productIds
        );

        return rows;
    },

    async getProductsForUpdate(productIds, connection) {
        const placeholders = productIds.map(() => "?").join(", ");
        const [rows] = await connection.execute(
            `SELECT id, name, sku, unit_price, current_stock
             FROM products
             WHERE id IN (${placeholders})
             ORDER BY id ASC
             FOR UPDATE`,
            productIds
        );

        return rows;
    },

    async updateStatus(id, status, connection) {
        const db = connection || pool;
        const [result] = await db.execute(
            `UPDATE sales_challans
             SET status = ?
             WHERE id = ?`,
            [status, id]
        );

        return result;
    },

    async confirm(challan, items, userId, connection) {
        const productIds = items.map((item) => item.product_id);
        const products = await this.getProductsForUpdate(
            productIds,
            connection
        );

        const productMap = new Map(
            products.map((product) => [product.id, product])
        );

        for (const item of items) {
            const product = productMap.get(item.product_id);

            if (!product) {
                const error = new Error(
                    `Product ${item.product_name} no longer exists`
                );
                error.statusCode = 404;
                throw error;
            }

            if (product.current_stock < item.quantity) {
                const error = new Error(
                    `Insufficient stock for product ${item.product_name}`
                );
                error.statusCode = 400;
                throw error;
            }
        }

        for (const item of items) {
            const product = productMap.get(item.product_id);
            const newStock = product.current_stock - item.quantity;

            await connection.execute(
                `UPDATE products
                 SET current_stock = ?
                 WHERE id = ?`,
                [newStock, item.product_id]
            );

            await connection.execute(
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
                    item.product_id,
                    item.quantity,
                    "OUT",
                    `Sales Challan ${challan.challan_number}`,
                    userId
                ]
            );
        }

        await this.updateStatus(challan.id, "confirmed", connection);
    },

    async list(filters) {
        const {
            search = "",
            status,
            customerId,
            page = 1,
            limit = 10
        } = filters;
        const { offset } = buildPagination(page, limit);
        const whereClauses = [];
        const params = [];

        if (search) {
            whereClauses.push(
                "(sc.challan_number LIKE ? OR c.name LIKE ?)"
            );
            const searchValue = `%${search}%`;
            params.push(searchValue, searchValue);
        }

        if (status) {
            whereClauses.push("sc.status = ?");
            params.push(status);
        }

        if (customerId) {
            whereClauses.push("sc.customer_id = ?");
            params.push(customerId);
        }

        const whereSql = whereClauses.length
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";

        const safeLimit = Number(limit);
        const safeOffset = Number(offset);

        const [rows] = await pool.execute(
            `SELECT
                sc.id,
                sc.challan_number,
                sc.customer_id,
                sc.total_quantity,
                sc.status,
                sc.created_by,
                sc.created_at,
                c.name AS customer_name,
                COALESCE(SUM(ci.quantity * ci.unit_price), 0) AS total_amount
             FROM sales_challans sc
             INNER JOIN customers c ON c.id = sc.customer_id
             LEFT JOIN challan_items ci ON ci.challan_id = sc.id
             ${whereSql}
             GROUP BY
                sc.id,
                sc.challan_number,
                sc.customer_id,
                sc.total_quantity,
                sc.status,
                sc.created_by,
                sc.created_at,
                c.name
             ORDER BY sc.created_at DESC
             LIMIT ${safeLimit}
             OFFSET ${safeOffset}`,
            params
        );

        const [countRows] = await pool.execute(
            `SELECT COUNT(*) AS total
             FROM sales_challans sc
             INNER JOIN customers c ON c.id = sc.customer_id
             ${whereSql}`,
            params
        );

        return {
            rows,
            total: countRows[0].total
        };
    },

    async findDetailedById(id) {
        const [challanRows] = await pool.execute(
            `SELECT
                sc.id,
                sc.challan_number,
                sc.customer_id,
                sc.total_quantity,
                sc.status,
                sc.created_by,
                sc.created_at,
                c.name AS customer_name,
                c.mobile AS customer_mobile,
                c.email AS customer_email,
                c.business_name AS customer_business_name,
                c.address AS customer_address,
                u.name AS created_by_name,
                u.role AS created_by_role
             FROM sales_challans sc
             INNER JOIN customers c ON c.id = sc.customer_id
             INNER JOIN users u ON u.id = sc.created_by
             WHERE sc.id = ?`,
            [id]
        );

        const challan = challanRows[0];

        if (!challan) {
            return null;
        }

        const [items] = await pool.execute(
            `SELECT
                id,
                challan_id,
                product_id,
                product_name,
                sku,
                quantity,
                unit_price,
                quantity * unit_price AS line_total
             FROM challan_items
             WHERE challan_id = ?
             ORDER BY id ASC`,
            [id]
        );

        const totalAmount = items.reduce(
            (sum, item) => sum + Number(item.line_total),
            0
        );

        return {
            challan,
            items,
            totals: {
                totalQuantity: challan.total_quantity,
                totalAmount
            }
        };
    }
};

module.exports = Challan;
