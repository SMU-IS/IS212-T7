import ReassignmentDb from "@/database/ReassignmentDb";
import RequestDb from "@/database/RequestDb";
import CronJob from "@/services/CronJob";
import mongoose from "mongoose";

const startCronJob = async () => {
  const requestDb = new RequestDb();
  const reassignmentDb = new ReassignmentDb();
  const job = new CronJob(requestDb, reassignmentDb);
  await job.execute();
};

const initDB = () => {
  mongoose.connect(String(process.env.CONNECTION_STRING));
  mongoose.connection.once("open", () => {
    console.log("💿 Connected to MongoDB 💿");
  });

  mongoose.connection.on("error", console.error);
};

export { initDB, startCronJob };
