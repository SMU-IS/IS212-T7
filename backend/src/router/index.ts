import EmployeeController from "@/controllers/EmployeeController";
import Router from "koa-router";

const router = new Router();
router.prefix("/api/v1");

router.get("/", async (ctx: any) => {
  ctx.body = `Server is Running! 💨`;
});

// Can add middleware here to intercept the request

router.get("/getEmployee", (ctx) => EmployeeController.getEmployee(ctx));

export default router;
