import RequestDb from "@/database/RequestDb";
import cron from "node-cron";

class CronJob {
  private requestDb = new RequestDb();
  constructor(requestDb: RequestDb) {
    this.requestDb = requestDb;
  }

  public async execute() {
    // To run at 00:00 AM daily
    cron.schedule("0 0 * * *", () => {
      this.requestDb.updateRequestStatusToExpired();
    });
  }
}

export default CronJob;
