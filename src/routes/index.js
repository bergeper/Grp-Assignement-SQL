const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const storeRoutes = require("./storeRoutes");
const reviewRoutes = require("./reviewRoutes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/stores", storeRoutes);
router.use("/reviews", reviewRoutes);

module.exports = router;
