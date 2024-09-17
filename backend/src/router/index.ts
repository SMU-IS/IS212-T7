import EmployeeController from "@/controllers/EmployeeController";
import { AccessControl } from "@/helpers";
import { checkUserRolePermission } from "@/middleware/checkUserRolePermission";
import swaggerSpec from "@/swagger";
import Router from "koa-router";
import { koaSwagger } from "koa2-swagger-ui";

const router = new Router();
router.prefix("/api/v1");
router.get("/swagger.json", (ctx) => {
  ctx.body = swaggerSpec;
});

router.get(
  "/docs",
  koaSwagger({
    swaggerOptions: {
      url: `${process.env.DOMAIN}/api/v1/swagger.json`,
    },
  })
);

router.get("/", async (ctx: any) => {
  ctx.body = `Server is Running! 💨`;
});

/**
 * @openapi
 * /api/v1/getEmployee?staffId={INSERT ID HERE}:
 *   get:
 *     description: Get employee data
 *     tags: [Employee]
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: number
 *         required: true
 *         description: The Id of the employee to retrieve
 *     responses:
 *       200:
 *         description: Returns an employee object
 */
router.get(
  "/getEmployee",
  checkUserRolePermission(AccessControl.VIEW_OVERALL_SCHEDULE),
  (ctx) => EmployeeController.getEmployee(ctx)
);

export default router;
