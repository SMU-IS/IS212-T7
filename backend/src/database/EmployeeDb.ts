import Employee from "@/models/Employee";

class EmployeeDb {
  public async getEmployee(staffId: number) {
    const employee = await Employee.findOne({ staffId });
    return employee;
  }
}

export default EmployeeDb;
