import Employee, { IEmployee } from "@/models/Employee";
import EmployeeTreeNode from "@/models/EmployeeTreeNode";

class EmployeeDb {
  public async getEmployee(staffId: number): Promise<IEmployee | null> {
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

  public async getDeptScheduleByStaffId(staffId: number) {
    const employeeHierarchy = await Employee.aggregate([
      { $match: { staffId } },
      {
        $graphLookup: {
          from: 'employees',
          startWith: staffId,
          connectFromField: 'staffId',
          connectToField: 'reportingManager',
          as: 'subordinates',
          maxDepth: 100,
          depthField: 'level'
        }
      }
    ]);

    if (employeeHierarchy.length === 0) {
      throw new Error('Employee not found');
    }

    const root = new EmployeeTreeNode(
      employeeHierarchy[0].staffId, null
    );

    let queue: Array<EmployeeTreeNode> = [root];
    let seen: Array<number> = [root.getEmployee()];
    let subordinates = employeeHierarchy[0].subordinates;

    while (queue.length > 0) {
      let current: EmployeeTreeNode | undefined = queue.shift();

      if (current === undefined) {
        continue;
      }

      const directSubordinates = subordinates.filter((sub: any) =>
        sub.reportingManager === current.getEmployee()
      );

      for (const subordinate of directSubordinates) {
        const subordinateStaffId = subordinate.staffId;
        if (subordinateStaffId in seen) {
          continue;
        }

        seen.push(subordinateStaffId);
        const subordinateTreeNode = new EmployeeTreeNode(
          subordinateStaffId, null
        );

        current.addSubordinate(subordinateTreeNode);
        queue.push(subordinateTreeNode);
      }
    }

    return root;
  }
}

export default EmployeeDb;
