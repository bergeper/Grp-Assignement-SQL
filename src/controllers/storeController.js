const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");
const { user } = require("../data/users");
const { stores } = require("../data/stores");
const { sequelize } = require("../database/config");
const { UnauthorizedError } = require("../utils/errors");

exports.getAllStores = async (req, res) => {
  const city = req.query.city;

  console.log(city);

  if (!city) {
    const [stores, metadata] = await sequelize.query(`
  SELECT * FROM stores s 
  `);
    console.log(stores);
    //  return res.send("här");
    return res.json(stores);
  } else {
    const formattedCity = city.trim();

    const [results] = await sequelize.query(
      `SELECT s.store_id, s.store_name, c.city_name
      FROM stores s 
      LEFT JOIN cities c ON c.city_id = s.store_fk_city_id 
      WHERE c.city_name = $city;`,
      {
        bind: { city: formattedCity },
      }
    );
    console.log("======> results här" + results);

    return res.json(results);
  }
};

exports.getStoreById = async (req, res) => {
  const storeId = req.params.storeId;

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
    throw new NotFoundError(
      "We could not find the list you are looking for"
    );
  }

  return res.json(results);
};

exports.updateStoreById = (req, res) => res.send("updateStoreById");

exports.deleteStore = async (req, res) => {
  const storeId = req.params.storeId;

  const [store, storeMeta] = await sequelize.query(
    `
  SELECT * FROM stores
  WHERE store_id = $storeId  
  `,
    {
      bind: { storeId: storeId },
    }
  );

  const userId = store[0].store_createdBy_fk_user_id;

  if (req.user.role == userRoles.ADMIN || req.user.userId == userId) {
    console.log("true");
  } else {
    return res
      .status(403)
      .json("You are not authorized to delete this store");
  }

  return res.send(store);
};
