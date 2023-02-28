const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
} = require("../middleware/authenticationMiddleware");
const {
  getAllStores,
  getStoreById,
  createNewStore,
  deleteStoreById,
  updateStoreById,
} = require("../controllers/storeController");

router.get("/", isAuthenticated, getAllStores);
router.get("/:storeId", isAuthenticated, getStoreById);
router.post("/", isAuthenticated, createNewStore);
router.put("/:storeId", isAuthenticated, updateStoreById);
router.delete("/:storeId", isAuthenticated, deleteStoreById);

module.exports = router;
