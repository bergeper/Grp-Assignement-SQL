const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize("snowsportsDb", "", "", {
  dialect: "sqlite",
  storage: path.join(__dirname, "snowsportsDb.sqlite"),
});

module.exports = {
  sequelize,
};
