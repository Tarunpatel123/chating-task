import "dotenv/config";
import app from "./app";
import sequelize from "./config/db";
import "./models";

const PORT = Number(process.env.PORT || 3000);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // creates tables if they don't exist
    console.log("MySQL connected");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.log("Server start failed", error);
    process.exit(1);
  }
};

start();
