import UtilsController from "@/controllers/UtilsController";
import { errMsg } from "@/helpers";
import { LoginBody } from "@/models/Employee";
import EmployeeService from "@/services/EmployeeService";
import { Context } from "koa";
import { numberSchema } from "@/schema";

class EmployeeController {
  private employeeService: EmployeeService;

  constructor(employeeService: EmployeeService) {
    this.employeeService = employeeService;
  }

  public async getEmployee(ctx: Context) {
    const { staffId } = ctx.query;
    if (!staffId) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_PARAMETERS);
    }

    const result = await this.employeeService.getEmployee(Number(staffId));
    ctx.body = result;
  }

  public async getEmployeeByEmail(ctx: Context) {
    const { staffEmail, staffPassword } = ctx.request.body as LoginBody;

    if (!staffEmail || !staffPassword) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_PARAMETERS);
    }

    const result = await this.employeeService.getEmployeeByEmail(
      String(staffEmail),
      String(staffPassword)
    );

    if (result == errMsg.USER_DOES_NOT_EXIST) {
      return UtilsController.throwAPIError(ctx, errMsg.USER_DOES_NOT_EXIST);
    }

    if (result == errMsg.WRONG_PASSWORD) {
      return UtilsController.throwAPIError(ctx, errMsg.WRONG_PASSWORD);
    }

    const {
      staffId,
      staffFName,
      staffLName,
      dept,
      position,
      email,
      reportingManager,
      reportingManagerName,
      role,
      tempReportingManager,
      tempReportingManagerName,
    } = result;

    const name = `${staffFName} ${staffLName}`;

    ctx.body = {
      staffId,
      name,
      dept,
      position,
      email,
      reportingManager,
      reportingManagerName,
      role,
      tempReportingManager,
      tempReportingManagerName,
    };
  }

  public async getDeptScheduleByStaffId(ctx: Context) {
    const { staffId } = ctx.query;
    const validation = numberSchema.safeParse(staffId);
    if (!validation.success) {
      ctx.body = {
        errMsg: validation.error.format(),
      };
      return;
    }

    ctx.body = await this.employeeService.getDeptScheduleByStaffId(Number(staffId));
  }
}

export default EmployeeController;
