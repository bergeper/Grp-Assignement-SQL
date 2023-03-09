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

const {storeSchema} = require("../middleware/validation/validationSchemas")

const { validate } = require("../middleware/validation/validationMiddleware");

router.get("/", getAllStores);
router.get("/:storeId", getStoreById);
router.post("/", validate(storeSchema), isAuthenticated, createNewStore);
router.put("/:storeId", validate(storeSchema), isAuthenticated, updateStoreById);
router.delete("/:storeId", isAuthenticated, deleteStore);

module.exports = router;
