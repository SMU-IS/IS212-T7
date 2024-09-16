import { AccessControl, errMsg, PERMISSIONS } from "@/helpers";
import { roleIdSchema } from "@/schema";
import { Context, Next } from "koa";

export const checkUserRolePermission = (action: AccessControl) => {
  return async (ctx: Context, next: Next) => {
    const { roleId } = ctx.request.query;
    const { success, data } = roleIdSchema.safeParse(roleId);

    if (!roleId) {
      ctx.status = 404;
      ctx.body = {
        error: errMsg.MISSING_PARAMETERS,
      };
      return;
    }

    if (!success) {
      ctx.status = 400;
      ctx.body = {
        error: errMsg.INVALID_ROLE_ID,
      };
      return;
    }

    if (!PERMISSIONS[data].includes(action)) {
      ctx.status = 403;
      ctx.body = {
        error: errMsg.UNAUTHORISED,
      };
      return;
    }

    await next();
  };
};
