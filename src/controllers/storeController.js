const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");
const { sequelize } = require("../database/config");
const {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} = require("../utils/errors");

exports.getAllStores = async (req, res) => {
  const city = req.query.city;
  const limit = req.query?.limit || 10;
  const offset = req.query?.offset || 0;

  if (!city) {
    const [store, metadata] = await sequelize.query(
      `
    SELECT * FROM store s ORDER BY store_name ASC LIMIT $limit OFFSET $offset
    `,
      {
        bind: { limit: limit, offset: offset },
      }
    );
    if (store.length < 0) {
      throw new NotFoundError("sorry, we can't find any stores😢");
    }
    return res.json(store);
  } else {
    const formattedCity =
      city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    const [results] = await sequelize.query(
      `SELECT *
      FROM store s 
      LEFT JOIN city c ON c.city_id = s.store_fk_city_id 
      WHERE c.city_name = $city
      LIMIT $limit
      OFFSET $offset;`,
      {
        bind: { city: formattedCity, limit: limit, offset: offset },
      }
    );
    if (results.length < 0) {
      throw new NotFoundError(
        "sorry, we can't find any stores listed in that city😢"
      );
    }

    return res.json(results);
  }
};

exports.getStoreById = async (req, res) => {
  const storeId = req.params.storeId;

  const [store] = await sequelize.query(
    `
    SELECT store_id, store_name, AVG(IFNULL(review_rating, 0)) AS rating
    FROM store s
    LEFT JOIN review r ON s.store_id = r.fk_store_id
    WHERE store_id = $storeId
    `,
    {
      bind: { storeId: storeId },
      type: QueryTypes.SELECT,
    }
  );

  if (!store.store_id) {
    throw new NotFoundError(
      "We could'nt find the store you are looking for.😢"
    );
  }
  const reviews = await sequelize.query(
    `
  SELECT r.review_id, r.review_title, r.review_description, r.review_rating, u.username
  FROM review r
  JOIN user u ON s.store_id = r.fk_store_id
  JOIN store s ON u.user_id = r.fk_user_id
  WHERE s.store_id = $storeId
  `,
    {
      bind: {
        storeId: storeId,
      },
      type: QueryTypes.SELECT,
    }
  );

  const response = {
    store: store,
    reviews: reviews,
  };
  return res.json(response);
};

exports.deleteStore = async (req, res) => {
  const storeId = req.params.storeId;

  const [store, storeMeta] = await sequelize.query(
    `
  SELECT * FROM store
  WHERE store_id = $storeId  
  `,
    {
      bind: { storeId: storeId },
    }
  );

  if (store.length <= 0) throw new BadRequestError("Store does not exists");

  const userId = store[0].store_createdBy_fk_user_id;

  if (req.user.role == userRoles.ADMIN || req.user.userId == userId) {
    await sequelize.query(`DELETE FROM review WHERE fk_store_id = $storeId`, {
      bind: { storeId: storeId },
    });
    await sequelize.query(`DELETE FROM store WHERE store_Id = $storeId`, {
      bind: { storeId: storeId },
    });
    return res.sendStatus(204);
  } else {
    throw new UnauthorizedError(
      "You are not authorized to delete this store ⚠️"
    );
  }
};
exports.createNewStore = async (req, res) => {
  const {
    store_name,
    store_description,
    store_adress,
    store_zipcode,
    store_city,
  } = req.body;
  const userId = req.user.userId;
  let cityId;

  const [exists] = await sequelize.query(
    `
    SELECT s.store_name, s.store_id, c.city_name, c.city_id
    FROM city c
    LEFT JOIN store s ON s.store_name = $store_name AND s.store_fk_city_id = c.city_id 
    WHERE c.city_name = $store_city 
    `,
    {
      bind: {
        store_name: store_name,
        store_city: store_city,
      },
      type: QueryTypes.SELECT,
    }
  );
  console.log(exists);

  if (!exists) {
    const [newCityId] = await sequelize.query(
      `
      INSERT INTO city (city_name) VALUES ($store_city);
      `,
      {
        bind: {
          store_city: store_city,
        },
        type: QueryTypes.INSERT,
      }
    );
    cityId = newCityId;
  } else if (exists.store_name && exists.city_name) {
    throw new BadRequestError(
      "Store already exists in this city! Go make a review for it!😊"
    );
  } else {
    cityId = exists.city_id;
  }

  const [newStoreId] = await sequelize.query(
    `
    INSERT INTO store (store_name, store_description, store_adress, store_zipcode, store_fk_city_id, store_createdBy_fk_user_id)
    VALUES ($store_name, $store_description, $store_adress, $store_zipcode, $store_fk_city_id, $store_createdBy_fk_user_id);
    `,
    {
      bind: {
        store_name: store_name,
        store_description: store_description,
        store_adress: store_adress,
        store_zipcode: store_zipcode,
        store_fk_city_id: cityId,
        store_createdBy_fk_user_id: userId,
      },
      type: QueryTypes.INSERT,
    }
  );

  return res
    .setHeader(
      "Location",
      `${req.protocol}://${req.headers.host}/api/v1/stores/${newStoreId}`
    )
    .sendStatus(201)
    .json({ message: `You have created a store🚀` });
};

exports.updateStoreById = async (req, res) => {
  const {
    store_name,
    store_description,
    store_adress,
    store_zipcode,
    store_fk_city_id,
  } = req.body;
  const storeId = req.params.storeId;
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (
    !store_name ||
    !store_description ||
    !store_adress ||
    !store_zipcode ||
    !store_fk_city_id
  ) {
    throw new BadRequestError("You must enter values for each field.");
  }

  const store = await sequelize.query(
    `
  SELECT * FROM store
  WHERE store_id = $storeId  
  `,
    {
      bind: { storeId: storeId },
      type: QueryTypes.SELECT,
    }
  );

  if (store.length <= 0) throw new UnauthorizedError("Store does not exist.");
  console.log(store);
  if (
    userRole == userRoles.ADMIN ||
    userId == store[0].store_createdBy_fk_user_id
  ) {
    const [updatedStore] = await sequelize.query(
      `
    UPDATE store SET store_name = $store_name, store_description = $store_description, 
    store_adress = $store_adress, store_zipcode = $store_zipcode, 
    store_fk_city_id = $store_fk_city_id
    WHERE store_id = $storeId;
    RETURNING *;
    `,
      {
        bind: {
          store_name: store_name,
          store_description: store_description,
          store_adress: store_adress,
          store_zipcode: store_zipcode,
          store_fk_city_id: store_fk_city_id,
          storeId: storeId,
        },
        type: QueryTypes.UPDATE,
      }
    );

    return res.json(updatedStore);
  } else {
    throw new UnauthorizedError(
      "Your trying to update a store created by another user."
    );
  }
};
