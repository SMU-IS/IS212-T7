import { AccessControl, errMsg, PERMISSIONS } from "@/helpers";
import { numberSchema } from "@/schema";
import EmployeeService from "@/services/employeeService";
import { Context, Next } from "koa";

const employeeService = new EmployeeService();

export const checkUserRolePermission = (action: AccessControl) => {
  return async (ctx: Context, next: Next) => {
    const { staffId } = ctx.request.query;
    if (!staffId) {
      ctx.status = 404;
      ctx.body = {
        error: errMsg.MISSING_PARAMETERS,
      };
      return;
    }

    const sanitisedStaffId = numberSchema.parse(staffId);
    const employee = await employeeService.getEmployee(sanitisedStaffId);

    if (!employee) {
      ctx.status = 404;
      ctx.body = {
        error: errMsg.USER_DOES_NOT_EXIST,
      };
      return;
    }

    if (!PERMISSIONS[employee.role].includes(action)) {
      ctx.status = 403;
      ctx.body = {
        error: errMsg.UNAUTHORISED,
      };
      return;
    }

    await next();
  };
};
