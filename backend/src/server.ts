import { app } from "./index";
import { initDB, startCronJob } from "./config";

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`🚀 Server listening on localhost:${PORT} 🚀`);
  initDB();
  startCronJob();
});
