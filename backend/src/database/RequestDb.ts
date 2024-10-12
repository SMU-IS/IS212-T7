import { Dept, HttpStatusResponse, RequestType, Status } from "@/helpers";
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
}

class RequestDb {
  public async getMySchedule(myId: number): Promise<IRequest[]> {
    const schedule = await Request.find(
      { staffId: myId },
      "-_id -createdAt -updatedAt"
    );
    return schedule;
  }

  public async getAllSubordinatesRequests(
    staffId: number
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
    requestId: number
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
      }
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
      }
    );
  }

  public async approveRequest(
    performedBy: number,
    requestId: number
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
      }
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
      "-_id -createdAt -updatedAt"
    );
    return requestDetail;
  }

  public async rejectRequest(
    performedBy: number,
    requestId: number,
    reason: string
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
      }
    );
    if (modifiedCount == 0) {
      return null;
    }
    return HttpStatusResponse.OK;
  }
}

export default RequestDb;
