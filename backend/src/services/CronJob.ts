import ReassignmentDb from "@/database/ReassignmentDb";
import RequestDb from "@/database/RequestDb";
import cron from "node-cron";

class CronJob {
  private requestDb = new RequestDb();
  private reassignmentDb = new ReassignmentDb();

  constructor(requestDb: RequestDb, reassignmentDb: ReassignmentDb) {
    this.requestDb = requestDb;
    this.reassignmentDb = reassignmentDb;
  }

  public async execute() {
    // To run at 00:00 AM daily
    cron.schedule("0 0 * * *", () => {
      this.requestDb.updateRequestStatusToExpired();
      this.reassignmentDb.setActiveReassignmentPeriod();
      this.reassignmentDb.setInactiveReassignmentPeriod();
    });
  }
}

export default CronJob;
