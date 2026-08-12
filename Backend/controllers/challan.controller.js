const Challan = require("../models/challan.model");
const Customer = require("../models/customer.model");
const { withTransaction } = require("../utils/transaction");

const VALID_STATUSES = ["draft", "confirmed", "cancelled"];

const createHttpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const parsePositiveInteger = (value) => {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        return null;
    }

    return parsedValue;
};

const validateItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw createHttpError(
            400,
            "Items must be a non-empty array"
        );
    }

    const productIds = new Set();

    return items.map((item, index) => {
        const productId = parsePositiveInteger(item.product_id);
        const quantity = parsePositiveInteger(item.quantity);

        if (!productId) {
            throw createHttpError(
                400,
                `Item ${index + 1} has an invalid product_id`
            );
        }

        if (!quantity) {
            throw createHttpError(
                400,
                `Item ${index + 1} must have quantity greater than 0`
            );
        }

        if (productIds.has(productId)) {
            throw createHttpError(
                409,
                `Duplicate product ${productId} in challan items`
            );
        }

        productIds.add(productId);

        return {
            product_id: productId,
            quantity
        };
    });
};

const createChallan = async (req, res) => {
    try {
        const customerId = parsePositiveInteger(req.body.customer_id);

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "Valid customer_id is required"
            });
        }

        const items = validateItems(req.body.items);
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const productIds = items.map((item) => item.product_id);
        const products = await Challan.getProductSnapshots(productIds);
        const productMap = new Map(
            products.map((product) => [product.id, product])
        );

        for (const item of items) {
            const product = productMap.get(item.product_id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.product_id} not found`
                });
            }
        }

        const challanDraft = await withTransaction(async (connection) => {
            return Challan.createDraft(
                {
                    customerId,
                    createdBy: req.user.id,
                    items: items.map((item) => {
                        const product = productMap.get(item.product_id);

                        return {
                            product_id: item.product_id,
                            quantity: item.quantity,
                            product_name: product.name,
                            sku: product.sku,
                            unit_price: product.unit_price
                        };
                    })
                },
                connection
            );
        });

        const challan = await Challan.findDetailedById(challanDraft.id);

        return res.status(201).json({
            success: true,
            message: "Challan draft created successfully",
            data: challan
        });
    } catch (error) {
        console.error("Create challan error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "An error occurred while creating challan"
        });
    }
};

const listChallans = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 10, 1),
            100
        );
        const customerId = req.query.customer_id
            ? parsePositiveInteger(req.query.customer_id)
            : null;

        if (req.query.customer_id && !customerId) {
            return res.status(400).json({
                success: false,
                message: "customer_id must be a positive integer"
            });
        }

        if (
            req.query.status &&
            !VALID_STATUSES.includes(req.query.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan status"
            });
        }

        const result = await Challan.list({
            search: req.query.search || "",
            status: req.query.status || null,
            customerId,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                total: result.total
            }
        });
    } catch (error) {
        console.error("List challans error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching challans"
        });
    }
};

const getChallanById = async (req, res) => {
    try {
        const challanId = parsePositiveInteger(req.params.id);

        if (!challanId) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan id"
            });
        }

        const challan = await Challan.findDetailedById(challanId);

        if (!challan) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: challan
        });
    } catch (error) {
        console.error("Get challan detail error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching challan"
        });
    }
};

const confirmChallan = async (req, res) => {
    try {
        const challanId = parsePositiveInteger(req.params.id);

        if (!challanId) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan id"
            });
        }

        await withTransaction(async (connection) => {
            const challan = await Challan.findById(
                challanId,
                connection,
                true
            );

            if (!challan) {
                throw createHttpError(404, "Challan not found");
            }

            if (challan.status !== "draft") {
                throw createHttpError(
                    409,
                    "Only draft challans can be confirmed"
                );
            }

            const items = await Challan.findItemsByChallanId(
                challanId,
                connection,
                true
            );

            if (items.length === 0) {
                throw createHttpError(
                    409,
                    "Challan has no items to confirm"
                );
            }

            await Challan.confirm(challan, items, req.user.id, connection);
        });

        const challan = await Challan.findDetailedById(challanId);

        return res.status(200).json({
            success: true,
            message: "Challan confirmed successfully",
            data: challan
        });
    } catch (error) {
        console.error("Confirm challan error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "An error occurred while confirming challan"
        });
    }
};

const cancelChallan = async (req, res) => {
    try {
        const challanId = parsePositiveInteger(req.params.id);

        if (!challanId) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan id"
            });
        }

        await withTransaction(async (connection) => {
            const challan = await Challan.findById(
                challanId,
                connection,
                true
            );

            if (!challan) {
                throw createHttpError(404, "Challan not found");
            }

            if (challan.status === "cancelled") {
                throw createHttpError(
                    409,
                    "Challan is already cancelled"
                );
            }

            if (challan.status === "confirmed") {
                throw createHttpError(
                    409,
                    "Confirmed challans cannot be cancelled automatically because stock reversal is not defined in the current schema"
                );
            }

            await Challan.updateStatus(challanId, "cancelled", connection);
        });

        const challan = await Challan.findDetailedById(challanId);

        return res.status(200).json({
            success: true,
            message: "Challan cancelled successfully",
            data: challan
        });
    } catch (error) {
        console.error("Cancel challan error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "An error occurred while cancelling challan"
        });
    }
};

module.exports = {
    createChallan,
    listChallans,
    getChallanById,
    confirmChallan,
    cancelChallan
};
