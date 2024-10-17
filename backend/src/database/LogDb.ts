import Log from "@/models/Log";

class LogDb {
  public async logAction(logAction: any): Promise<void> {
    await Log.create(logAction);
  }

  public async getLogs(staffId: number) {
    const logs = await Log.findOne(
      {
        staffId,
      },
      "-_id -createdAt -updatedAt",
    );
    return logs;
  }
}

export default LogDb;
