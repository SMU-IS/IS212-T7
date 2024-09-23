import EmployeeDb from "@/database/EmployeeDb";
import { errMsg } from "@/helpers";
import bcrpyt from "bcrypt";

class EmployeeService {
  private employeeDb = new EmployeeDb();

  public async getEmployee(staffId: number) {
    const employee = await this.employeeDb.getEmployee(staffId);
    return employee;
  }

  public async getEmployeeByEmail(staffEmail: string, inputPassword: string) {
    const result = await this.employeeDb.getEmployeeByEmail(staffEmail);
    if (!result) {
      return errMsg.USER_DOES_NOT_EXIST;
    }

    const { hashedPassword } = result;
    const isAuthenticated = await bcrpyt.compare(inputPassword, hashedPassword);
    if (!isAuthenticated) {
      return errMsg.UNAUTHENTICATED;
    }

    return await this.employeeDb.getEmployeeByEmail(staffEmail);
  }
}

export default EmployeeService;
