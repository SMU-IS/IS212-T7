import UtilsController from "@/controllers/UtilsController";
import { errMsg } from "@/helpers";
import { LoginBody } from "@/models/Employee";
import EmployeeService from "@/services/EmployeeService";
import { Context } from "koa";

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

    const { staffId, role } = result;
    ctx.body = {
      staffId,
      role,
    };
  }
}

export default EmployeeController;
