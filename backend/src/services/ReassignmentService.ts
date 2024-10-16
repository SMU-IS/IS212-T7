import ReassignmentDb from "@/database/ReassignmentDb";
import { Status } from "@/helpers";
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
}

export default ReassignmentService;
