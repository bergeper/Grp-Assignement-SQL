const bcrypt = require("bcrypt");
const { sequelize } = require("./config");
const { stores } = require("../data/stores");
const { users } = require("../data/users");

const { reviews } = require("../data/reviews");

const snowsportsDb = async () => {
  try {
    // Drop tables if exist
    await sequelize.query(`DROP TABLE IF EXISTS reviews;`);
    await sequelize.query(`DROP TABLE IF EXISTS stores;`);
    await sequelize.query(`DROP TABLE IF EXISTS users;`);

    // Create users table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    );
    `);

    // Create stores table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS stores (
      store_id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT NOT NULL,
      store_description TEXT NOT NULL,
      store_adress TEXT NOT NULL,
      store_zipcode INTEGER NOT NULL,
      store_city TEXT NOT NULL,
      store_createdBy_fk_user_id INTEGER NOT NULL,
      FOREIGN KEY(store_createdBy_fk_user_id) REFERENCES users(user_id)
      );
      `);

    // Create users table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      review_id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_title TEXT NOT NULL,
      review_description TEXT NOT NULL,
      review_rating INTEGER NOT NULL,
      fk_user_id INTEGER NOT NULL,
      fk_store_id INTEGER NOT NULL,
      FOREIGN KEY(fk_user_id) REFERENCES users(user_id),
      FOREIGN KEY(fk_store_id) REFERENCES stores(store_id)
      );
      `);

    let userInsertQuery =
      "INSERT INTO users (username, password, email) VALUES ";

    let userInsertQueryVariables = [];

    users.forEach((user, index, array) => {
      let string = "(";
      for (let i = 1; i < 4; i++) {
        string += `$${userInsertQueryVariables.length + i}`;
        if (i < 3) string += ",";
      }
      userInsertQuery += string + `)`;
      if (index < array.length - 1) userInsertQuery += ",";

      // let password = user.password;
      // const salt = await bcrypt.genSalt(10);
      // user.password = await bcrypt.hash(password, salt);
      // prettier-ignore
      const variables = [
        user.username, 
        user.password, 
        user.email
      ];
      // prettier-ignore
      userInsertQueryVariables = [
        ...userInsertQueryVariables, 
        ...variables
      ];
    });
    userInsertQuery += `;`;

    await sequelize.query(userInsertQuery, {
      bind: userInsertQueryVariables,
    });

    const [usersRes, metadata] = await sequelize.query(
      "SELECT username, user_id FROM users"
    );

    /****************************************/

    let storeInsertQuery =
      "INSERT INTO stores (store_name, store_description, store_adress, store_zipcode, store_city, store_createdBy_fk_user_id) VALUES ";

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
        store.store_city,
        store.store_createdBy_fk_user_id,
      ];
      storeInsertQueryVariables = [...storeInsertQueryVariables, ...variables];
    });
    storeInsertQuery += ";";
    await sequelize.query(storeInsertQuery, {
      bind: storeInsertQueryVariables,
    });

    /**********************************************/

    let reviewInsertQuery =
      "INSERT INTO reviews (review_title, review_description, review_rating, fk_user_id, fk_store_id) VALUES ";

    let reviewInsertQueryVariables = [];

    reviews.forEach((review, index, array) => {
      let string = "(";
      for (let i = 1; i < 6; i++) {
        string += `$${reviewInsertQueryVariables.length + i}`;
        if (i < 5) string += ",";
      }
      reviewInsertQuery += string + `)`;
      if (index < array.length - 1) reviewInsertQuery += ",";
      // prettier-ignore
      const variables = [
        review.review_title, 
        review.review_description, 
        review.review_rating,
        review.fk_user_id,
        review.fk_store_id,
        ];
      // prettier-ignore
      reviewInsertQueryVariables = [
          ...reviewInsertQueryVariables, 
          ...variables
      ];
    });
    reviewInsertQuery += `;`;

    await sequelize.query(reviewInsertQuery, {
      bind: reviewInsertQueryVariables,
    });

    /**********************************************/

    console.log(usersRes);
    console.log("Database successfully populated with data...");
  } catch (error) {
    // Log eny eventual errors to Terminal
    console.error(error);
  } finally {
    // End Node process
    process.exit(0);
  }
};

snowsportsDb();
