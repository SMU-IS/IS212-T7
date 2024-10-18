import ReassignmentDb from "@/database/ReassignmentDb";
import { errMsg, Status } from "@/helpers";
import EmployeeService from "./EmployeeService";

class ReassignmentService {
  private reassignmentDb: ReassignmentDb;
  private employeeService: EmployeeService;

  constructor(
    reassignmentDb: ReassignmentDb,
    employeeService: EmployeeService,
  ) {
    this.reassignmentDb = reassignmentDb;
    this.employeeService = employeeService;
  }

  public async insertReassignmentRequest(
    reassignmentRequest: any,
  ): Promise<any> {
    const { staffId, tempReportingManagerId } = reassignmentRequest;
    const currentManager = await this.employeeService.getEmployee(staffId);
    const tempReportingManager = await this.employeeService.getEmployee(
      tempReportingManagerId,
    );

    // Check if there is any active reassignment between Manager A and Manager B
    const activeReassignmentReq =
      await this.reassignmentDb.getReassignmentActive(
        staffId,
        tempReportingManagerId,
      );

    if (!!activeReassignmentReq) {
      return errMsg.ACTIVE_REASSIGNMENT;
    }

    // Check if Manager B is occupied
    const tempManagerReassignmentReq =
      await this.reassignmentDb.getActiveReassignmentAsTempManager(
        tempReportingManagerId,
      );

    if (!!tempManagerReassignmentReq) {
      return errMsg.TEMP_MANAGER_OCCUPED;
    }

    const request = {
      ...reassignmentRequest,
      staffName: `${currentManager!.staffFName} ${currentManager!.staffLName}`,
      originalManagerDept: currentManager!.dept,
      tempManagerName: `${tempReportingManager!.staffFName} ${tempReportingManager!.staffLName}`,
      status: Status.PENDING,
      active: null,
    };

    await this.reassignmentDb.insertReassignmentRequest(request);
  }

  public async getReassignmentStatus(staffId: number) {
    return await this.reassignmentDb.getReassignmentRequest(staffId);
  }

  public async getReassignmentActive(
    staffId: number,
    tempReportingManagerId: number,
  ) {
    const activeFlag = await this.reassignmentDb.getReassignmentActive(
      staffId,
      tempReportingManagerId,
    );
    return activeFlag;
  }

  public async getActiveReassignmentAsTempManager(staffId: number) {
    const activeReassignments =
      await this.reassignmentDb.getActiveReassignmentAsTempManager(staffId);
    return activeReassignments;
  }

  public async getIncomingReassignmentRequests(staffId: number) {
    return await this.reassignmentDb.getIncomingReassignmentRequests(staffId);
  }

  public async getSubordinateRequestsForTempManager(staffId: number) {
    const result = await this.reassignmentDb.getSubordinateRequestsForTempManager(staffId);
    return result
  }

  public async handleReassignmentRequest(
    staffId: number,
    reassignmentId: number,
    action: 'approve' | 'reject'
  ): Promise<void> {
    const reassignment = await this.reassignmentDb.getIncomingReassignmentRequests(staffId);

    if (!reassignment) {
      throw new Error('Reassignment request not found');
    }

    if (reassignment[0].tempReportingManagerId !== staffId) {
      throw new Error('Unauthorized to perform this action');
    }

    if (reassignment[0].status !== Status.PENDING) {
      throw new Error('This request has already been processed');
    }

    const newStatus = action === 'approve' ? Status.APPROVED : Status.REJECTED;
   
    await this.reassignmentDb.updateReassignmentStatus(reassignmentId, newStatus);
  }

}
  


export default ReassignmentService;
