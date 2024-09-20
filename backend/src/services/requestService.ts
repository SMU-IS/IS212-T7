import RequestDb from "@/database/RequestDb";
import { Dept, errMsg } from "@/helpers";
import EmployeeService from "./employeeService";

class RequestService {
  private employeeService = new EmployeeService();
  private requestDb = new RequestDb();

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

  public async getTeamSchedule(reportingManager: number) {
    const teamSchedule = await this.requestDb.getTeamSchedule(reportingManager);
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
    // Process business logic here
    // Retrieve from database layer
    const requestInsert = await this.requestDb.postRequest(requestDetails);

    return requestInsert;
  }
}

export default RequestService;
