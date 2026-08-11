const express = require("express");

const authenticate = require("../middlewares/auth.middleware");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/product.controller");

const router = express.Router();

router.post("/", authenticate, createProduct);

router.get("/", authenticate, getProducts);

router.get("/:id", authenticate, getProductById);

router.put("/:id", authenticate, updateProduct);

router.delete("/:id", authenticate, deleteProduct);

module.exports = router;