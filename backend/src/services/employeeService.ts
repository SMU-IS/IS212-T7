import EmployeeDb from "@/database/EmployeeDb";

class EmployeeService {
  private employeeDb = new EmployeeDb();

  public async getEmployee(staffId: number) {
    // Process business logic here
    // Retrieve from database layer
    const employee = await this.employeeDb.getEmployee(staffId);

    return employee;
  }

    public async getEmployeeByEmail(staffEmail: string) {
      return await this.employeeDb.getEmployeeByEmail(staffEmail);
    }
}

export default EmployeeService;
