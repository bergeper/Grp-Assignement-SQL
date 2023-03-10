const bcrypt = require("bcrypt");
const { sequelize } = require("./config");
const { stores } = require("../data/stores");
const { users } = require("../data/users");
const { cities } = require("../data/cities");
const { reviews } = require("../data/reviews");

const snowsportsDb = async () => {
  try {
    await sequelize.query(`DROP TABLE IF EXISTS review;`);
    await sequelize.query(`DROP TABLE IF EXISTS store;`);
    await sequelize.query(`DROP TABLE IF EXISTS user;`);
    await sequelize.query(`DROP TABLE IF EXISTS city;`);

    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS user (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT "USER"
    );
    `);

    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS city (
      city_id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name TEXT NOT NULL
    );`);

    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS store (
      store_id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT NOT NULL,
      store_description TEXT NOT NULL,
      store_adress TEXT NOT NULL,
      store_zipcode INTEGER NOT NULL,
      store_fk_city_id INTEGER NOT NULL,
      store_createdBy_fk_user_id INTEGER NOT NULL,
      FOREIGN KEY(store_fk_city_id) REFERENCES city(city_id),
      FOREIGN KEY(store_createdBy_fk_user_id) REFERENCES user(user_id)
      );
      `);

    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS review (
      review_id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_title TEXT NOT NULL,
      review_description TEXT,
      review_rating INTEGER NOT NULL,
      fk_user_id INTEGER NOT NULL,
      fk_store_id INTEGER NOT NULL,
      FOREIGN KEY(fk_user_id) REFERENCES user(user_id),
      FOREIGN KEY(fk_store_id) REFERENCES store(store_id)
      );
      `);

    let userInsertQuery = `INSERT INTO user (username, email, password, role) VALUES `;

    let userInsertQueryVariables = [];

    for (let i = 0; i < users.length; i++) {
      let username = users[i].username;
      let email = users[i].email;
      let password = users[i].password;
      let role = users[i].role;

      const salt = await bcrypt.genSalt(10);
      const hashedpassword = await bcrypt.hash(password, salt);

      let values = `("${username}", "${email}", "${hashedpassword}", "${role}")`;
      userInsertQuery += values;
      if (i < users.length - 1) userInsertQuery += ", ";
    }

    userInsertQuery += ";";

    await sequelize.query(userInsertQuery);

    let cityInsertQuery = "INSERT INTO city (city_name) VALUES ";

    let cityInsertQueryVariables = [];

    cities.forEach((cities, index, array) => {
      let string = "(";
      for (let i = 1; i < 2; i++) {
        string += `$${cityInsertQueryVariables.length + i}`;
        if (i < 1) string += ",";
      }
      cityInsertQuery += string + ")";
      if (index < array.length - 1) cityInsertQuery += ",";

      const variables = [cities.city_name];
      cityInsertQueryVariables = [...cityInsertQueryVariables, ...variables];
    });
    cityInsertQuery += ";";
    await sequelize.query(cityInsertQuery, {
      bind: cityInsertQueryVariables,
    });

    let storeInsertQuery =
      "INSERT INTO store (store_name, store_description, store_adress, store_zipcode, store_fk_city_id, store_createdBy_fk_user_id) VALUES ";

    let storeInsertQueryVariables = [];

    stores.forEach((store, index, array) => {
      let string = "(";
      for (let i = 1; i < 7; i++) {
        string += `$${storeInsertQueryVariables.length + i}`;
        if (i < 6) string += ",";
      }
      storeInsertQuery += string + ")";
      if (index < array.length - 1) storeInsertQuery += ",";

      const variables = [
        store.store_name,
        store.store_description,
        store.store_adress,
        store.store_zipcode,
        store.store_fk_city_id,
        store.store_createdBy_fk_user_id,
      ];
      storeInsertQueryVariables = [...storeInsertQueryVariables, ...variables];
    });
    storeInsertQuery += ";";
    await sequelize.query(storeInsertQuery, {
      bind: storeInsertQueryVariables,
    });

    let reviewInsertQuery =
      "INSERT INTO review (review_title, review_description, review_rating, fk_user_id, fk_store_id) VALUES ";

    let reviewInsertQueryVariables = [];

    reviews.forEach((review, index, array) => {
      let string = "(";
      for (let i = 1; i < 6; i++) {
        string += `$${reviewInsertQueryVariables.length + i}`;
        if (i < 5) string += ",";
      }
      reviewInsertQuery += string + `)`;
      if (index < array.length - 1) reviewInsertQuery += ",";

      const variables = [
        review.review_title,
        review.review_description,
        review.review_rating,
        review.fk_user_id,
        review.fk_store_id,
      ];

      reviewInsertQueryVariables = [
        ...reviewInsertQueryVariables,
        ...variables,
      ];
    });
    reviewInsertQuery += `;`;

    await sequelize.query(reviewInsertQuery, {
      bind: reviewInsertQueryVariables,
    });

    console.log("Database successfully populated with data...");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
};

snowsportsDb();
