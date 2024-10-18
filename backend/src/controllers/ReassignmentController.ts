import { errMsg, HttpStatusResponse } from "@/helpers";
import { numberSchema, reassignmentRequestSchema } from "@/schema";
import ReassignmentService from "@/services/ReassignmentService";
import { Context } from "koa";
import UtilsController from "./UtilsController";
import { IHandleReassignment } from "@/models/Reassignment";

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

  public async getIncomingReassignmentRequests(ctx: Context) {
    const { id } = ctx.request.header;
    if (!id) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_HEADER);
    }
    const sanitisedStaffId = numberSchema.parse(id);
    const incomingRequests =
     await this.reassignmentService.getIncomingReassignmentRequests(sanitisedStaffId);

    ctx.body = incomingRequests;
  }

  public async handleReassignmentRequest(ctx: Context) {
    const { id: staffId } = ctx.request.header;
    const { reassignmentId, action } = ctx.request.body as IHandleReassignment;

    if (!staffId) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_HEADER);
    }

    if (!reassignmentId || !action) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_PARAMETERS);
    }

    const sanitisedStaffId = numberSchema.parse(staffId.toString());
    const sanitisedReassignmentId = numberSchema.parse(reassignmentId.toString());

    if (action !== 'approve' && action !== 'reject') {
      return UtilsController.throwAPIError(ctx, errMsg.INVALID_ACTION);
    }

    try {
      await this.reassignmentService.handleReassignmentRequest(
        sanitisedStaffId,
        sanitisedReassignmentId,
        action
      );
      ctx.body = HttpStatusResponse.OK;
    } catch (error) {
      console.log(error)
      ctx.status = 400;
      ctx.body = { error: "An error has occured!" };
    }
  }

  public getSubordinateRequestsForTempManager = async (ctx: Context) => {
    const { id } = ctx.request.header;
    
    if (!id) {
      return UtilsController.throwAPIError(ctx, errMsg.MISSING_HEADER);
    }

    const sanitisedStaffId = numberSchema.parse(id);

    try {
      const subordinateRequests = await this.reassignmentService.getSubordinateRequestsForTempManager(sanitisedStaffId);

      if (subordinateRequests === null) {
        ctx.status = 404;
        ctx.body = { message: 'No active reassignment found for the staff member as temp manager' };
        return;
      }

      ctx.body = subordinateRequests;
    } catch (error) {
      console.error('Error in getSubordinateRequestsForTempManager:', error);
      ctx.status = 500;
      ctx.body = { message: 'Internal server error' };
    }
  }
  


}


export default ReassignmentController;
