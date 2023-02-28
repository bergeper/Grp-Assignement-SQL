const { user } = require("../data/users");
const router = express.Router();
const {
  getUserById,
  deleteUserById,
  getAllUsers,
} = require("../controllers/userControllers");

router.get(
  "/",
  isAuthenticated,
  authorizeRoles(user.ADMIN),
  getAllUsers
);
router.get("/:userId", isAuthenticated, getUserById);
router.delete("/:userId", isAuthenticated, deleteUserById);

module.exports = router;
