const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
    getDashboard,
    getDashboardLowStock
} = require("../controllers/dashboard.controller");

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorizeRoles("sales", "warehouse", "accounts"),
    getDashboard
);

router.get(
    "/low-stock",
    authenticate,
    authorizeRoles("sales", "warehouse", "accounts"),
    getDashboardLowStock
);

module.exports = router;
