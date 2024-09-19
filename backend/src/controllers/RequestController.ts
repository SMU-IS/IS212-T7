import { errMsg } from "@/helpers";
import RequestService from "@/services/requestService";
import { Context } from "koa";

class RequestController {
  private requestService = new RequestService();

  // get Request Details
  public async getRequest(ctx: Context) {
    const { requestId } = ctx.query;
    if (!requestId) {
      ctx.body = {
        test: errMsg.MISSING_PARAMETERS,
        err: requestId,
      };
      return;
    }

    const result = await this.requestService.getRequest(Number(requestId));
    ctx.body = result;
  }

  // Post Request Details
  public async postRequest(ctx: any) {
    const { requestDetails } = ctx.request.body;
    if (!requestDetails) {
      ctx.body = {
        error: errMsg.MISSING_PARAMETERS,
      };
      return;
    }
    // might need to convert input to json
    const result = await this.requestService.postRequest(requestDetails);
    ctx.body = result;
  }
}

export default new RequestController();
