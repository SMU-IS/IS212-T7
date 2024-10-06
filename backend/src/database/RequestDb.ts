import { Dept, Status } from "@/helpers";
import Request from "@/models/Request";
import { weekMap, checkDate } from "@/helpers/date";
import dayjs from "dayjs";

interface RequestDetails {
  staffId: number;
  staffName: string;
  reportingManager: number;
  managerName: string;
  dept: string;
  requestedDates: [string, string][];
  reason: string;
}

interface ResponseDates {
  successDates: [string, string][];
  noteDates: [string, string][];
  errorDates: [string, string][];
}

class RequestDb {
  public async getMySchedule(myId: number) {
    const schedule = await Request.find(
      { staffId: myId },
      "-_id -createdAt -updatedAt"
    );
    return schedule;
  }

  public async getPendingOrApprovedRequests(myId: number) {
    const schedule = await Request.find({
      staffId: myId,
      status: {
        $nin: [
          Status.CANCELLED,
          Status.WITHDRAWN,
          Status.REJECTED,
          Status.EXPIRED,
        ],
      },
    });

    return schedule;
  }

  public async getTeamSchedule(reportingManager: number, dept: Dept) {
    const teamSchedule = await Request.find(
      {
        reportingManager,
        dept,
        status: Status.APPROVED,
      },
      "-_id -createdAt -updatedAt"
    );
    return teamSchedule;
  }

  public async getDeptSchedule(dept: Dept) {
    const deptSchedule = await Request.find(
      {
        dept,
        status: Status.APPROVED,
      },
      "-_id -createdAt -updatedAt"
    );
    return deptSchedule;
  }

  public async getCompanySchedule() {
    const request = await Request.find(
      { status: Status.APPROVED },
      "-_id -createdAt -updatedAt"
    );
    return request;
  }

  public async postRequest(requestDetails: RequestDetails) {
    let responseDates: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
    };
    const result = await this.getPendingOrApprovedRequests(
      requestDetails.staffId
    );
    const dateList = result.map((request) => request.requestedDate);
    const weekMapping = weekMap(dateList);

    for (const dateType of requestDetails.requestedDates) {
      const [date, type] = dateType;
      let dateInput = new Date(date);
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
      try {
        const requestInsert = await Request.create(document);
        if (requestInsert) {
          responseDates.successDates.push(dateType);
        }
      } catch (error) {
        responseDates.errorDates.push(dateType);
      }
    }
    return responseDates;
  }

  public async updateRequestStatusToExpired(): Promise<void> {
    const now = dayjs().utc(true).startOf("day");
    await Request.updateMany(
      {
        status: Status.PENDING,
        requestedDate: now.toDate(),
      },
      {
        $set: {
          status: Status.EXPIRED,
        },
      }
    );
  }
}

export default RequestDb;
