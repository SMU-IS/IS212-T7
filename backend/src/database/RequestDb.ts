import { Status } from "@/helpers";
import Request from "@/models/Request";

class RequestDb {
  public async getRequests(myId: number) {
    const requests = await Request.find({ requestedBy: myId });
    return requests;
  }

  public async getRequestsByStaffIdAndStatus(staffId: number, status: Status) {
    const requests = await Request.find({ requestedBy: staffId, status });
    return requests;
  }

  public async getCompanySchedule() {
    const request = await Request.find({ status: Status.APPROVED });
    return request;
  }

  public async postRequest(requestDetails: any) {
    // logic to loop through json and insert into col
  }
}

export default RequestDb;
