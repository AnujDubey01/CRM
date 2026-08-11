const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const { createCustomer , getCustomer , getCustomerById , updateCustomer, deleteCustomer } = require("../controllers/customer.controller");

const router = express.Router();

router.post("/",authenticate , createCustomer);
router.get("/", authenticate, getCustomer);
router.get("/:id", authenticate, getCustomerById);
router.put("/:id", authenticate, updateCustomer);
router.delete("/:id", authenticate, deleteCustomer);

module.exports = router;