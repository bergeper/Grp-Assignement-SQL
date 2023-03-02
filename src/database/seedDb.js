const bcrypt = require("bcrypt");
const { sequelize } = require("./config");
const { stores } = require("../data/stores");
const { users } = require("../data/users");
const { cities } = require("../data/cities");
const { reviews } = require("../data/reviews");

const snowsportsDb = async () => {
  try {
    // Drop tables if exist
    await sequelize.query(`DROP TABLE IF EXISTS reviews;`);
    await sequelize.query(`DROP TABLE IF EXISTS stores;`);
    await sequelize.query(`DROP TABLE IF EXISTS users;`);
    await sequelize.query(`DROP TABLE IF EXISTS cities;`);

    // Create users table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT 0 CHECK (is_admin IN (0, 1)) 
    );
    `);

    // Create city table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS cities (
      city_id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name TEXT NOT NULL
    );`);

    // Create stores table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS stores (
      store_id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT NOT NULL,
      store_description TEXT NOT NULL,
      store_adress TEXT NOT NULL,
      store_zipcode INTEGER NOT NULL,
      store_fk_city_id INTEGER NOT NULL,
      store_createdBy_fk_user_id INTEGER NOT NULL,
      FOREIGN KEY(store_fk_city_id) REFERENCES cities(city_id),
      FOREIGN KEY(store_createdBy_fk_user_id) REFERENCES users(user_id)
      );
      `);

    // Create reviews table
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

    const hashPw = async (password) => {
      const salt = await bcrypt.genSalt(10);
      const hashedpassword = await bcrypt.hash(password, salt);
      return hashedpassword;
    };

    let HashedPwOne = await hashPw(users[0].password);
    let HashedPwTwo = await hashPw(users[1].password);
    let HashedPwThree = await hashPw(users[2].password);

    await sequelize.query(
      "INSERT INTO users (username, email, password, is_admin) VALUES ($username, $email, $password, TRUE)",
      {
        bind: {
          username: users[0].username,
          email: users[0].email,
          password: HashedPwOne,
        },
      }
    );

    await sequelize.query(
      "INSERT INTO users (username, email, password) VALUES ($username, $email, $password)",
      {
        bind: {
          username: users[1].username,
          email: users[1].email,
          password: HashedPwTwo,
        },
      }
    );

    await sequelize.query(
      "INSERT INTO users (username, email, password) VALUES ($username, $email, $password)",
      {
        bind: {
          username: users[2].username,
          email: users[2].email,
          password: HashedPwThree,
        },
      }
    );

    //const [usersRes, metadata] = await sequelize.query("SELECT * FROM users");

    let cityInsertQuery = "INSERT INTO cities (city_name) VALUES ";

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

    /*                         s                      */
    let storeInsertQuery =
      "INSERT INTO stores (store_name, store_description, store_adress, store_zipcode, store_fk_city_id, store_createdBy_fk_user_id) VALUES ";

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

    //console.log(usersRes);
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
