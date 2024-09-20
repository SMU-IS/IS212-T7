import { Dept, Status } from "@/helpers";
import Request from "@/models/Request";

class RequestDb {
  public async getMySchedule(myId: number) {
    const schedule = await Request.find({ staffId: myId });
    return schedule;
  }

  public async getTeamSchedule(reportingManager: number) {
    const teamSchedule = await Request.find({
      reportingManager,
      status: Status.APPROVED,
    });
    return teamSchedule;
  }

  public async getDeptSchedule(dept: Dept) {
    const deptSchedule = await Request.find({
      dept,
      status: Status.APPROVED,
    });
    return deptSchedule;
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
