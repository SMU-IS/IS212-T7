import { Dept, errMsg, successMsg, noteMsg } from "@/helpers";
import { deptSchema, requestSchema, teamSchema } from "@/schema";
import RequestService from "@/services/RequestService";
import UtilsController from "@/controllers/UtilsController";
import { Context } from "koa";

interface MessageDates {
  message: string;
  dates: [string, string][];
}

interface ResponseMessage {
  success: MessageDates;
  error: MessageDates[];
  note: MessageDates;
}

class RequestController {
  private requestService: RequestService;

  constructor(requestService: RequestService) {
    this.requestService = requestService;
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
      error: [], // Correctly initialized as an array of objects
      note: { message: "", dates: [] },
    };

    if (result.successDates.length > 0) {
      responseMessage.success = {
        message: successMsg,
        dates: result.successDates,
      };
    }

    if (result.weekendDates.length > 0) {
      responseMessage.error.push({
        message: errMsg.WEEKEND_REQUEST,
        dates: result.weekendDates,
      });
    }

    if (result.pastDates.length > 0) {
      responseMessage.error.push({
        message: errMsg.PAST_DATE,
        dates: result.pastDates,
      });
    }

    if (result.pastDeadlineDates.length > 0) {
      responseMessage.error.push({
        message: errMsg.PAST_DEADLINE,
        dates: result.pastDeadlineDates,
      });
    }

    if (result.errorDates.length > 0) {
      responseMessage.error.push({
        message: errMsg.SAME_DAY_REQUEST,
        dates: result.errorDates,
      });
    }

    if (result.duplicateDates.length > 0) {
      responseMessage.error.push({
        message: errMsg.DUPLICATE_DATE,
        dates: result.duplicateDates,
      });
    }

    if (result.insertErrorDates.length > 0) {
      responseMessage.error.push({
        message: errMsg.INSERT_ERROR,
        dates: result.insertErrorDates,
      });
    }

    if (result.noteDates.length > 0) {
      responseMessage.note = {
        message: noteMsg,
        dates: result.noteDates,
      };
    }

    ctx.body = responseMessage;
  }
}

export default RequestController;
