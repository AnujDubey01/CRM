const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
    createChallan,
    listChallans,
    getChallanById,
    confirmChallan,
    cancelChallan
} = require("../controllers/challan.controller");

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorizeRoles("sales"),
    createChallan
);

router.get(
    "/",
    authenticate,
    authorizeRoles("sales"),
    listChallans
);

router.get(
    "/:id",
    authenticate,
    authorizeRoles("sales"),
    getChallanById
);

router.post(
    "/:id/confirm",
    authenticate,
    authorizeRoles("sales"),
    confirmChallan
);

router.post(
    "/:id/cancel",
    authenticate,
    authorizeRoles("sales"),
    cancelChallan
);

module.exports = router;
