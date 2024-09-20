import EmployeeController from "@/controllers/EmployeeController";
import RequestController from "@/controllers/RequestController";
import { AccessControl } from "@/helpers";
import { checkUserRolePermission } from "@/middleware/checkUserRolePermission";
import EmployeeService from "@/services/employeeService";
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

const employeeService = new EmployeeService();
const employeeController = new EmployeeController(employeeService);

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
  (ctx) => employeeController.getEmployee(ctx)
);

router.post("/login", (ctx) => employeeController.getEmployeeByEmail(ctx));

/**
 * @openapi
 * /api/v1/getMySchedule?myId={INSERT ID HERE}:
 *   get:
 *     description: Get your own schedule
 *     tags: [Schedule]
 *     parameters:
 *       - in: query
 *         name: myId
 *         schema:
 *           type: number
 *         required: true
 *         description: Retrieve lists of your schedule regardless of status
 *     responses:
 *       200:
 *         description: Returns a request object
 */
router.get("/getMySchedule", (ctx) => requestController.getMySchedule(ctx));

/**
 * @openapi
 * /api/v1/getTeamSchedule?reportingManager={INSERT ID HERE}:
 *   get:
 *     description: Get your own team's schedule
 *     tags: [Schedule]
 *     parameters:
 *       - in: query
 *         name: reportingManager
 *         schema:
 *           type: number
 *         required: true
 *         description: Retrieve lists of your team's schedule that are approved
 *     responses:
 *       200:
 *         description: Returns a request object
 */
router.get("/getTeamSchedule", (ctx) => requestController.getTeamSchedule(ctx));

/**
 * @openapi
 * /api/v1/getDeptSchedule?dept={INSERT DEPT HERE}:
 *   get:
 *     description: Get your own dept's schedule
 *     tags: [Schedule]
 *     parameters:
 *       - in: query
 *         name: dept
 *         schema:
 *           type: string
 *           enum: [CEO, Consultancy, Engineering, Finance, HR, IT, Sales, Solutioning ]
 *         required: true
 *         description: Retrieve lists of request by that dept
 *     responses:
 *       200:
 *         description: Returns a request object
 */
router.get("/getDeptSchedule", (ctx) => requestController.getDeptSchedule(ctx));

/**
 * @openapi
 * /api/v1/getCompanySchedule:
 *   get:
 *     description: Get the entire company's schedule where status is approved
 *     tags: [Schedule]
 *     parameters:
 *       - in: query
 *         name: myId
 *         schema:
 *           type: number
 *         required: true
 *         description: Retrieve lists of schedule that are approved
 *     responses:
 *       200:
 *         description: Returns a request object
 */
router.get("/getCompanySchedule", (ctx) =>
  requestController.getCompanySchedule(ctx)
);

/**
 * @openapi
 * /api/v1/postRequest:
 *   post:
 *     description: Post Request data (Submit WFH application form)
 *     tags: [Request]
 *     parameters:
 *       - in: WFH Application Details
 *     responses:
 *       200:
 *         description: Returns an Promise object
 */
router.post("/postRequest", async (ctx) => {
  await requestController.postRequest(ctx);
});

export default router;
