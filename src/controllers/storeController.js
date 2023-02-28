const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");
const { sequelize } = require("../database/config");
const { UnauthorizedError } = require("../utils/errors");

exports.getAllStores = (req, res) => res.send("getAllStores");
exports.getStoreById = (req, res) => {
  return res.send("getStoreById");
};

exports.createNewStore = async (req, res) => {
  const store = req.body.store;
  const listId = req.params.listId || req.body.listId;

  if (req.user.role !== userRoles.ADMIN) {
    const [userRole, userRoleMeta] = await sequelize.query(
      `
      INSERT _STORE =
      INSERT INTO stores (store_name, store_description, store_adress, store_zipcode, store_city, store_createdBy_fk_user_id)
      VALUES (store_name, store_description, store_adress, store_zipcode, store_city, store_createdBy_fk_user_id)
      `,
      {
        bind: { listId: listId, userId: req.user.userId },
        type: QueryTypes.SELECT,
      }
    );

    if (!userRole) {
      throw new UnauthorizedError(
        "You are not allowed to perform this action"
      );
    }
  }

  const [newStoreId] = await sequelize.query(
    "INSERT INTO getAllStores (store, fk_lists_id) VALUES ($store, $listId);",
    {
      bind: { store: store, listId: listId },
      type: QueryTypes.INSERT, // returns ID of created row
    }
  );

  // prettier-ignore
  return res
    .setHeader('Location', `${req.protocol}://${req.headers.host}/api/v1/lists/${newStoreId}`)
    .sendStatus(201)
};

exports.updateStoreById = (req, res) => res.send("updateStoreById");
exports.deleteStoreById = (req, res) => res.send("deleteStoreById");
