import Request from "@/models/Request";

class RequestDb {
  public async getRequest(requestId: number) {
    const request = await Request.findOne({ requestId });
    return request;
  }

  public async postRequest(requestDetails: any) {
    // logic to loop through json and insert into col
  }
}

export default RequestDb;
