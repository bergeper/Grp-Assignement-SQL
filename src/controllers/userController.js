 // kunna skapa user och hämta alla user, hämta user baserat på id, ta bort id (usern själv och admin)
const { users } = require("../data/users");
const { NotFoundError, UnauthorizedError } = require("../utils/errors");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");

exports.getAllUsers = async (req, res) => {
  const [users, metadata] = await sequelize.query(
    "SELECT username, password, email FROM users"
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

  if (!user) throw new NotFoundError("That user does not exist");

  return res.json(user);
};

exports.deleteUserById = async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);

  if ( req.user.role == userRoles.ADMIN || req.user.userId == userId ) {
    // userId != req.user?.userId &&
    // req.user.role !== userRoles.ADMIN
  // ) {
  //   throw new UnauthorizedError("Unauthorized Access");
  // }

  const [user, metadata] = await sequelize.query(
    `DELETE FROM review WHERE fk_user_id = $userId;
     DELETE FROM user WHERE user_id = $userId;`,
    {
      bind: { userId },
      type: QueryTypes.DELETE,
    }
  );

  if (!user) {
    throw new NotFoundError("That user does not exist");
  }
} else {
    throw new UnauthorizedError("You don't have permission to delete this user");
  }
  return res.sendStatus(204);
};

  // await sequelize.query(
  //   "DELETE FROM users_lists WHERE fk_usersid = $userId",
  //   {
  //     bind: { userId },
  //   }
  // );

  exports.createNewUser = async (req, res) => {
    return res.send("createNewUser");
  };

  exports.updateUserById = async (req, res) => {
    return res.send("updateUserById")
  }

