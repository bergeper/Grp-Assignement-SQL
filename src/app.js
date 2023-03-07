require("dotenv").config();
require("express-async-errors");
const express = require("express");
const apiRoutes = require("./routes");
const helmet = require("helmet");
const { errorMiddleware } = require("./middleware/errorMiddleware");
const {
  notFoundMiddleware,
} = require("./middleware/notFoundMiddleware");
const { sequelize } = require("./database/config");
const cors = require("cors");
const xss = require("xss-clean");

const app = express();

app.use(helmet());

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "PUT", "POST", "DELETE"],
  })
);
app.use(xss());

app.use((req, res, next) => {
  console.log(`Processing ${req.method} request to ${req.path}`);
  next();
});

app.use("/api/v1", apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 3000;
const run = async () => {
  try {
    await sequelize.authenticate();

    app.listen(port, () => {
      console.log(
        `Server is listening on ${
          process.env.NODE_ENV === "development"
            ? "http://localhost:"
            : "port "
        }${port}`
      );
    });
  } catch (error) {
    console.error(error);
  }
};

run();
