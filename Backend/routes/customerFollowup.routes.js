const express = require("express");

const authenticate = require("../middlewares/auth.middleware");

const {
    createFollowup , getFollowups
} = require("../controllers/customerFollowup.controller");

const router = express.Router();

router.post(
    "/customers/:id/followups",
    authenticate,
    createFollowup
);

router.get(
    "/customers/:id/followups",
    authenticate,
    getFollowups
);

module.exports = router;