import { Dept, Status } from "@/helpers";
import Request from "@/models/Request";

interface RequestDetails {
  staffId: number;
  staffName: string;
  reportingManager: number;
  managerName: string;
  dept: string;
  requestedDates: [Date, string][];
  reason: string;
}

class RequestDb {
  public async getMySchedule(myId: number) {
    const schedule = await Request.find(
      { staffId: myId },
      "-_id -createdAt -updatedAt"
    );
    return schedule;
  }

  public async getTeamSchedule(reportingManager: number) {
    const teamSchedule = await Request.find(
      {
        reportingManager,
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
    let successDates: [Date, string][] = [];
    let errorDates: [Date, string][] = [];
    let outMsg = "";

    for (const dateType of requestDetails.requestedDates) {
      const [date, type] = dateType;
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
        console.log("Insert successful:", requestInsert);
        successDates.push(dateType);
      } catch (error) {
        console.log("Error inserting document:", error);
        errorDates.push(dateType);
      }
    }

    if (successDates.length > 0) {
      outMsg += "Application Successfully:\n";
      successDates.forEach(([date, time]) => {
        outMsg += `${date}, ${time}\n`;
      });
    }
    if (errorDates.length > 0) {
      outMsg += "\nApplication Unsuccessful:\n";
      errorDates.forEach(([date, time]) => {
        outMsg += `${date}, ${time}\n`;
      });
    }
    return outMsg;
  }
}

export default RequestDb;
