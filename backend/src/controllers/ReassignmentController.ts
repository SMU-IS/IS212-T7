import { HttpStatusResponse } from "@/helpers";
import { reassignmentRequestSchema } from "@/schema";
import ReassignmentService from "@/services/ReassignmentService";
import { Context } from "koa";

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

    await this.reassignmentService.insertReassignmentRequest(
      reassignmentRequest,
    );
    ctx.body = HttpStatusResponse.OK;
  }
}

export default ReassignmentController;
