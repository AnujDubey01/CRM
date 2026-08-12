const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
    stockIn , stockOut , getMovements
} = require("../controllers/stockMovement.controller");

const router = express.Router();

router.post(
    "/products/:id/stock/in",
    authenticate,
    authorizeRoles("warehouse"),
    stockIn
);

router.post(
    "/products/:id/stock/out",
    authenticate,
    authorizeRoles("warehouse"),
    stockOut
);

router.get(
    "/products/:id/movements",
    authenticate,
    authorizeRoles("warehouse"),
    getMovements
);

module.exports = router;
