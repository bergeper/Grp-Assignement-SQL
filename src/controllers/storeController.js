const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");
const { user } = require("../data/users");
const { stores } = require("../data/stores");
const { sequelize } = require("../database/config");
const { UnauthorizedError } = require("../utils/errors");

exports.getAllStores = async (req, res) => {
  const [stores, metadata] = await sequelize.query(`
  SELECT * FROM stores s 
  `);
  console.log(stores);
  //  return res.send("här");
  return res.json(stores);
};

exports.getStoreById = async (req, res) => {
  const storeId = req.params.storeId;

  console.log("==========>" + storeId);

  const [results, metadata] = await sequelize.query(
    `
  SELECT store_id, store_name FROM stores s 
  WHERE store_id = $storeId
  `,
    {
      bind: { storeId: storeId },
    }
  );

  console.log("=================>" + results);

  if (!results || results.length == 0) {
    throw new NotFoundError("We could not find the list you are looking for");
  }

  return res.json(results);
};

exports.updateStoreById = (req, res) => res.send("updateStoreById");
exports.deleteStoreById = (req, res) => res.send("deleteStoreById");
