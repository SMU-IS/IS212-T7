import { Dept, Status } from "@/helpers";
import Request from "@/models/Request";

interface RequestQuery {
  staffId?: number;
  status?: Status;
  dept?: string;
}

class RequestDb {
  public async getOwnRequests(myId: number) {
    const requests = await Request.find({ staffId: myId });
    return requests;
  }

  public async getRequestsWithConditions(
    staffId?: number,
    status?: Status,
    dept?: Dept
  ) {
    const query: RequestQuery = {
      ...(staffId && { staffId }),
      ...(status && { status }),
      ...(dept && { dept }),
    };

    const requests = await Request.find(query);
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
