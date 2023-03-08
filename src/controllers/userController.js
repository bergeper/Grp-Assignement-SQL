const { userRoles } = require("../constants/users");
const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require("../utils/errors");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res) => {
  const [users, metadata] = await sequelize.query(
    "SELECT username, password, email, role FROM users"
  );
  return res.json(users);
};

exports.getUserById = async (req, res) => {
  const userId = req.params.userId;

  const [user] = await sequelize.query(
    `
  SELECT * FROM user u
  WHERE user_id = $userId
  `,
    {
      bind: { userId: userId },
      type: QueryTypes.SELECT,
    }
  );

  const reviews = await sequelize.query(
    `
  SELECT r.review_id, r.review_title, r.review_description, r.review_rating, u.username
  FROM review r
  JOIN store s ON u.user_id = r.fk_user_id
  JOIN user u ON s.store_id = r.fk_store_id
  WHERE user_id = $userId
  `,
    {
      bind: {
        userId: userId,
      },
      type: QueryTypes.SELECT,
    }
  );

  if (!user || user.length == 0) {
    throw new NotFoundError(
      "We could not find the user you are looking for.😢"
    );
  }

  const response = {
    user: user,
    reviews: reviews,
  };
  return res.json(response);
};

//UPDATE
exports.updateUserById = async (req, res) => {
  const { username, email, password } = req.body;

  const userId = req.user.userId;
  const userRole = req.user.role;

  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(password, salt);

  if (
    userId != req.user?.userId &&
    req.user.role !== userRole.ADMIN
  ) {
    throw new UnauthorizedError("Unauthorized Access");
  }

  if (username == "" || email == "" || password == "") {
    throw new BadRequestError(
      "Input fields cannot be empty! Try again."
    );
  }

  if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    throw new BadRequestError(
      "User email must be an email! Try again."
    );
  }

  const user = await sequelize.query(
    `SELECT * FROM user
    WHERE user_id = $userId`,
    {
      bind: { userId: userId },
      type: QueryTypes.SELECT,
    }
  );

  if (user.length <= 0)
    throw new BadRequestError("This user doesn't exist");

  const [updatedUser, updatedUserMetaData] = await sequelize.query(
    `
    UPDATE user SET email = $email, password = $password, username = $username 
    WHERE user_id = $userId;
    `,
    {
      bind: {
        email: email,
        password: hashedpassword,
        username: username,
        userId: userId,
      },
      type: QueryTypes.UPDATE,
    }
  );
  return res.status(201).json({
    message: "Success! User is now updated.",
  });
};

exports.deleteUserById = async (req, res) => {
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
