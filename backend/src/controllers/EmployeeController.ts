import EmployeeService from "@/services/employeeService";

class EmployeeController {
  private employeeService = new EmployeeService();

  public async getEmployee(ctx: any) {
    const { staffId } = ctx.query;
    const result = await this.employeeService.getEmployee(staffId);
    ctx.body = result;
  }
}

export default new EmployeeController();
