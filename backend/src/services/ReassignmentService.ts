import ReassignmentDb from "@/database/ReassignmentDb";

class ReassignmentService {
  private reassignmentDb: ReassignmentDb;

  constructor(reassignmentDb: ReassignmentDb) {
    this.reassignmentDb = reassignmentDb;
  }

  public async insertReassignmentRequest() {
    await this.reassignmentDb.insertReassignmentRequest();
  }
}

export default ReassignmentService;
