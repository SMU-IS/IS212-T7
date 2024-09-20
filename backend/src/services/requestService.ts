import RequestDb from "@/database/RequestDb";
import { Dept, errMsg, Status } from "@/helpers";
import EmployeeService from "./employeeService";

class RequestService {
  private employeeService = new EmployeeService();
  private requestDb = new RequestDb();

  public async getOwnRequests(myId: number) {
    const employee = await this.employeeService.getEmployee(myId);
    if (!employee) {
      return errMsg.USER_DOES_NOT_EXIST;
    }

    const requests = await this.requestDb.getOwnRequests(myId);
    if (requests.length < 1) {
      return errMsg.REQUESTS_NOT_FOUND;
    }

    return requests;
  }

  public async getRequestsWithConditions(
    staffId: number,
    status?: Status,
    dept?: Dept
  ) {
    const requests = await this.requestDb.getRequestsWithConditions(
      staffId,
      status,
      dept
    );
    return requests;
  }

  public async getCompanySchedule() {
    const schedule = await this.requestDb.getCompanySchedule();
    return schedule;
  }

  public async postRequest(requestDetails: any) {
    // Process business logic here
    // Retrieve from database layer
    const requestInsert = await this.requestDb.postRequest(requestDetails);

    return requestInsert;
  }
}

export default RequestService;
