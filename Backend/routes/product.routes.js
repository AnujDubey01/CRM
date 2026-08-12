const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct ,
    getLowStockProducts
} = require("../controllers/product.controller");

const router = express.Router();

router.post("/", authenticate, authorizeRoles("sales"), createProduct);

router.get("/", authenticate, authorizeRoles("sales", "warehouse", "accounts"), getProducts);
router.get("/low-stock",authenticate, authorizeRoles("sales", "warehouse", "accounts"), getLowStockProducts);

router.get("/:id", authenticate, authorizeRoles("sales", "warehouse", "accounts"), getProductById);

router.put("/:id", authenticate, authorizeRoles("sales"), updateProduct);

router.delete("/:id", authenticate, authorizeRoles(), deleteProduct);

module.exports = router;
