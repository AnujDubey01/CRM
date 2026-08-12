const express = require("express");

const authenticate = require("../middlewares/auth.middleware");

const {
    stockIn , stockOut , getMovements
} = require("../controllers/stockMovement.controller");

const router = express.Router();

router.post(
    "/products/:id/stock/in",
    authenticate,
    stockIn
);

router.post(
    "/products/:id/stock/out",
    authenticate,
    stockOut
);

router.get(
    "/products/:id/movements",
    authenticate,
    getMovements
);

module.exports = router;