import EmployeeDb from "@/database/EmployeeDb";
import RequestDb from "@/database/RequestDb";
import { Dept, errMsg } from "@/helpers";
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

  public async getPendingRequests(staffId: number): Promise<IRequest[]> {
    const pendingRequests = await this.requestDb.getPendingRequests(staffId);
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
}

export default RequestService;
