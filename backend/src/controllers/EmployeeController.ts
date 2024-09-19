import { errMsg } from "@/helpers";
import EmployeeService from "@/services/employeeService";
import { Context } from "koa";

class EmployeeController {
  private employeeService: EmployeeService;

  constructor(employeeService: EmployeeService) {
    this.employeeService = employeeService;
  }

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

  public async getEmployeeByEmail(ctx: Context) {
    interface LoginBody {
      staffEmail: string,
      staffPassword: string
    }

    const body = ctx.request.body as LoginBody;
    let staffEmail = body.staffEmail;
    let staffPassword = body.staffPassword;

    // console.log("Staff Email: " + staffEmail);
    // console.log("Staff Password: "+ staffPassword);

    if (!staffEmail || !staffPassword) {
      ctx.body = {
        error: errMsg.MISSING_PARAMETERS,
      };
      return;
    }

    const employeeData = await this.employeeService.getEmployeeByEmail(String(staffEmail));

    if (employeeData == null) {
      ctx.body = {
        error: errMsg.EMPLOYEE_NOT_FOUND
      }
      return;
    }

    ctx.body = {
      staffId: employeeData.staffId,
      role: employeeData.role
    }
  }
}

export default EmployeeController;
