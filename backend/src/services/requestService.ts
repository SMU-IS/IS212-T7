import RequestDb from "@/database/RequestDb";

class RequestService {
  private requestDb = new RequestDb();

  public async getRequest(requestId: number) {
    // Process business logic here
    // Retrieve from database layer
    const request = await this.requestDb.getRequest(requestId);

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
