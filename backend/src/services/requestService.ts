import RequestDb from "@/database/RequestDb";
import { Status } from "@/helpers";

class RequestService {
  private requestDb = new RequestDb();

  public async getOwnRequests(myId: number) {
    const request = await this.requestDb.getRequests(myId);
    return request;
  }

  public async getRequestsByStaffIdAndStatus(staffId: number, status: Status) {
    const request = await this.requestDb.getRequestsByStaffIdAndStatus(
      staffId,
      status
    );
    return request;
  }

  public async postRequest(requestDetails: any) {
    // Process business logic here
    // Retrieve from database layer
    const requestInsert = await this.requestDb.postRequest(requestDetails);

    return requestInsert;
  }
}

export default RequestService;
