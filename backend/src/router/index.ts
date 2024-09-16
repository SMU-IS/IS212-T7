import EmployeeController from "@/controllers/EmployeeController";
import { AccessControl } from "@/helpers";
import { checkUserRolePermission } from "@/middleware/checkUserRolePermission";
import Router from "koa-router";

const router = new Router();
router.prefix("/api/v1");

router.get("/", async (ctx: any) => {
  ctx.body = `Server is Running! 💨`;
});

// EXAMPLE ONLY
// checkUserRolePermission() is a middleware that checks whether the user has access rights based on roleId
// Pass in the parameter, an action that the user is undertaking
// {{base_url}}/api/v1/getEmployee?staffId=130002

router.get(
  "/getEmployee",
  checkUserRolePermission(AccessControl.VIEW_OVERALL_SCHEDULE),
  (ctx) => EmployeeController.getEmployee(ctx)
);

export default router;
