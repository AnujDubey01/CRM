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

router.post("/", authenticate, authorizeRoles(), createProduct);

router.get("/", authenticate, authorizeRoles("sales", "warehouse"), getProducts);
router.get("/low-stock",authenticate, authorizeRoles("sales", "warehouse"), getLowStockProducts);

router.get("/:id", authenticate, authorizeRoles("sales", "warehouse"), getProductById);

router.put("/:id", authenticate, authorizeRoles(), updateProduct);

router.delete("/:id", authenticate, authorizeRoles(), deleteProduct);

module.exports = router;
