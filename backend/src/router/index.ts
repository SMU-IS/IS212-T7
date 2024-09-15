import UserController from "@/controllers/UserController";
import Router from "koa-router";

const router = new Router();
router.prefix("/api/v1");

router.get("/", async (ctx: any) => {
  ctx.body = `Server is Running! 💨`;
});

// Can add middleware here to intercept the request

router.post("/getUser", (ctx) => UserController.getUser(ctx));

export default router;
