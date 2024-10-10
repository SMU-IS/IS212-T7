import EmployeeDb from "@/database/EmployeeDb";
import RequestDb from "@/database/RequestDb";
import { Dept, errMsg, HttpStatusResponse } from "@/helpers";
import { IRequest } from "@/models/Request";
import EmployeeService from "./EmployeeService";
import {
  weekMap,
  checkDate,
  checkPastDate,
  checkLatestDate,
  checkWeekend,
} from "@/helpers/date";

interface ResponseDates {
  successDates: [string, string][];
  noteDates: [string, string][];
  errorDates: [string, string][];
  weekendDates: [string, string][];
  pastDates: [string, string][];
  pastDeadlineDates: [string, string][];
  duplicateDates: [string, string][];
  insertErrorDates: [string, string][];
}

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

  public async getPendingOrApprovedRequests(myId: number) {
    const requests = await this.requestDb.getPendingOrApprovedRequests(myId);
    return requests;
  }

  public async postRequest(requestDetails: any) {
    let responseDates: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };
    const result = await this.getPendingOrApprovedRequests(
      requestDetails.staffId
    );
    const dateList = result.map((request) => request.requestedDate);
    const weekMapping = weekMap(dateList);
    const seenDates = new Set();

    for (const dateType of requestDetails.requestedDates) {
      const [date, type] = dateType;
      let dateInput = new Date(date);
      if (!seenDates.has(date)) {
        seenDates.add(date);
      } else {
        responseDates.duplicateDates.push(dateType);
        continue;
      }
      if (checkWeekend(dateInput)) {
        responseDates.weekendDates.push(dateType);
        continue;
      }
      if (checkPastDate(dateInput)) {
        responseDates.pastDates.push(dateType);
        continue;
      }

      if (checkLatestDate(dateInput)) {
        responseDates.pastDeadlineDates.push(dateType);
        continue;
      }

      if (dateList.some((d) => d.getTime() === dateInput.getTime())) {
        responseDates.errorDates.push(dateType);
        continue;
      }

      let checkWeek = checkDate(dateInput, weekMapping);

      if (checkWeek) {
        responseDates.noteDates.push(dateType);
      }

      const document = {
        staffId: requestDetails.staffId,
        staffName: requestDetails.staffName,
        reportingManager: requestDetails.reportingManager,
        managerName: requestDetails.managerName,
        dept: requestDetails.dept,
        requestedDate: date,
        requestType: type,
        reason: requestDetails.reason,
      };

      const requestInsert = await this.requestDb.postRequest(document);

      if (requestInsert) {
        responseDates.successDates.push(dateType);
      } else {
        responseDates.insertErrorDates.push(dateType);
      }
    }
    return responseDates;
  }

  public async getPendingRequestByRequestId(requestId: number) {
    const requestDetail = await this.requestDb.getPendingRequestByRequestId(
      requestId
    );
    return requestDetail;
  }
  
    public async approveRequest(
    performedBy: number,
    requestId: number
  ): Promise<string | null> {
    const request = await this.getPendingRequestByRequestId(
      requestId
    );
    if (!request) {
      return null;
    }
    const employee = await this.employeeService.getEmployee(request.staffId);
    if (!employee) {
      return null;
    }
    if (
      employee.reportingManager !== performedBy &&
      employee.tempReportingManager !== performedBy
    ) {
      return null;
    }
    const result = await this.requestDb.approveRequest(performedBy, requestId);
    if (!result) {
      return null;
    }
    return HttpStatusResponse.OK;
  }

  public async rejectRequest(
    performedBy: number,
    requestId: number,
    reason: string
  ): Promise<string | null> {
    const request = await this.getPendingRequestByRequestId(
      requestId
    );
    if (!request) {
      return null;
    }
    const employee = await this.employeeService.getEmployee(request.staffId);
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
