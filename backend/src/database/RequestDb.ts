import { Dept, RequestType, Status } from "@/helpers";
import Request from "@/models/Request";

interface InsertDocument {
  staffId: number;
  staffName: string;
  reportingManager: number;
  managerName: string;
  dept: string;
  requestedDate: Date;
  requestType: RequestType;
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

  public async getPendingOrApprovedRequests(myId: number) {
    const schedule = await Request.find({
      staffId: myId,
      status: { $nin: ["CANCELLED", "WITHDRAWN", "REJECTED"] },
    });

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

  public async postRequest(document: InsertDocument): Promise<boolean> {
    try {
      const requestInsert = await Request.create(document);
      return !!requestInsert;
    } catch (error) {
      return false;
    }
  }
}

export default RequestDb;
