import EmployeeDb from "@/database/EmployeeDb";
import RequestDb from "@/database/RequestDb";
import { Dept, errMsg, HttpStatusResponse } from "@/helpers";
import { IRequest } from "@/models/Request";
import EmployeeService from "./EmployeeService";

class RequestService {
  private requestDb = new RequestDb();
  private employeeDb = new EmployeeDb();
  private employeeService = new EmployeeService(this.employeeDb);

  constructor(requestDb: RequestDb) {
    this.requestDb = requestDb;
  }

  public async getMySchedule(myId: number) {
    const employee = await this.employeeService.getEmployee(myId);
    if (!employee) {
      return errMsg.USER_DOES_NOT_EXIST;
    }

    const schedule = await this.requestDb.getMySchedule(myId);
    if (schedule.length < 1) {
      return errMsg.REQUESTS_NOT_FOUND;
    }

    return schedule;
  }

  public async cancelPendingRequests(
    staffId: number,
    requestId: number
  ): Promise<string | null> {
    const result = await this.requestDb.cancelPendingRequests(
      staffId,
      requestId
    );

    if (!result) {
      return null;
    }

    return HttpStatusResponse.OK;
  }

  public async getPendingRequests(staffId: number): Promise<IRequest[]> {
    const pendingRequests = await this.requestDb.getPendingRequests(staffId);
    return pendingRequests;
  }

  public async getOwnPendingRequests(myId: number): Promise<IRequest[]> {
    const pendingRequests = await this.requestDb.getOwnPendingRequests(myId);
    return pendingRequests;
  }

  public async getTeamSchedule(reportingManager: number, dept: Dept) {
    const teamSchedule = await this.requestDb.getTeamSchedule(
      reportingManager,
      dept
    );
    return teamSchedule;
  }

  public async getDeptSchedule(dept: Dept) {
    const deptSchedule = await this.requestDb.getDeptSchedule(dept);
    return deptSchedule;
  }

  public async getCompanySchedule() {
    const companySchedule = await this.requestDb.getCompanySchedule();
    return companySchedule;
  }

  public async postRequest(requestDetails: any) {
    const requestInsert = await this.requestDb.postRequest(requestDetails);
    return requestInsert;
  }

  public async getRequestByRequestId(requestId: number) {
    const requestDetail = await this.requestDb.getRequestByRequestId(requestId);
    return requestDetail;
  }

  public async rejectRequest(
    performedBy: number,
    requestId: number,
    reason: string
  ): Promise<string | null> {
    const request = await this.requestDb.getRequestByRequestId(requestId);
    if (!request) {
      return null;
    }
    const employee = await this.employeeDb.getEmployee(request.staffId);
    if (!employee) {
      return null;
    }
    if (
      employee.reportingManager !== performedBy &&
      employee.tempReportingManager !== performedBy
    ) {
      return null;
    }
    const result = await this.requestDb.rejectRequest(
      performedBy,
      requestId,
      reason
    );
    if (!result) {
      return null;
    }
    return HttpStatusResponse.OK;
  }
}

export default RequestService;
