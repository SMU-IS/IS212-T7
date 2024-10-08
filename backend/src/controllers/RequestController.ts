import UtilsController from "@/controllers/UtilsController";
import {
  Dept,
  errMsg,
  HttpStatusResponse,
  noteMsg,
  successMsg,
} from "@/helpers";
import {
  deptSchema,
  requestSchema,
  teamSchema,
  approvalSchema,
} from "@/schema";
import RequestService from "@/services/RequestService";
import { Context } from "koa";

interface ResponseMessage {
  success: {
    message: string;
    dates: [string, string][];
  };
  note: {
    message: string;
    dates: [string, string][];
  };
  error: {
    message: string;
    dates: [string, string][];
  };
}

class RequestController {
  private requestService: RequestService;

  constructor(requestService: RequestService) {
    this.requestService = requestService;
  }

  public async cancelPendingRequests(ctx: Context) {
    const { staffId, requestId } = ctx.request.body as any;
    const result = await this.requestService.cancelPendingRequests(
      Number(staffId),
      Number(requestId)
    );

    ctx.body =
      result == HttpStatusResponse.OK
        ? HttpStatusResponse.OK
        : HttpStatusResponse.NOT_MODIFIED;
  }

  public async getPendingRequests(ctx: Context) {
    const { id } = ctx.request.header;
    const pendingRequests = await this.requestService.getPendingRequests(
      Number(id)
    );
    ctx.body = pendingRequests;
  }

  public async getOwnPendingRequests(ctx: Context) {
    const { myId } = ctx.query;
    if (!myId) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_PARAMETERS);
    }
    const pendingRequests = await this.requestService.getOwnPendingRequests(
      Number(myId)
    );
    ctx.body = pendingRequests;
  }

  public async getMySchedule(ctx: Context) {
    const { myId } = ctx.query;
    if (!myId) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_PARAMETERS);
    }

    const result = await this.requestService.getMySchedule(Number(myId));
    ctx.body = result;
  }

  public async getTeamSchedule(ctx: Context) {
    const { reportingManager, dept } = ctx.query;
    const validation =
      teamSchema.safeParse({ reportingManager }) &&
      deptSchema.safeParse({ dept });

    if (!validation.success) {
      ctx.body = {
        errMsg: validation.error.format(),
      };
      return;
    }

    const result = await this.requestService.getTeamSchedule(
      Number(reportingManager),
      dept as Dept
    );
    ctx.body = result;
  }

  public async getDeptSchedule(ctx: Context) {
    const { dept } = ctx.query;
    const validation = deptSchema.safeParse({ dept });
    if (!validation.success) {
      ctx.body = {
        errMsg: validation.error.format(),
      };
      return;
    }

    const result = await this.requestService.getDeptSchedule(dept as Dept);
    ctx.body = result;
  }

  public async getCompanySchedule(ctx: Context) {
    const result = await this.requestService.getCompanySchedule();
    ctx.body = result;
  }

  public async postRequest(ctx: any) {
    const requestDetails = ctx.request.body;
    const validation = requestSchema.safeParse(requestDetails);
    if (!validation.success) {
      ctx.body = {
        errMsg: validation.error.format(),
      };
      return;
    }
    const result = await this.requestService.postRequest(requestDetails);
    let responseMessage: ResponseMessage = {
      success: { message: "", dates: [] },
      error: { message: "", dates: [] },
      note: { message: "", dates: [] },
    };

    if (result.successDates.length > 0) {
      responseMessage.success = {
        message: successMsg,
        dates: result.successDates,
      };
    }

    if (result.errorDates.length > 0) {
      responseMessage.error = {
        message: errMsg.SAME_DAY_REQUEST,
        dates: result.errorDates,
      };
    }

    if (result.noteDates.length > 0) {
      responseMessage.note = {
        message: noteMsg,
        dates: result.noteDates,
      };
    }

    ctx.body = responseMessage;
  }

  public async approveRequest(ctx: Context) {
    const approvalDetails = ctx.request.body;
    const validation = approvalSchema.safeParse(approvalDetails);
    if (!validation.success) {
      ctx.body = {
        errMsg: validation.error.format(),
      };
      return;
    }
    const { performedBy, requestId } = approvalDetails as any;
    const result = await this.requestService.approveRequest(
      Number(performedBy),
      Number(requestId)
    );
    ctx.body =
      result == HttpStatusResponse.OK
        ? HttpStatusResponse.OK
        : HttpStatusResponse.NOT_MODIFIED;
  }
}

export default RequestController;
