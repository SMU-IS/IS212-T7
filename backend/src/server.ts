import { app } from "./index";
import { initDB, startCronJob } from "./config";
import initMailer from "./config/mailer";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on localhost:${PORT} 🚀`);
  initDB();
  startCronJob();
  initMailer();
});
