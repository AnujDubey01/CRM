const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const { createCustomer , getCustomer , getCustomerById } = require("../controllers/customer.controller");

const router = express.Router();

router.post("/",authenticate , createCustomer);
router.get("/", authenticate, getCustomer);
router.get("/:id", authenticate, getCustomerById);

module.exports = router;