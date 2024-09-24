import { Dept, errMsg, successMsg, noteMsg } from "@/helpers";
import { deptSchema, teamSchema } from "@/schema";
import RequestService from "@/services/requestService";
import { Context } from "koa";

interface ResponseMessage {
  success: {
    message: string;
    dates: [Date, string][];
  };
  note: {
    message: string;
    dates: [Date, string][];
  };
  error: {
    message: string;
    dates: [Date, string][];
  };
}

class RequestController {
  private requestService: RequestService;

  constructor(requestService: RequestService) {
    this.requestService = requestService;
  }

  public async getMySchedule(ctx: Context) {
    const { myId } = ctx.query;
    if (!myId) {
      ctx.body = {
        errMsg: errMsg.MISSING_PARAMETERS,
      };
      return;
    }

    const result = await this.requestService.getMySchedule(Number(myId));
    ctx.body = result;
  }

  public async getTeamSchedule(ctx: Context) {
    const { reportingManager } = ctx.query;
    const validation = teamSchema.safeParse({ reportingManager });
    if (!validation.success) {
      ctx.body = {
        errMsg: validation.error.format(),
      };
      return;
    }

    const result = await this.requestService.getTeamSchedule(
      Number(reportingManager)
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
    if (!requestDetails) {
      ctx.body = {
        error: errMsg.MISSING_PARAMETERS,
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
        message: successMsg.APPLICATION_SUCCESS,
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
        message: noteMsg.REQUEST_LIMIT,
        dates: result.noteDates,
      };
    }

    ctx.body = responseMessage;
  }
}

export default RequestController;
