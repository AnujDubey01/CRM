const Product = require("../models/product.model");
const StockMovement = require("../models/stockMovement.model");

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

        // Check product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Calculate new stock
        const newStock =
            product.current_stock + Number(quantity);

        // Update product stock
        await Product.updateStock(
            productId,
            newStock
        );

        // Record movement
        const movementId = await StockMovement.create({
            product_id: productId,
            quantity: Number(quantity),
            movement_type: "IN",
            reason: reason || "Stock added",
            created_by: req.user.id
        });

        const movement =
            await StockMovement.findById(movementId);

        return res.status(201).json({
            success: true,
            message: "Stock added successfully",
            stock: newStock,
            movement
        });

    } catch (error) {

        console.error("Stock IN error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while adding stock"
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

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Prevent negative stock
        if (Number(quantity) > product.current_stock) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        const newStock =
            product.current_stock - Number(quantity);

        // Update product stock
        await Product.updateStock(
            productId,
            newStock
        );

        // Record movement
        const movementId = await StockMovement.create({
            product_id: productId,
            quantity: Number(quantity),
            movement_type: "OUT",
            reason: reason || "Stock removed",
            created_by: req.user.id
        });

        const movement =
            await StockMovement.findById(movementId);

        return res.status(201).json({
            success: true,
            message: "Stock removed successfully",
            stock: newStock,
            movement
        });

    } catch (error) {
        console.error("Stock OUT error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while removing stock"
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