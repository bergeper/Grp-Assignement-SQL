const { NotFoundError, UnauthorizedError } = require("../utils/errors");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");

exports.getAllUsers = async (req, res) => {
  const [users, metadata] = await sequelize.query("SELECT * FROM user");
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
  // Grab the user id and place in local variable
  const userId = req.params.userId;

  // Check if user is admin || user is requesting to delete themselves
  if (userId != req.user?.userId && req.user.role !== userRoles.ADMIN) {
    throw new UnauthorizedError("Unauthorized Access");
  }

  // Delete the user from the database
  const [results, metadata] = await sequelize.query(
    "DELETE FROM user WHERE id = $userId RETURNING *",
    {
      bind: { userId: userId },
    }
  );

  // Not found error (ok since since route is authenticated)
  if (!results || !results[0])
    throw new NotFoundError("That user does not exist");

  await sequelize.query("DELETE FROM user_lists WHERE fk_user_id = $userId", {
    bind: { userId: userId },
  });

  // Send back user info
  return res.sendStatus(204);
};
