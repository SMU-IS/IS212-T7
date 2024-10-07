class EmployeeTreeNode {
  private readonly employee: number;
  private subordinates: Array<EmployeeTreeNode> | null;

  public constructor(
    employee: number,
    subordinates: Array<EmployeeTreeNode> | null
  ) {
    this.employee = employee;
    this.subordinates = subordinates;
  }

  public getEmployee() {
    return this.employee;
  }

  public getSubordinates() {
    return this.subordinates;
  }

  public addSubordinate(subordinate: EmployeeTreeNode) {
    if (this.subordinates === null)
      this.subordinates = []

    this.subordinates.push(subordinate);
  }
}

export default EmployeeTreeNode;