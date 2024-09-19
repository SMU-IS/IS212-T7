import { Status } from "@/helpers";
import Request from "@/models/Request";

class RequestDb {
  public async getRequests(myId: number) {
    const request = await Request.find({ requestedBy: myId });
    return request;
  }

  public async getRequestsByStaffIdAndStatus(staffId: number, status: Status) {
    const request = await Request.find({ requestedBy: staffId, status });
    return request;
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
