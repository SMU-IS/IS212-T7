import EmployeeController from "@/controllers/EmployeeController";
import RequestController from "@/controllers/RequestController";
import { AccessControl } from "@/helpers";
import { checkUserRolePermission } from "@/middleware/checkUserRolePermission";
import RequestService from "@/services/requestService";
import swaggerSpec from "@/swagger";
import Router from "koa-router";
import { koaSwagger } from "koa2-swagger-ui";

const requestService = new RequestService();
const requestController = new RequestController(requestService);

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

/**
 * @openapi
 * /api/v1/getOwnRequests?myId={INSERT ID HERE}:
 *   get:
 *     description: Get your own requests
 *     tags: [Request]
 *     parameters:
 *       - in: query
 *         name: myId
 *         schema:
 *           type: number
 *         required: true
 *         description: Retrieve lists of your requests regardless of status
 *     responses:
 *       200:
 *         description: Returns a request object
 */
router.get("/getOwnRequests", (ctx) => requestController.getOwnRequests(ctx));

/**
 * @openapi
 * /api/v1/getRequests?staffId={INSERT ID HERE}&status={INSERT STATUS HERE}:
 *   get:
 *     description: Get requests by staffId and status
 *     tags: [Request]
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: number
 *         required: true
 *         description: Retrieve lists of request by that particular staff
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED, WITHDRAWN]
 *         required: true
 *         description: The status of the request to filter by
 *     responses:
 *       200:
 *         description: Returns a request object
 */
router.get("/getRequests", (ctx) =>
  requestController.getRequestsByStaffIdAndStatus(ctx)
);

/**
 * @openapi
 * /api/v1/getCompanySchedule
 *   get:
 *     description: Get the entire company's schedule
 *     tags: [Request]
 *     parameters:
 *       - in: query
 *         name: myId
 *         schema:
 *           type: number
 *         required: true
 *         description: Retrieve lists of schedule
 *     responses:
 *       200:
 *         description: Returns a request object
 */
router.get("/getCompanySchedule", (ctx) =>
  requestController.getCompanySchedule(ctx)
);

export default router;
