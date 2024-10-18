import { errMsg, HttpStatusResponse } from "@/helpers";
import { numberSchema, reassignmentRequestSchema } from "@/schema";
import ReassignmentService from "@/services/ReassignmentService";
import { Context } from "koa";
import UtilsController from "./UtilsController";

class ReassignmentController {
  private reassignmentService: ReassignmentService;

  constructor(reassignmentService: ReassignmentService) {
    this.reassignmentService = reassignmentService;
  }

  public async insertReassignmentRequest(ctx: Context) {
    const reassignmentRequest = ctx.request.body;
    const validBody = reassignmentRequestSchema.safeParse(reassignmentRequest);
    if (!validBody.success) {
      ctx.body = {
        errMsg: validBody.error.format(),
      };
      return;
    }

    const result =
      await this.reassignmentService.insertReassignmentRequest(
        reassignmentRequest,
      );

    if (result === errMsg.ACTIVE_REASSIGNMENT) {
      ctx.body = {
        errMsg: errMsg.ACTIVE_REASSIGNMENT,
      };
    } else if (result === errMsg.TEMP_MANAGER_OCCUPED) {
      ctx.body = {
        errMsg: errMsg.TEMP_MANAGER_OCCUPED,
      };
    } else {
      ctx.body = HttpStatusResponse.OK;
    }
  }

  public async getReassignmentStatus(ctx: Context) {
    const { id } = ctx.request.header;
    if (!id) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_HEADER);
    }
    const sanitisedStaffId = numberSchema.parse(id);
    const reassignmentReq =
      await this.reassignmentService.getReassignmentStatus(sanitisedStaffId);

    ctx.body = reassignmentReq;
  }
}

export default ReassignmentController;
