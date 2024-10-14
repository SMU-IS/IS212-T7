import { HttpStatusResponse, RequestType, Status } from "@/helpers";
import Request, { IRequest } from "@/models/Request";
import dayjs from "dayjs";

interface InsertDocument {
  staffId: number;
  staffName: string;
  reportingManager: number;
  managerName: string;
  dept: string;
  requestedDate: Date;
  requestType: RequestType;
  reason: string;
  position: string;
}

class RequestDb {
  public async getMySchedule(myId: number): Promise<IRequest[]> {
    const schedule = await Request.find(
      { staffId: myId },
      "-_id -createdAt -updatedAt",
    );
    return schedule;
  }

  public async getAllSubordinatesRequests(
    staffId: number,
  ): Promise<IRequest[]> {
    const subordinatesRequests = await Request.find({
      reportingManager: staffId,
    });
    return subordinatesRequests;
  }

  public async getOwnPendingRequests(myId: number): Promise<IRequest[]> {
    const pendingRequests = await Request.find({
      staffId: myId,
      status: Status.PENDING,
    });
    return pendingRequests;
  }

  public async cancelPendingRequests(
    staffId: number,
    requestId: number,
  ): Promise<string | null> {
    const { modifiedCount } = await Request.updateMany(
      {
        staffId,
        requestId,
        status: Status.PENDING,
      },
      {
        $set: {
          status: Status.CANCELLED,
        },
      },
    );

    if (modifiedCount == 0) {
      return null;
    }

    return HttpStatusResponse.OK;
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

  public async getTeamSchedule(reportingManager: number, position: string) {
    const teamSchedule = await Request.find(
      {
        reportingManager,
        position,
        status: Status.APPROVED,
      },
      "-_id -createdAt -updatedAt",
    );
    return teamSchedule;
  }

  public async getAllDeptSchedule() {
    const deptSchedule = await Request.aggregate([
      {
        $match: {
          status: Status.APPROVED,
        },
      },
      {
        $project: {
          _id: 0,
          staffId: 1,
          staffName: 1,
          reportingManager: 1,
          managerName: 1,
          dept: 1,
          requestedDate: 1,
          requestType: 1,
          position: 1,
          reason: 1,
          status: 1,
          requestId: 1,
          performedBy: 1,
        },
      },
      {
        $group: {
          _id: {
            dept: "$dept",
            position: "$position",
          },
          requests: { $push: "$$ROOT" },
        },
      },
      {
        $group: {
          _id: "$_id.dept",
          teams: {
            $push: {
              position: "$_id.position",
              requests: "$requests",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          dept: "$_id",
          teams: 1,
        },
      },
    ]);

    const formattedSchedule: any = {};
    deptSchedule.forEach((dept) => {
      formattedSchedule[dept.dept] = {};
      dept.teams.forEach((team: any) => {
        formattedSchedule[dept.dept][team.position] = team.requests;
      });
    });

    return formattedSchedule;
  }

  public async getCompanySchedule() {
    const request = await Request.find(
      { status: Status.APPROVED },
      "-_id -createdAt -updatedAt",
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
      },
    );
  }

  public async approveRequest(
    performedBy: number,
    requestId: number,
  ): Promise<string | null> {
    const { modifiedCount } = await Request.updateMany(
      {
        requestId,
        status: Status.PENDING,
      },
      {
        $set: {
          status: Status.APPROVED,
          performedBy: performedBy,
        },
      },
    );
    if (modifiedCount == 0) {
      return null;
    }
    return HttpStatusResponse.OK;
  }

  public async getPendingRequestByRequestId(requestId: number) {
    const requestDetail = await Request.findOne(
      {
        requestId,
        status: Status.PENDING,
      },
      "-_id -createdAt -updatedAt",
    );
    return requestDetail;
  }

  public async rejectRequest(
    performedBy: number,
    requestId: number,
    reason: string,
  ): Promise<string | null> {
    const { modifiedCount } = await Request.updateMany(
      {
        requestId,
        status: Status.PENDING,
      },
      {
        $set: {
          status: Status.REJECTED,
          reason: reason,
          performedBy: performedBy,
        },
      },
    );
    if (modifiedCount == 0) {
      return null;
    }
    return HttpStatusResponse.OK;
  }
}

export default RequestDb;
