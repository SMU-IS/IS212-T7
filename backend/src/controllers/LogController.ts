import UtilsController from "@/controllers/UtilsController";
import { errMsg } from "@/helpers";
import { numberSchema } from "@/schema";
import LogService from "@/services/LogService";
import { Context } from "koa";

class LogController {
  private logService: LogService;

  constructor(logService: LogService) {
    this.logService = logService;
  }

  public async getAllLogs(ctx: Context) {
    const { staffId } = ctx.query;
    if (!staffId) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_PARAMETERS);
    }
    const sanitisedStaffId = numberSchema.parse(staffId);
    const result = await this.logService.getLogsByStaffId(sanitisedStaffId);

    ctx.body = result;
  }
}

export default LogController;
