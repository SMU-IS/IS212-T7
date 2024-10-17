import Withdrawal, { IWithdrawal } from "@/models/Withdrawal";
import { HttpStatusResponse } from "@/helpers";

interface InsertDocument {
  requestId: number;
  staffId: number;
  staffName: string;
  reportingManager: number | null;
  managerName: string | null;
  dept: string;
  position: string;
}

class WithdrawalDb {
  public async withdrawRequest(
    document: InsertDocument,
  ): Promise<string | null> {
    try {
      const withdrawalInsert = await Withdrawal.create(document);
      return withdrawalInsert ? HttpStatusResponse.OK : null;
    } catch (error) {
      return null;
    }
  }

  public async getWithdrawalRequest(requestId: number): Promise<IWithdrawal[]> {
    const withdrawalRequests = await Withdrawal.find({
      requestId: requestId,
    });
    return withdrawalRequests;
  }
}

export default WithdrawalDb;
