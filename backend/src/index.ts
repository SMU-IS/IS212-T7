import dotenv from "dotenv";
dotenv.config();

import cors from "@koa/cors";
import Koa from "koa";
const bodyParser = require("koa-bodyparser");
import router from "@/router";
import "reflect-metadata";

const app = new Koa();

app.use(bodyParser());
app.use(cors());
app.use(router.routes());

export { app };
