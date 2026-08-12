const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
    createFollowup , getFollowups
} = require("../controllers/customerFollowup.controller");

const router = express.Router();

router.post(
    "/customers/:id/followups",
    authenticate,
    authorizeRoles("sales"),
    createFollowup
);

router.get(
    "/customers/:id/followups",
    authenticate,
    authorizeRoles("sales"),
    getFollowups
);

module.exports = router;
