import EmployeeController from "@/controllers/EmployeeController";
import RequestController from "@/controllers/RequestController";
import EmployeeDb from "@/database/EmployeeDb";
import RequestDb from "@/database/RequestDb";
import { AccessControl } from "@/helpers";
import { checkSameTeam } from "@/middleware/checkSameTeam";
import { checkUserRolePermission } from "@/middleware/checkUserRolePermission";
import EmployeeService from "@/services/EmployeeService";
import RequestService from "@/services/RequestService";
import swaggerSpec from "@/swagger";
import Router from "koa-router";
import { koaSwagger } from "koa2-swagger-ui";

/**
 * Databases
 */
const requestDb = new RequestDb();
const employeeDb = new EmployeeDb();

/**
 * Services
 */
const requestService = new RequestService(requestDb);
const employeeService = new EmployeeService(employeeDb);

/**
 * Controllers
 */
const requestController = new RequestController(requestService);
const employeeController = new EmployeeController(employeeService);

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
 * /api/v1/login:
 *   post:
 *     description: Login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffEmail:
 *                 type: string
 *                 description: The email of the employee
 *               staffPassword:
 *                 type: string
 *                 description: The password of the employee
 *             required:
 *               - staffEmail
 *               - staffPassword
 *     responses:
 *       200:
 *         description: Returns an employee object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 staffId:
 *                   type: number
 *                   description: The employee's ID
 *                 role:
 *                   type: string
 *                   description: The employee's role
 *       400:
 *         description: Invalid request or missing parameters
 */
router.post("/login", (ctx) => employeeController.getEmployeeByEmail(ctx));

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

router.get("/getEmployee", (ctx) => employeeController.getEmployee(ctx));

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
 * /api/v1/getTeamSchedule?reportingManager={INSERT ID HERE}&dept={INSERT DEPARTMENT HERE}:
 *   get:
 *     description: Get your own team's schedule
 *     tags: [Schedule]
 *     parameters:
 *       - in: query
 *         name: reportingManager
 *         schema:
 *           type: number
 *         required: true
 *         description: Reporting manager Id
 *       - in: query
 *         name: dept
 *         schema:
 *           type: string
 *           enum: [CEO, Consultancy, Engineering, Finance, HR, IT, Sales, Solutioning]
 *         required: true
 *         description: User's department
 *       - in: header
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User's staffId
 *     responses:
 *       200:
 *         description: Returns a request object
 */
router.get("/getTeamSchedule", checkSameTeam(), (ctx) =>
  requestController.getTeamSchedule(ctx)
);

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
 *           enum: [CEO, Consultancy, Engineering, Finance, HR, IT, Sales, Solutioning]
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
router.get(
  "/getCompanySchedule",
  checkUserRolePermission(AccessControl.VIEW_OVERALL_SCHEDULE),
  (ctx) => requestController.getCompanySchedule(ctx)
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
 *         description: Returns an success, error, note object
 */
router.post("/postRequest", async (ctx) => {
  await requestController.postRequest(ctx);
});

/**
 * @openapi
 * /api/v1/approveRequest:
 *   post:
 *     description: approve subordinates' pending requests
 *     tags: [Pending Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               performedBy:
 *                 type: number
 *                 description: Manager's own staffId
 *               requestId:
 *                 type: string
 *                 description: RequestId to be approved
 *             required:
 *               - performedBy
 *               - requestId
 */
router.post("/approveRequest", (ctx) => requestController.approveRequest(ctx));

export default router;
