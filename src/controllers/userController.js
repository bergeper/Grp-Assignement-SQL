<<<<<<< HEAD
 // kunna skapa user och hämta alla user, hämta user baserat på id, ta bort id (usern själv och admin)
const { user } = require("../data/users");
=======
>>>>>>> d31e64b8ea683d768b74a26f9517bb21c2c6ea09
const { NotFoundError, UnauthorizedError } = require("../utils/errors");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");

<<<<<<< HEAD
exports.getAllUsers = async (req, res) => { //admin 
  const [users, metadata] = await sequelize.query(
    "SELECT username, password, email FROM users"
  );
=======
exports.getAllUsers = async (req, res) => {
  const [users, metadata] = await sequelize.query("SELECT * FROM user");
>>>>>>> d31e64b8ea683d768b74a26f9517bb21c2c6ea09
  return res.json(users);
};

exports.getUserById = async (req, res) => {
  const userId = req.params.userId;

  const [user, metadata] = await sequelize.query(
    "SELECT id, email FROM user WHERE id = $userId",
    {
      bind: { userId: userId },
      type: QueryTypes.SELECT,
    }
  );

  if (!user) throw new NotFoundError("That user does not exist");

  return res.json(user);
};

exports.deleteUserById = async (req, res) => {
  const userId = req.params.userId;

<<<<<<< HEAD
  if (
    userId != req.user?.userId &&
    req.user.role !== userRoles.ADMIN
  ) {
=======
  // Check if user is admin || user is requesting to delete themselves
  if (userId != req.user?.userId && req.user.role !== userRoles.ADMIN) {
>>>>>>> d31e64b8ea683d768b74a26f9517bb21c2c6ea09
    throw new UnauthorizedError("Unauthorized Access");
  }

  const [results, metadata] = await sequelize.query(
    "DELETE FROM user WHERE id = $userId RETURNING *",
    {
      bind: { userId: userId },
    }
  );

  if (!results || !results[0])
    throw new NotFoundError("That user does not exist");

  await sequelize.query("DELETE FROM user_lists WHERE fk_user_id = $userId", {
    bind: { userId: userId },
  });

  return res.sendStatus(204);
};
