import { Context } from "koa";

class UtilsController {
  public static throwAPIError(ctx: Context, errorMessage: string) {
    ctx.body = { error: errorMessage };
  }
}

export default UtilsController;
