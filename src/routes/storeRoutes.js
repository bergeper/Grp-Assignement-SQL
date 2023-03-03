const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
} = require("../middleware/authenticationMiddleware");
const {
  getAllStores,
  getStoreById,
  createNewStore,
  deleteStore,
  updateStoreById,
} = require("../controllers/storeController");

router.get("/", getAllStores);
router.get("/:storeId", getStoreById);
// router.post("/", createNewStore);
// router.put("/:storeId", updateStoreById);
router.delete("/:storeId", isAuthenticated, deleteStore);

module.exports = router;
