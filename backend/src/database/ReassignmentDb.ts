import Reassignment from "@/models/Reassignment";
import dayjs from "dayjs";

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
}

export default ReassignmentDb;
