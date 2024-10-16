import Reassignment from "@/models/Reassignment";
import dayjs from "dayjs";

class ReassignmentDb {
  public async setActiveReassignmentPeriod(): Promise<void> {
    const now = dayjs().utc(true).startOf("day");
    await Reassignment.updateMany(
      {
        startDate: { $eq: now.toDate() },
      },
      {
        $set: {
          active: true,
        },
      },
    );
  }

  public async setInactiveReassignmentPeriod(): Promise<void> {
    const now = dayjs().utc(true).startOf("day");
    await Reassignment.updateMany(
      {
        endDate: { $lt: now.toDate() },
      },
      {
        $set: {
          active: false,
        },
      },
    );
  }

  public async insertReassignmentRequest(
    reassignmentRequest: any,
  ): Promise<void> {
    await Reassignment.create(reassignmentRequest);
  }
}

export default ReassignmentDb;
