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
      id INTEGER NOT NULL,
      store_name TEXT NOT NULL,
      store_zipcode INTEGER NOT NULL,
      store_owner INTEGER NOT NULL,
      store_city TEXT NOT NULL,
      fk_review_id INTEGER NOT NULL,
      );
      `)

    // Create users table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TIMESTAMP,
    );
    `);

    let storeInsertQuery =
      "INSERT INTO store (id, store_name, store_zipcode, store_owner, store_city, fk_review_id) VALUES ";

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
        store.id,
        store.store_name, 
        store.store_zipcode,
        store.store_owner, 
        store.store_city,
        store.fk_review_id
      ];
      storeInsertQueryVariables = [
        ...storeInsertQueryVariables,
        ...variables,
      ];
    });
    storeInsertQuery += ";";

    await sequelize.query(storeInsertQuery, {
      bind: storeInsertQueryVariables,
    });

    const [storesRes, metadata] = await sequelize.query(
      "SELECT store_name, id FROM store"
    );
    
/****************************************/

    let firstLadyInsertQuery =
      "INSERT INTO first_lady (name, birth_year, death_year, tenure_start, tenure_end, age_at_tenure_start, birth_country, wife_of_president, relationship_with_president, fk_president_id) VALUES ";

    let firstLadyInsertQueryVariables = [];

    firstLadies.forEach((firstLady, index, array) => {
      let string = "(";
      for (let i = 1; i < 11; i++) {
        string += `$${firstLadyInsertQueryVariables.length + i}`;
        if (i < 10) string += ",";
      }
      firstLadyInsertQuery += string + `)`;
      if (index < array.length - 1) firstLadyInsertQuery += ",";
      const variables = [
        firstLady.name,
        firstLady.birthYear,
        firstLady.deathYear,
        firstLady.tenureStart,
        firstLady.tenureEnd,
        firstLady.ageAtStartOfTenure,
        firstLady.birthCountry,
        firstLady.wifeOfPresident,
      ];

      firstLady.wifeOfPresident
        ? variables.push("Spouse")
        : variables.push(firstLady.relationshipWithPresident);

      const presidentId = presidentsRes.find(
        (pres) => pres.name === firstLady.president
      );
      variables.push(presidentId.id);

      firstLadyInsertQueryVariables = [
        ...firstLadyInsertQueryVariables,
        ...variables,
      ];
    });
    firstLadyInsertQuery += `;`;

    await sequelize.query(firstLadyInsertQuery, {
      bind: firstLadyInsertQueryVariables,
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