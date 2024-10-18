import UtilsController from "@/controllers/UtilsController";
import { errMsg, HttpStatusResponse } from "@/helpers";
import WithdrawalService from "@/services/WithdrawalService";
import { Context } from "koa";

class WithdrawalController {
  private withdrawalService: WithdrawalService;

  constructor(withdrawalService: WithdrawalService) {
    this.withdrawalService = withdrawalService;
  }

  public async withdrawRequest(ctx: Context) {
    const { requestId } = ctx.request.body as any;
    if (!requestId) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_PARAMETERS);
    }
    const result = await this.withdrawalService.withdrawRequest(
      Number(requestId),
    );

    ctx.body =
      result == HttpStatusResponse.OK
        ? HttpStatusResponse.OK
        : HttpStatusResponse.NOT_MODIFIED;
  }
}

export default WithdrawalController;
