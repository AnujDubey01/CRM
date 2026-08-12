const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { createCustomer , getCustomer , getCustomerById , updateCustomer, deleteCustomer } = require("../controllers/customer.controller");

const router = express.Router();

router.post("/",authenticate, authorizeRoles("sales"), createCustomer);
router.get("/", authenticate, authorizeRoles("sales"), getCustomer);
router.get("/:id", authenticate, authorizeRoles("sales"), getCustomerById);
router.put("/:id", authenticate, authorizeRoles("sales"), updateCustomer);
router.delete("/:id", authenticate, authorizeRoles("sales"), deleteCustomer);

module.exports = router;
