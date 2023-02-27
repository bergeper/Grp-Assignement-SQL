const bcrypt = require("bcrypt");
const { sequelize } = require("./config");
const { stores } = require("../data/stores");
const { users } = require("../data/users");
const { admins } = require("../data/admins");
const { reviews } = require("../data/reviews");

const snowsportsDb = async () => {
  try {
    // Drop tables if exist
    await sequelize.query(`DROP TABLE IF EXISTS reviews;`);
    await sequelize.query(`DROP TABLE IF EXISTS admins`);
    await sequelize.query(`DROP TABLE IF EXISTS users;`);
    await sequelize.query(`DROP TABLE IF EXISTS stores;`);

    // Create users table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    );
    `);

    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      password TEXT NOT NULL
    );
    `);

    // Create users table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_title TEXT NOT NULL,
      review_description TEXT NOT NULL,
      review_rating INTEGER NOT NULL,
      fk_user_id INTEGER NOT NULL,
      FOREIGN KEY(fk_user_id) REFERENCES users(id)
      );
      `);
    // Create stores table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT NOT NULL,
      store_description TEXT NOT NULL,
      store_zipcode INTEGER NOT NULL,
      store_owner INTEGER NOT NULL,
      store_city TEXT NOT NULL,
      fk_review_id INTEGER,
      FOREIGN KEY(fk_review_id) REFERENCES reviews(id)
      );
      `);

    /****************************************/

    let userInsertQuery =
      "INSERT INTO users (username, password, email) VALUES ";

    let userInsertQueryVariables = [];

    users.forEach(async (user, index, array) => {
      let string = "(";
      for (let i = 1; i < 4; i++) {
        string += `$${userInsertQueryVariables.length + i}`;
        if (i < 3) string += ",";
      }
      userInsertQuery += string + `)`;
      if (index < array.length - 1) userInsertQuery += ",";
      // prettier-ignore
      const salt = await bcrypt.genSalt(10)
      const password = user.password;
      let hashedpassword = await bcrypt.hash(password, salt);

      const variables = [user.username, hashedpassword, user.email];
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
      "SELECT username, id FROM users"
    );

    // **********************************************

    let adminInsertQuery = "INSERT INTO admins (name, password) VALUES ";

    let adminInsertQueryVariables = [];

    admins.forEach((admin, index, array) => {
      let string = "(";
      for (let i = 1; i < 3; i++) {
        string += `$${adminInsertQueryVariables.length + i}`;
        if (i < 2) string += ",";
      }
      adminInsertQuery += string + `)`;
      if (index < array.length - 1) adminInsertQuery += ",";
      // prettier-ignore
      const variables = [
        admin.name, 
        admin.password, 

      ];
      // prettier-ignore
      adminInsertQueryVariables = [
        ...adminInsertQueryVariables, 
        ...variables
      ];
    });
    adminInsertQuery += `;`;

    await sequelize.query(adminInsertQuery, {
      bind: adminInsertQueryVariables,
    });

    /**********************************************/

    let reviewInsertQuery =
      "INSERT INTO reviews (review_title, review_description, review_rating, fk_user_id) VALUES ";

    let reviewInsertQueryVariables = [];

    reviews.forEach((review, index, array) => {
      let string = "(";
      for (let i = 1; i < 5; i++) {
        string += `$${reviewInsertQueryVariables.length + i}`;
        if (i < 4) string += ",";
      }
      reviewInsertQuery += string + `)`;
      if (index < array.length - 1) reviewInsertQuery += ",";
      // prettier-ignore
      const variables = [
        review.review_title, 
        review.review_description, 
        review.review_rating,
        review.fk_user_id,
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

    let storeInsertQuery =
      "INSERT INTO stores (store_name, store_description, store_zipcode, store_owner, store_city, fk_review_id) VALUES ";

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
        store.store_zipcode,
        store.store_owner,
        store.store_city,
        store.fk_review_id,
      ];
      storeInsertQueryVariables = [...storeInsertQueryVariables, ...variables];
    });
    storeInsertQuery += ";";
    await sequelize.query(storeInsertQuery, {
      bind: storeInsertQueryVariables,
    });

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
