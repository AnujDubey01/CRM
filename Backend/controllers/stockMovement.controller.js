const Product = require("../models/product.model");
const StockMovement = require("../models/stockMovement.model");
const { withTransaction } = require("../utils/transaction");

const createHttpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const stockIn = async (req, res) => {
    try {
        const { id: productId } = req.params;

        const {
            quantity,
            reason
        } = req.body;

        // Validate quantity
        if (
            quantity === undefined ||
            quantity === null ||
            quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        const movement = await withTransaction(async (connection) => {
            const [products] = await connection.execute(
                `SELECT id, current_stock
                 FROM products
                 WHERE id = ?
                 FOR UPDATE`,
                [productId]
            );

            const product = products[0];

            if (!product) {
                throw createHttpError(404, "Product not found");
            }

            const newStock = product.current_stock + Number(quantity);

            await connection.execute(
                `UPDATE products
                 SET current_stock = ?
                 WHERE id = ?`,
                [newStock, productId]
            );

            const [result] = await connection.execute(
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
                    productId,
                    Number(quantity),
                    "IN",
                    reason || "Stock added",
                    req.user.id
                ]
            );

            return {
                stock: newStock,
                movementId: result.insertId
            };
        });

        return res.status(201).json({
            success: true,
            message: "Stock added successfully",
            stock: movement.stock,
            movementId: movement.movementId
        });

    } catch (error) {
        console.error("Stock IN error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "An error occurred while adding stock"
        });
    }
};

const stockOut = async (req, res) => {
    try {
        const { id: productId } = req.params;

        const {
            quantity,
            reason
        } = req.body;

        if (
            quantity === undefined ||
            quantity === null ||
            quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        const movement = await withTransaction(async (connection) => {
            const [products] = await connection.execute(
                `SELECT id, current_stock
                 FROM products
                 WHERE id = ?
                 FOR UPDATE`,
                [productId]
            );

            const product = products[0];

            if (!product) {
                throw createHttpError(404, "Product not found");
            }

            if (Number(quantity) > product.current_stock) {
                throw createHttpError(400, "Insufficient stock");
            }

            const newStock = product.current_stock - Number(quantity);

            await connection.execute(
                `UPDATE products
                 SET current_stock = ?
                 WHERE id = ?`,
                [newStock, productId]
            );

            const [result] = await connection.execute(
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
                    productId,
                    Number(quantity),
                    "OUT",
                    reason || "Stock removed",
                    req.user.id
                ]
            );

            return {
                stock: newStock,
                movementId: result.insertId
            };
        });

        return res.status(201).json({
            success: true,
            message: "Stock removed successfully",
            stock: movement.stock,
            movementId: movement.movementId
        });

    } catch (error) {
        console.error("Stock OUT error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "An error occurred while removing stock"
        });
    }
};

const getMovements = async (req, res) => {
    try {
        const { id: productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const movements =
            await StockMovement.findByProductId(productId);

        return res.status(200).json({
            success: true,
            movements
        });

    } catch (error) {
        console.error("Get movements error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching stock movements"
        });
    }
};

module.exports = {
    stockIn,
    stockOut,
    getMovements
};
