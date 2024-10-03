import Employee from "@/models/Employee";

class EmployeeDb {
  public async getEmployee(staffId: number) {
    const employee = await Employee.findOne(
      { staffId },
      "-_id -createdAt -updatedAt -hashedPassword"
    );
    return employee;
  }

  public async getEmployeeByEmail(userEmail: string): Promise<any> {
    return await Employee.findOne(
      {
        email: userEmail,
      },
      "-_id -createdAt -updatedAt"
    ).exec();
  }
}

export default EmployeeDb;
