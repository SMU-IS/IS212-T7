import mongoose from "mongoose";
import Employee from "./Employee";

const getModels = async () => {
  // In case you using mongoose 6
  // https://mongoosejs.com/docs/guide.html#strictQuery
  mongoose.set("strictQuery", false);

  // Ensure connection is open so we can run migrations
  await mongoose.connect(String(process.env.MIGRATE_MONGO_URI));

  // Return models that will be used in migration methods
  return {
    mongoose,
    Employee,
  };
};

export default getModels;
