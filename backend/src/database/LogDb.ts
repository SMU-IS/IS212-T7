import Log from "@/models/Log";

class LogDb {
  public async logAction(logAction: any): Promise<void> {
    await Log.create(logAction);
  }

  public async getLogs(staffId: number) {
    const logs = await Log.find(
      {
        performedBy: staffId,
      },
      "-_id -updatedAt",
    );
    return logs;
  }

  public async getLogsByRequestId(requestId: number) {
    const logs = await Log.find(
      {
        requestId,
      },
      "-_id -updatedAt",
    );
    return logs;
  }
}

export default LogDb;
