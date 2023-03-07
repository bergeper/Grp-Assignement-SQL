// kunna skapa user och hämta alla user, hämta user baserat på id, ta bort id (usern själv och admin)
const { users } = require("../data/users");
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

//CREATE
exports.createNewUser = async (req, res) => {
  const userId = req.params.userId;
  return res.send("createNewUser");
};

//UPDATE
exports.updateUserById = async (req, res) => {
  return res.send("updateUserById");
};

//DELETE
exports.deleteUserById = async (req, res) => {
  const storeId = req.params.storeId;
  const userId = req.user.userId;

  if (req.user.role == userRoles.ADMIN || req.user.userId == userId) {
    const review = await sequelize.query(
      `DELETE FROM review WHERE fk_user_id = $userId;`,
      {
        bind: { userId: userId },
        type: QueryTypes.DELETE,
      }
    );

    const updatedCreator = await sequelize.query(
      `
        UPDATE store SET fstore_createdBy_fk_user_id = '1' 
        WHERE fstore_createdBy_fk_user_id = $userId;`,
      {
        bind: { userId: userId },
        type: QueryTypes.UPDATE,
      }
    );

    const user = await sequelize.query(
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
