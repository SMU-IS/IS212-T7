import LogDb from "@/database/LogDb";
import { Action, PerformedBy, Request } from "@/helpers";

interface iLogRequest {
  performedBy: PerformedBy | string;
  requestType: Request;
  action: Action;
  requestId?: number;
  reason?: string;
  staffName?: string;
  reportingManagerId?: number;
  managerName?: string;
}

class LogService {
  private logDb: LogDb;

  constructor(logDb: LogDb) {
    this.logDb = logDb;
  }

  public async logRequestHelper(options: iLogRequest) {
    /**
     * Logging
     */
    const {
      performedBy,
      requestType,
      action,
      requestId = null,
      reason = null,
      staffName = null,
      reportingManagerId = null,
      managerName = null,
    } = options;

    const actionTaken = {
      performedBy,
      requestType,
      action,
      requestId,
      reason,
      staffName,
      reportingManagerId,
      managerName,
    };

    await this.logActions(actionTaken);
  }

  public async logActions(logAction: any): Promise<void> {
    const log = {
      ...logAction,
    };

    await this.logDb.logAction(log);
  }

  public async getLogsByStaffId(staffId: number) {
    return await this.logDb.getLogs(staffId);
  }
}

export default LogService;
