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

  public async insertReassignmentRequest(): Promise<void> {
    const reassigmentReq = {
      staffId: 1,
      staffName: "John John Doe",
      startDate: "2024-11-01",
      endDate: "2024-11-05",
      tempReportingManagerId: 2,
      tempManagerName: "Jane Doe",
      status: "PENDING",
      active: null,
    };
    await Reassignment.create(reassigmentReq);
  }
}

export default ReassignmentDb;
