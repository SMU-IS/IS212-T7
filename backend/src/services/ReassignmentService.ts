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

    const activeReassignmentReq =
      await this.reassignmentDb.getReassignmentActive(
        staffId,
        tempReportingManagerId,
      );

    if (!!activeReassignmentReq) {
      return errMsg.ACTIVE_REASSIGNMENT;
    }

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
}

export default ReassignmentService;
