import mongoose from "mongoose";

const initDB = () => {
  mongoose.connect(String(process.env.CONNECTION_STRING));
  mongoose.connection.once("open", () => {
    console.log("Connected to database");
  });

  mongoose.connection.on("error", console.error);
};

export { initDB };
