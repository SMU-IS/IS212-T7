<<<<<<< HEAD
import { errMsg } from "@/helpers";
=======
import { errMsg, Status } from "@/helpers";
import { requestSchema } from "@/schema";
>>>>>>> IS212-30-BE-GET-Schedule-API
import RequestService from "@/services/requestService";
import { Context } from "koa";

class RequestController {
<<<<<<< HEAD
  private requestService = new RequestService();

  // get Request Details
  public async getRequest(ctx: Context) {
    const { requestId } = ctx.query;
    if (!requestId) {
      ctx.body = {
        test: errMsg.MISSING_PARAMETERS,
        err: requestId,
=======
  private requestService: RequestService;

  constructor(requestService: RequestService) {
    this.requestService = requestService;
  }

  public async getOwnRequests(ctx: Context) {
    const { myId } = ctx.query;
    if (!myId) {
      ctx.body = {
        errMsg: errMsg.MISSING_PARAMETERS,
>>>>>>> IS212-30-BE-GET-Schedule-API
      };
      return;
    }

<<<<<<< HEAD
    const result = await this.requestService.getRequest(Number(requestId));
    ctx.body = result;
  }

  // Post Request Details
=======
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

  public async getCompanySchedule(ctx: Context) {
    const result = await this.requestService.getCompanySchedule();
    ctx.body = result;
  }

>>>>>>> IS212-30-BE-GET-Schedule-API
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

<<<<<<< HEAD
export default new RequestController();
=======
export default RequestController;
>>>>>>> IS212-30-BE-GET-Schedule-API
