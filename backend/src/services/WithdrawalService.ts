import RequestService from "./RequestService";
import WithdrawalDb from "@/database/WithdrawalDb";
import { HttpStatusResponse, Request, Action, Dept } from "@/helpers";
import {
  checkPastWithdrawalDate,
  checkValidWithdrawalDate,
} from "@/helpers/date";
import LogService from "./LogService";

class WithdrawalService {
  private logService: LogService;
  private withdrawalDb: WithdrawalDb;
  private requestService: RequestService;

  constructor(
    logService: LogService,
    withdrawalDb: WithdrawalDb,
    requestService: RequestService,
  ) {
    this.logService = logService;
    this.withdrawalDb = withdrawalDb;
    this.requestService = requestService;
  }

  public async getWithdrawalRequest(requestId: number) {
    const request = await this.withdrawalDb.getWithdrawalRequest(
      Number(requestId),
    );
    if (request.length < 1) {
      return null;
    }
    return request;
  }

  public async withdrawRequest(requestId: number): Promise<string | null> {
    const request = await this.requestService.getApprovedRequestByRequestId(
      Number(requestId),
    );
    if (!request) {
      return null;
    }
    const withdrawals = await this.getWithdrawalRequest(Number(requestId));

    if (withdrawals) {
      const hasNoApprovedOrPending = withdrawals.every(
        (obj) => obj.status !== "APPROVED" && obj.status !== "PENDING",
      );
      if (!hasNoApprovedOrPending) {
        return null;
      }
    }

    const {
      staffId,
      staffName,
      reportingManager,
      managerName,
      dept,
      position,
      requestedDate,
    } = request!;

    if (
      checkPastWithdrawalDate(requestedDate) &&
      !checkValidWithdrawalDate(requestedDate)
    ) {
      return null;
    }

    const document = {
      requestId: requestId,
      staffId: staffId,
      staffName: staffName,
      reportingManager,
      managerName,
      dept,
      position,
    };
    const result = await this.withdrawalDb.withdrawRequest(document);
    if (!result) {
      return null;
    }
    await this.logService.logRequestHelper({
      performedBy: staffId,
      requestType: Request.WITHDRAWAL,
      action: Action.APPLY,
      dept: dept as Dept,
      position: position,
      requestId: requestId,
      staffName: staffName,
      reportingManagerId: reportingManager as any,
      managerName: managerName,
    });
    return HttpStatusResponse.OK;
  }
}
export default WithdrawalService;
