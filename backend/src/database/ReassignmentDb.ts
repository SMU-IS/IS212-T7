import Reassignment from "@/models/Reassignment";
import dayjs from "dayjs";
import { Status } from "@/helpers";
import RequestDb from "./RequestDb";
class ReassignmentDb {
  public async setActiveReassignmentPeriod(): Promise<boolean> {
    const now = dayjs().utc(true).startOf("day");
    const { modifiedCount } = await Reassignment.updateMany(
      {
        startDate: { $eq: now.toDate() },
      },
      {
        $set: {
          active: true,
        },
      },
    );

    return modifiedCount > 0;
  }

  public async setInactiveReassignmentPeriod(): Promise<boolean> {
    const now = dayjs().utc(true).startOf("day");
    const { modifiedCount } = await Reassignment.updateMany(
      {
        endDate: { $lt: now.toDate() },
      },
      {
        $set: {
          active: false,
        },
      },
    );

    return modifiedCount > 0;
  }

  public async insertReassignmentRequest(
    reassignmentRequest: any,
  ): Promise<void> {
    await Reassignment.create(reassignmentRequest);
  }

  public async getReassignmentRequest(staffId: number) {
    const reassignmentRequest = await Reassignment.find(
      {
        staffId,
      },
      "-_id -createdAt -updatedAt",
    );
    return reassignmentRequest;
  }

  public async getReassignmentActive(
    staffId: number,
    tempReportingManagerId: number,
  ) {
    const reassignmentRequest = await Reassignment.findOne(
      {
        staffId,
        tempReportingManagerId,
        active: true,
      },
      "-_id -createdAt -updatedAt",
    );
    return reassignmentRequest;
  }

  public async getActiveReassignmentAsTempManager(staffId: number) {
    const reassignmentRequest = await Reassignment.findOne(
      {
        tempReportingManagerId: staffId,
        active: true,
      },
      "-_id -createdAt -updatedAt",
    );
    return reassignmentRequest;
  }

  public async getIncomingReassignmentRequests(staffId: number) {
    const incomingRequests = await Reassignment.find({
      tempReportingManagerId: staffId,
      status: Status.PENDING
    }).lean();

    return incomingRequests;
  }

  public async updateReassignmentStatus(reassignmentId: number, status: Status) {
    return await Reassignment.findOneAndUpdate(
      { reassignmentId },
      { $set: { status } },
      { new: true }
    ).lean();
  }

  public async getSubordinateRequestsForTempManager(staffId: number) {
    const reassignment = await this.getActiveReassignmentAsTempManager(staffId);
    console.log('Active reassignment:', reassignment);
    if (!reassignment) {
      console.log('No active reassignment found for staffId:', staffId);
      return null;
    }
  
    const requestDb = new RequestDb();
    const subordinateRequests = await requestDb.getAllSubordinatesRequests(reassignment.staffId);
    console.log('Subordinate requests:', subordinateRequests);
  
    // filter approved requests based on reassignment dates
    const filteredRequests = subordinateRequests.filter(request => {
      if (request.status === 'APPROVED') {
        const requestDate = new Date(request.requestedDate);
        const reassignmentStartDate = new Date(reassignment.startDate);
        const reassignmentEndDate = new Date(reassignment.endDate);
  
        return (
          // only return approved requests if they are between startDate and endDate of reassignment 
          (requestDate >= reassignmentStartDate ) &&
          (requestDate <= reassignmentEndDate) 
        );
      }
      // keep all pending requests
      else if (request.status === 'PENDING'){
        return true; 
      }
      else {
        return false;
      }
    });
  
    console.log('Filtered subordinate requests:', filteredRequests);
    return filteredRequests;
  }


}

export default ReassignmentDb;
