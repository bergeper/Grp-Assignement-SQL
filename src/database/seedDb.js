const { sequelize } = require("./config");
const { presidents } = require("../data/presidents");
const { pets } = require("../data/pets");
const { firstLadies } = require("../data/firstLadies");

const snowsportsDb = async () => {
  try {
    // Drop tables if exist
    await sequelize.query(`DROP TABLE IF EXISTS stores;`);
    await sequelize.query(`DROP TABLE IF EXISTS users;`);

    // Create stores table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      number INTEGER NOT NULL,
      birth_year INTEGER NOT NULL,
      death_year INTEGER,
      took_office DATE NOT NULL,
      left_office DATE,
      party TEXT,
      days_in_office INTEGER NOT NULL DEFAULT 0,
      sat_two_full_terms BOOLEAN CHECK (sat_two_full_terms IN (0, 1))
    );
   `);

    // Create users table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birth_year INTEGER NOT NULL,
      death_year INTEGER,
      tenure_start DATE,
      tenure_end DATE,
      age_at_tenure_start INTEGER NOT NULL,
      birth_country TEXT,
      wife_of_president BOOLEAN DEFAULT 1 CHECK (wife_of_president IN (0, 1)),
      relationship_with_president TEXT,
      fk_president_id INTEGER NOT NULL,
      FOREIGN KEY(fk_president_id) REFERENCES president(id)
    );
    `);

    let presidentInsertQuery =
      "INSERT INTO president (number, name, birth_year, death_year, took_office, left_office, party, days_in_office, sat_two_full_terms) VALUES ";

    let presidentInsertQueryVariables = [];

    presidents.forEach((president, index, array) => {
      let string = "(";
      for (let i = 1; i < 10; i++) {
        string += `$${presidentInsertQueryVariables.length + i}`;
        if (i < 9) string += ",";
      }
      presidentInsertQuery += string + ")";
      if (index < array.length - 1) presidentInsertQuery += ",";

      const variables = [
        president.number,
        president.name,
        president.birth_year,
        president.death_year,
        president.took_office,
        president.left_office,
        president.party,
        president.days_in_office,
        president.sat_two_full_terms,
      ];
      presidentInsertQueryVariables = [
        ...presidentInsertQueryVariables,
        ...variables,
      ];
    });
    presidentInsertQuery += ";";

    await sequelize.query(presidentInsertQuery, {
      bind: presidentInsertQueryVariables,
    });

    const [presidentsRes, metadata] = await sequelize.query(
      "SELECT name, id FROM president"
    );

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
