const { UnauthenticatedError } = require("../utils/errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");

exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(password, salt);

  await sequelize.query(
    "INSERT INTO users (username, email, password) VALUES ($username, $email, $password)",
    {
      bind: {
        username: username,
        password: hashedpassword,
        email: email,
      },
    }
  );

  return res.status(201).json({
    message: "Registration succeeded. Please log in.",
  });
};

exports.login = async (req, res) => {
  const { username, password: canditatePassword } = req.body;

  const [user, metadata] = await sequelize.query(
    "SELECT * FROM users WHERE username = $username LIMIT 1;",
    {
      bind: { username },
      type: QueryTypes.SELECT,
    }
  );

  if (!user) throw new UnauthenticatedError("Invalid Credentials");

  const isPasswordCorrect = await bcrypt.compare(
    canditatePassword,
    user.password
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
