import ReassignmentDb from "@/database/ReassignmentDb";
import { Action, PerformedBy, Request, Status } from "@/helpers";
import EmployeeService from "./EmployeeService";
import LogService from "./LogService";

class ReassignmentService {
  private reassignmentDb: ReassignmentDb;
  private employeeService: EmployeeService;
  private logService: LogService;

  constructor(
    reassignmentDb: ReassignmentDb,
    employeeService: EmployeeService,
    logService: LogService,
  ) {
    this.reassignmentDb = reassignmentDb;
    this.employeeService = employeeService;
    this.logService = logService;
  }

  public async insertReassignmentRequest(
    reassignmentRequest: any,
  ): Promise<void> {
    const { staffId, tempReportingManagerId } = reassignmentRequest;
    const currentManager = await this.employeeService.getEmployee(staffId);
    const tempReportingManager = await this.employeeService.getEmployee(
      tempReportingManagerId,
    );

    const request = {
      ...reassignmentRequest,
      staffName: `${currentManager!.staffFName} ${currentManager!.staffLName}`,
      tempManagerName: `${tempReportingManager!.staffFName} ${tempReportingManager!.staffLName}`,
      status: Status.PENDING,
      active: null,
    };

    await this.reassignmentDb.insertReassignmentRequest(request);
  }

  public async getReassignmentStatus(staffId: number) {
    const { staffFName, staffLName }: any =
      await this.employeeService.getEmployee(staffId);
    await this.reassignmentDb.getReassignmentRequest(staffId);

    const staffName = `${staffFName} ${staffLName}`;
    /**
     * Logging
     */
    await this.logService.logRequestHelper({
      performedBy: staffId,
      requestType: Request.REASSIGNMENT,
      action: Action.RETRIEVE,
      staffName: staffName,
    });
  }

  public async setActiveReassignmentPeriod(): Promise<void> {
    const isActiveUpdated =
      await this.reassignmentDb.setActiveReassignmentPeriod();
    if (isActiveUpdated) {
      /**
       * Logging
       */
      await this.logService.logRequestHelper({
        performedBy: PerformedBy.SYSTEM,
        requestType: Request.REASSIGNMENT,
        action: Action.SET_ACTIVE,
      });
    }
  }

  public async setInactiveReassignmentPeriod(): Promise<void> {
    const isActiveUpdated =
      await this.reassignmentDb.setInactiveReassignmentPeriod();
    if (isActiveUpdated) {
      /**
       * Logging
       */
      await this.logService.logRequestHelper({
        performedBy: PerformedBy.SYSTEM,
        requestType: Request.REASSIGNMENT,
        action: Action.SET_INACTIVE,
      });
    }
  }
}

export default ReassignmentService;
