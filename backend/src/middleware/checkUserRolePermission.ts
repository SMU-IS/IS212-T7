import { AccessControl, errMsg } from "@/helpers";
import { Context, Next } from "koa";

// TODO: Add more permission
const PERMISSIONS: Record<string, string[]> = {
  1: [AccessControl.VIEW_OWN_SCHEDULE, AccessControl.VIEW_OVERALL_SCHEDULE],
  2: [AccessControl.VIEW_OWN_SCHEDULE],
  3: [AccessControl.VIEW_OWN_SCHEDULE, AccessControl.VIEW_OVERALL_SCHEDULE],
};

export const checkUserRolePermission = (action: AccessControl) => {
  return async (ctx: Context, next: Next) => {
    const { roleId } = ctx.request.query;

    if (!roleId) {
      ctx.status = 404;
      ctx.body = {
        error: errMsg.MISSING_PARAMETERS,
      };
      return;
    }

    if (!PERMISSIONS[Number(roleId)].includes(action)) {
      ctx.status = 403;
      ctx.body = {
        error: errMsg.UNAUTHORISED,
      };
      return;
    }

    await next();
  };
};
