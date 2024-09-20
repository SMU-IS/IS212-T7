import Employee from "@/models/Employee";

class EmployeeDb {
  public async getEmployee(staffId: number) {
    const employee = await Employee.findOne({ staffId });
    return employee;
  }

  public async getEmployeeByEmail(userEmail: string) {
    return await Employee.findOne({
      email: userEmail
    }, "staffId role").exec();
  }
}

export default EmployeeDb;
