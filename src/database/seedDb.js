const { sequelize } = require("./config");
const { stores } = require("../data/stores");

const snowsportsDb = async () => {
  try {
    // Drop tables if exist
    await sequelize.query(`DROP TABLE IF EXISTS stores;`);
    await sequelize.query(`DROP TABLE IF EXISTS users;`);

    // Create stores table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT NOT NULL,
      store_zipcode INTEGER NOT NULL,
      store_owner INTEGER NOT NULL,
      store_city TEXT NOT NULL,
      fk_review_id INTEGER NOT NULL,
      );
      `);

    // Create users table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TIMESTAMP,
    );
    `);

    let storeInsertQuery =
      "INSERT INTO stores (id, store_name, store_zipcode, store_owner, store_city, fk_review_id) VALUES ";

    let storeInsertQueryVariables = [];

    stores.forEach((store, index, array) => {
      let string = "(";
      for (let i = 1; i < 10; i++) {
        string += `$${storeInsertQueryVariables.length + i}`;
        if (i < 9) string += ",";
      }
      storeInsertQuery += string + ")";
      if (index < array.length - 1) storeInsertQuery += ",";

      const variables = [
        store.store_name,
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

    const [storesRes, metadata] = await sequelize.query(
      "SELECT store_name, id FROM stores"
    );

    /****************************************/

    let userInsertQuery =
      "INSERT INTO first_lady (name, birth_year, death_year, tenure_start, tenure_end, age_at_tenure_start, birth_country, wife_of_president, relationship_with_president, fk_president_id) VALUES ";

    let userInsertQueryVariables = [];

    firstLadies.forEach((user, index, array) => {
      let string = "(";
      for (let i = 1; i < 11; i++) {
        string += `$${userInsertQueryVariables.length + i}`;
        if (i < 10) string += ",";
      }
      userInsertQuery += string + `)`;
      if (index < array.length - 1) userInsertQuery += ",";
      const variables = [
        user.name,
        user.birthYear,
        user.deathYear,
        user.tenureStart,
        user.tenureEnd,
        user.ageAtStartOfTenure,
        user.birthCountry,
        user.wifeOfPresident,
      ];

      const presidentId = presidentsRes.find(
        (pres) => pres.name === user.president
      );
      variables.push(presidentId.id);

      userInsertQueryVariables = [...userInsertQueryVariables, ...variables];
    });
    userInsertQuery += `;`;

    await sequelize.query(userInsertQuery, {
      bind: userInsertQueryVariables,
    });

    let petInsertQuery =
      "INSERT INTO pet (name, species, mammal, breed, birth_date, death_date, age, fk_president_id) VALUES ";

    let petInsertQueryVariables = [];

    let petsArray = [];
    pets.forEach((petsObj) => {
      petsObj.pets.forEach((pet) => {
        petsArray.push({
          ...pet,
          president: petsObj.president,
        });
      });
      return pets;
    });

    petsArray.forEach((pet, index, array) => {
      let string = "(";
      for (let i = 1; i < 9; i++) {
        string += `$${petInsertQueryVariables.length + i}`;
        if (i < 8) string += ",";
      }
      petInsertQuery += string + `)`;
      if (index < array.length - 1) petInsertQuery += ",";
      // prettier-ignore
      const variables = [
        pet.name, 
        pet.species, 
        pet.mammal
      ]

      variables.push(pet.breed || null);
      variables.push(pet.birthDate || null);
      variables.push(pet.deathDate || null);
      variables.push(pet.age || null);

      const presidentId = presidentsRes.find(
        (pres) => pres.name === pet.president
      );
      variables.push(presidentId.id);

      petInsertQueryVariables = [...petInsertQueryVariables, ...variables];
    });
    petInsertQuery += `;`;

    await sequelize.query(petInsertQuery, {
      bind: petInsertQueryVariables,
    });

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
