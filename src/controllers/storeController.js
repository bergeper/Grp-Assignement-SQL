const { QueryTypes } = require("sequelize");
const { user } = require("../data/users");
const { store } = require("../data/stores");
const { sequelize } = require("../database/config");
const { UnauthorizedError } = require("../utils/errors");

exports.getAllStores = (req, res) => res.send("getAllStores");
exports.getTodoById = (req, res) => {
  return res.send("getStoreById");
};

exports.createNewStore = async (req, res) => {
  const store = req.body.store;
  const listId = req.params.storeId || req.body.storeId;

  if (req.user.ADMIN !== user.ADMIN) {
    const [userListRole, userMeta] = await sequelize.query(
      `
        SELECT r.role_name 
        FROM users_lists ul
          JOIN roles r ON r.id = ul.fk_roles_id 
        WHERE ul.fk_lists_id = $listId AND fk_users_id = $userId 
        LIMIT 1
      `,
      {
        bind: { listId: listId, userId: req.user.userId },
        type: QueryTypes.SELECT,
      }
    );

    if (!user.ADMIN) {
      throw new UnauthorizedError(
        "You are not allowed to perform this action"
      );
    }
  }

  const [newStoreId] = await sequelize.query(
    "INSERT INTO Stores (store, fk_review_id) VALUES ($store, $listId);",
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
