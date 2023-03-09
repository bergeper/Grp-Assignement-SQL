const { UnauthenticatedError, BadRequestError } = require("../utils/errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");

exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(password, salt);

  const [results, metadata] = await sequelize.query(
    "SELECT user_id FROM user LIMIT 1"
  );

  if (!results || results.length < 1) {
    await sequelize.query(
      "INSERT INTO user (username, email, password, role) VALUES ($username, $email, $password, $role)",
      {
        bind: {
          username: username,
          password: hashedpassword,
          email: email,
          role: userRoles.ADMIN,
        },
      }
    );
  } else {
    const [userExists] = await sequelize.query(
      `
    SELECT username, email FROM user
    WHERE username = $username OR email = $email
    `,
      {
        bind: { username: username, email: email },
      }
    );
    if (userExists.length <= 0) {
      await sequelize.query(
        "INSERT INTO user (username, email, password) VALUES ($username, $email, $password)",
        {
          bind: {
            username: username,
            password: hashedpassword,
            email: email,
          },
        }
      );
    } else {
      throw new BadRequestError("That username or email does already exist.");
    }
  }

  return res.status(201).json({
    message: `Registration succeeded. You can login in now ${username}`,
  });
};

exports.login = async (req, res) => {
  const { username, password: canditatePassword } = req.body;

  const [user, metadata] = await sequelize.query(
    "SELECT * FROM user WHERE username = $username LIMIT 1;",
    {
      bind: { username },
      type: QueryTypes.SELECT,
    }
  );

  if (!user) throw new UnauthenticatedError("Invalid Credentials");

  const isPasswordCorrect = await bcrypt.compare(
    canditatePassword, // Det user skriver in
    user.password // det som finns i databasen
  );
  if (!isPasswordCorrect) throw new UnauthenticatedError("Invalid Credentials");

  const jwtPayload = {
    userId: user.user_id,
    username: user.username,
    role: user.role,
  };

  const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: "1h" /* 1d */,
  });

  return res.json({ token: jwtToken, user: jwtPayload });
};
