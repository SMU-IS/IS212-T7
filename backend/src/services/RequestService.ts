import RequestDb from "@/database/RequestDb";
import {
  Action,
  errMsg,
  HttpStatusResponse,
  PerformedBy,
  Request,
} from "@/helpers";
import { Role } from "@/helpers/";
import {
  checkDate,
  checkLatestDate,
  checkPastDate,
  checkWeekend,
  weekMap,
  checkPastWithdrawalDate,
  checkValidWithdrawalDate,
} from "@/helpers/date";
import { IRequest } from "@/models/Request";
import EmployeeService from "./EmployeeService";
import LogService from "./LogService";
import ReassignmentService from "./ReassignmentService";

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
  private logService: LogService;
  private employeeService: EmployeeService;
  private reassignmentService: ReassignmentService;
  private requestDb: RequestDb;

  constructor(
    logService: LogService,
    employeeService: EmployeeService,
    requestDb: RequestDb,
    reassignmentService: ReassignmentService,
  ) {
    this.logService = logService;
    this.employeeService = employeeService;
    this.requestDb = requestDb;
    this.reassignmentService = reassignmentService;
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
    requestId: number,
  ): Promise<string | null> {
    const result = await this.requestDb.cancelPendingRequests(
      staffId,
      requestId,
    );

    if (!result) {
      return null;
    }

    return HttpStatusResponse.OK;
  }

  public async getAllSubordinatesRequests(
    staffId: number,
  ): Promise<IRequest[]> {
    const surbodinatesRequests =
      await this.requestDb.getAllSubordinatesRequests(staffId);
    return surbodinatesRequests;
  }

  public async getOwnPendingRequests(myId: number): Promise<IRequest[]> {
    const pendingRequests = await this.requestDb.getOwnPendingRequests(myId);
    return pendingRequests;
  }

  public async getSchedule(staffId: number) {
    const employee = await this.employeeService.getEmployee(staffId);
    if (!employee) {
      return errMsg.USER_DOES_NOT_EXIST;
    }

    const {
      role,
      position,
      reportingManager,
      dept,
      staffFName,
      staffLName,
      reportingManagerName,
    } = employee;
    const allDeptTeamCount = await this.employeeService.getAllDeptTeamCount();

    const isManagerOrHR = role === Role.HR || role === Role.Manager;
    const wfhStaff = isManagerOrHR
      ? await this.requestDb.getAllDeptSchedule()
      : await this.requestDb.getTeamSchedule(reportingManager, position);

    let schedule: any = {};

    if (isManagerOrHR) {
      schedule = {
        ...allDeptTeamCount,
      };
      for (const dept of Object.keys(allDeptTeamCount)) {
        allDeptTeamCount[dept].wfhStaff = wfhStaff[dept] || [];
      }

      /**
       * Logging
       */
      await this.logService.logRequestHelper({
        performedBy: staffId,
        requestType: Request.APPLICATION,
        action: Action.RETRIEVE,
        staffName: `${staffFName} ${staffLName}`,
      });
    } else {
      schedule = {
        [dept]: {
          [position]: allDeptTeamCount[dept].teams[position],
        },
      };
      schedule[dept].wfhStaff = wfhStaff;

      /**
       * Logging
       */
      await this.logService.logRequestHelper({
        performedBy: staffId,
        requestType: Request.APPLICATION,
        action: Action.RETRIEVE,
        staffName: `${staffFName} ${staffLName}`,
        reportingManagerId: reportingManager,
        managerName: reportingManagerName,
      });
    }

    return schedule;
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
      requestDetails.staffId,
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

      const employee = await this.employeeService.getEmployee(
        Number(requestDetails.staffId),
      );
      const {
        staffFName,
        staffLName,
        reportingManager,
        reportingManagerName,
        dept,
        position,
      } = employee!;

      const document = {
        staffId: requestDetails.staffId,
        staffName: `${staffFName} ${staffLName}`,
        reportingManager,
        managerName: reportingManagerName,
        dept,
        requestedDate: date,
        requestType: type,
        reason: requestDetails.reason,
        position,
      };

      const requestInsert = await this.requestDb.postRequest(document);

      if (requestInsert) {
        responseDates.successDates.push(dateType);
        const reqId = requestInsert as number;
        /**
         * Logging
         */
        await this.logService.logRequestHelper({
          performedBy: requestDetails.staffId,
          requestType: Request.APPLICATION,
          action: Action.APPLY,
          requestId: reqId,
          staffName: `${staffFName} ${staffLName}`,
          reportingManagerId: reportingManager,
          managerName: reportingManagerName,
        });
      } else {
        responseDates.insertErrorDates.push(dateType);
      }
    }
    return responseDates;
  }

  public async getPendingRequestByRequestId(requestId: number) {
    const requestDetail =
      await this.requestDb.getPendingRequestByRequestId(requestId);
    return requestDetail;
  }

  public async getApprovedRequestByRequestId(requestId: number) {
    const requestDetail =
      await this.requestDb.getApprovedRequestByRequestId(requestId);
    return requestDetail;
  }

  public async approveRequest(
    performedBy: number,
    requestId: number,
  ): Promise<string | null> {
    const request = await this.getPendingRequestByRequestId(requestId);
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

    /**
     * Logging
     */
    await this.logService.logRequestHelper({
      performedBy: performedBy,
      requestType: Request.APPLICATION,
      action: Action.APPROVE,
      requestId: requestId,
      staffName: employee.reportingManagerName,
    });

    return HttpStatusResponse.OK;
  }

  public async rejectRequest(
    performedBy: number,
    requestId: number,
    reason: string,
  ): Promise<string | null> {
    const request = await this.getPendingRequestByRequestId(requestId);
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
      reason,
    );
    if (!result) {
      return null;
    }
    return HttpStatusResponse.OK;
  }

  public async updateRequestStatusToExpired() {
    const isStatusUpdated = await this.requestDb.updateRequestStatusToExpired();
    if (isStatusUpdated) {
      /**
       * Logging
       */
      await this.logService.logRequestHelper({
        performedBy: PerformedBy.SYSTEM,
        requestType: Request.REASSIGNMENT,
        action: Action.EXPIRE,
      });
    }
  }

  public async revokeRequest(
    performedBy: number,
    requestId: number,
    reason: string,
  ): Promise<string | null> {
    const request = await this.getApprovedRequestByRequestId(requestId);
    if (!request) {
      return null;
    }
    if (performedBy !== request.reportingManager) {
      const activeFlag = await this.reassignmentService.getReassignmentActive(
        request.reportingManager as any,
        performedBy,
      );
      if (!activeFlag) {
        return null;
      }
    }

    if (
      checkPastWithdrawalDate(request.requestedDate) &&
      !checkValidWithdrawalDate(request.requestedDate)
    ) {
      return null;
    }

    const result = await this.requestDb.revokeRequest(requestId, reason);
    if (!result) {
      return null;
    }
    return HttpStatusResponse.OK;
  }
}
export default RequestService;
