import cors from "@koa/cors";
import { app } from "./index";
import { initDB } from "./config";

const PORT = process.env.PORT || 3001;

app.use(cors());

app.listen(PORT, () => {
  console.log(`🚀 Server listening on localhost:${PORT} 🚀`);
});

initDB();
