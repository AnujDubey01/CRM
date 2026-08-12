const Product = require("../models/product.model");

const createProduct = async (req, res) => {
    try {

        console.log("PRODUCT BODY:", req.body);

        const {
            name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse
        } = req.body;

        console.log("VALUES:", {
            name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse
        });

        if (
            name === undefined ||
            sku === undefined ||
            category === undefined ||
            unit_price === undefined ||
            current_stock === undefined ||
            minimum_stock === undefined ||
            warehouse === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All product fields are required"
            });
        }

        if (
            unit_price < 0 ||
            current_stock < 0 ||
            minimum_stock < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Values cannot be negative"
            });
        }

        const productId = await Product.create({
            name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse
        });

        const product = await Product.findById(productId);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {

        console.error("Create product error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const search = req.query.search || "";

        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            parseInt(req.query.limit) || 10,
            100
        );

        const offset = (page - 1) * limit;

        const products = await Product.findAll(
            search,
            limit,
            offset
        );

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                page,
                limit,
                total: products.length
            }
        });

    } catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching products"
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Get product error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching product"
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await Product.findById(id);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await Product.update(id, req.body);

        const product = await Product.findById(id);

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        console.error("Update product error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while updating product"
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await Product.findById(id);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await Product.delete(id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting product"
        });
    }
};

const getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.findLowStock();

        return res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        console.error("Low stock error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching low-stock products"
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getLowStockProducts
};