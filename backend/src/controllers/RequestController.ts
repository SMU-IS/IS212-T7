import { errMsg, Status } from "@/helpers";
import { requestSchema } from "@/schema";
import RequestService from "@/services/requestService";
import { Context } from "koa";

class RequestController {
  private requestService: RequestService;

  constructor(requestService: RequestService) {
    this.requestService = requestService;
  }

  public async getOwnRequests(ctx: Context) {
    const { myId } = ctx.query;
    if (!myId) {
      ctx.body = {
        errMsg: errMsg.MISSING_PARAMETERS,
      };
      return;
    }

    const result = await this.requestService.getOwnRequests(Number(myId));
    ctx.body = result;
  }

  public async getRequestsByStaffIdAndStatus(ctx: Context) {
    const { staffId, status } = ctx.query;
    const validation = requestSchema.safeParse({ staffId, status });
    if (!validation.success) {
      ctx.body = {
        errMsg: validation.error.format(),
      };
      return;
    }

    const result = await this.requestService.getRequestsByStaffIdAndStatus(
      Number(staffId),
      status as Status
    );
    ctx.body = result;
  }

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

export default RequestController;
