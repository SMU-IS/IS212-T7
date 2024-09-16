import { errMsg } from "@/helpers";
import EmployeeService from "@/services/employeeService";
import { Context } from "koa";

class EmployeeController {
  private employeeService = new EmployeeService();

  public async getEmployee(ctx: Context) {
    const { staffId } = ctx.query;
    if (!staffId) {
      ctx.body = {
        error: errMsg.MISSING_PARAMETERS,
      };
      return;
    }

    const result = await this.employeeService.getEmployee(Number(staffId));
    ctx.body = result;
  }
}

export default new EmployeeController();
