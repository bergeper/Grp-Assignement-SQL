const { user } = require("../data/users");
const express = require("express");
const router = express.Router();
const {
  getUserById,
  deleteUserById,
  getAllUsers,
} = require("../controllers/userController");

router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.delete("/:userId", deleteUserById);

module.exports = router;
