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

  console.log(city);

  if (!city) {
    const [store, metadata] = await sequelize.query(
      `
  SELECT * FROM store s ORDER by store_name ASC, LIMIT $limit OFFSET $offset
  `,
      {
        bind: { limit: limit, offset: offset },
      }
    );
    console.log(store);

    if (!store || store[0]) {
      throw new NotFoundError("sorry, we can't find any stores");
    }
    return res.json(store);
  } else {
    const formattedCity = city.trim();

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
    if (!store || store[0]) {
      throw new NotFoundError(
        "sorry, we can't find any stores listed in that city"
      );
    }

    return res.json(results);
  }
};

exports.getStoreById = async (req, res) => {
  const storeId = req.params.storeId;

  const [store] = await sequelize.query(
    `
  SELECT store_id, store_name FROM store s 
  WHERE store_id = $storeId
  `,
    {
      bind: { storeId: storeId },
      type: QueryTypes.SELECT,
    }
  );

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

  if (!store || store.length == 0) {
    throw new NotFoundError("We could not find the list you are looking for");
  }

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

  const userId = store[0].store_createdBy_fk_user_id;

  if (req.user.role == userRoles.ADMIN || req.user.userId == userId) {
    await sequelize.query(`DELETE FROM reviews WHERE fk_store_id = $storeId`, {
      bind: { storeId: storeId },
    });

    console.log("true");
    await sequelize.query(`DELETE FROM store WHERE store_Id = $storeId`, {
      bind: { storeId: storeId },
    });
    return res.send("hej");
  } else {
    return res.status(403).json("You are not authorized to delete this store");
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

  const [storeAlreadyInDatabase] = await sequelize.query(
    `
    SELECT s.store_name FROM store s
    WHERE s.store_name = $store_name
    `,
    {
      bind: {
        store_name: store_name,
      },
      type: QueryTypes.SELECT,
    }
  );

  if (storeAlreadyInDatabase)
    throw new BadRequestError("That store already exists");

  const [cityAlreadyExists] = await sequelize.query(
    `
      SELECT city_id FROM city
      WHERE city_name = $store_city
      `,
    {
      bind: { store_city: store_city },
      type: QueryTypes.SELECT,
    }
  );

  let cityId;

  if (cityAlreadyExists) {
    cityId = cityAlreadyExists.city_id;
  } else {
    const newCityId = await sequelize.query(
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
    cityId = newCityId.city_id;
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
    .sendStatus(201);
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

  if (userRole == userRoles.ADMIN || userId == review[0].fk_user_id) {
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
