// kunna skapa user och hämta alla user, hämta user baserat på id, ta bort id (usern själv och admin)
const { userRoles } = require("../constants/users");
const {
  NotFoundError,
  UnauthorizedError,
} = require("../utils/errors");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");

exports.getAllUsers = async (req, res) => {
  const [users, metadata] = await sequelize.query(
    "SELECT username, password, email, role FROM users"
  );
  return res.json(users);
};

exports.getUserById = async (req, res) => {
  const userId = req.params.userId;

  const [user, metadata] = await sequelize.query(
    "SELECT user_id, email, name FROM users WHERE user_id = $userId",
    {
      bind: { userId },
      type: QueryTypes.SELECT,
    }
  );

  if (!user) throw new NotFoundError("That user does not exist 😢");

  return res.json(user);
};

exports.getStoreById = async (req, res) => {
  const userId = req.params.userId;

  const [user] = await sequelize.query(
    `
  SELECT user_id, user_name FROM user u
  WHERE user_id = $userId
  `,
    {
      bind: { userId: userId },
      type: QueryTypes.SELECT,
    }
  );
  /************************* fortsätt här nedan (junita) ********/
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
    throw new NotFoundError(
      "We could not find the store you are looking for.😢"
    );
  }

  const response = {
    store: store,
    reviews: reviews,
  };
  return res.json(response);
};

//  alla dens rewievs

//UPDATE
exports.updateUserById = async (req, res) => {
  return res.send("updateUserById");
};

//DELETE
exports.deleteUserById = async (req, res) => {
  const storeId = req.params.storeId;
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (userRole == userRoles.ADMIN || userId == req.user.userId) {
    await sequelize.query(
      `DELETE FROM review WHERE fk_user_id = $userId;`,
      {
        bind: { userId: userId },
        type: QueryTypes.DELETE,
      }
    );

    await sequelize.query(
      `
        UPDATE store SET store_createdBy_fk_user_id = '1' 
        WHERE store_createdBy_fk_user_id = $userId
        RETURNING *;`,
      {
        bind: { userId: userId },
        type: QueryTypes.UPDATE,
      }
    );

    await sequelize.query(
      `DELETE FROM user WHERE user_id = $userId;`,
      {
        bind: { userId: userId },
        type: QueryTypes.DELETE,
      }
    );
  } else {
    throw new UnauthorizedError(
      "You don't have permission to delete this user 😢"
    );
  }
  return res.sendStatus(204);
};
