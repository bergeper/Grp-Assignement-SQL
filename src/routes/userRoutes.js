const express = require("express");
const { userRoles } = require("../constants/users");
const router = express.Router();
const {
  getUserById,
  deleteUserById,
  getAllUsers,
  updateUserById,
} = require("../controllers/userController");
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middleware/authenticationMiddleware");
const {
  validate,
} = require("../middleware/validation/validationMiddleware");
const {
  updateUserSchema,
} = require("../middleware/validation/updateUserSchemas");

router.get(
  "/",
  isAuthenticated,
  authorizeRoles(userRoles.ADMIN),
  getAllUsers
);
router.get("/:userId", isAuthenticated, getUserById);
router.delete("/:userId", isAuthenticated, deleteUserById);
router.put(
  "/:userId",
  validate(updateUserSchema),
  isAuthenticated,
  updateUserById
);

module.exports = router;
