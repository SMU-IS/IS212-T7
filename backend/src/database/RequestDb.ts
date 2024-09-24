import { Dept, Status } from "@/helpers";
import Request from "@/models/Request";
import { weekMap, checkDate } from "@/helpers/date";

interface RequestDetails {
  staffId: number;
  staffName: string;
  reportingManager: number;
  managerName: string;
  dept: string;
  requestedDates: [Date, string][];
  reason: string;
}

interface ResponseDates {
  successDates: [Date, string][];
  noteDates: [Date, string][];
  errorDates: [Date, string][];
}

class RequestDb {
  public async getMySchedule(myId: number) {
    const schedule = await Request.find({ staffId: myId });
    return schedule;
  }

  public async getMyRequests(myId: number) {
    const schedule = await Request.find({
      staffId: myId,
      status: { $nin: ["CANCELLED", "WITHDRAWN"] },
    });

    return schedule;
  }

  public async getTeamSchedule(reportingManager: number) {
    const teamSchedule = await Request.find({
      reportingManager,
      status: Status.APPROVED,
    });
    return teamSchedule;
  }

  public async getDeptSchedule(dept: Dept) {
    const deptSchedule = await Request.find({
      dept,
      status: Status.APPROVED,
    });
    return deptSchedule;
  }

  public async getCompanySchedule() {
    const request = await Request.find({ status: Status.APPROVED });
    return request;
  }

  public async postRequest(requestDetails: RequestDetails) {
    let responseDate: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
    };
    const result = await this.getMyRequests(requestDetails.staffId);
    const dateList = result.map((request) => request.requestedDate);
    const weekMapping = weekMap(dateList);

    for (const dateType of requestDetails.requestedDates) {
      const [date, type] = dateType;
      let dateInput = new Date(date);
      if (dateList.some((d) => d.getTime() === dateInput.getTime())) {
        responseDate.errorDates.push(dateType);
        continue;
      }
      let checkWeek = checkDate(dateInput, weekMapping);
      if (checkWeek) {
        responseDate.noteDates.push(dateType);
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
      try {
        const requestInsert = await Request.create(document);
        if (requestInsert) {
          responseDate.successDates.push(dateType);
        }
      } catch (error) {
        responseDate.errorDates.push(dateType);
      }
    }
    return responseDate;
  }
}

export default RequestDb;
