import { Dept } from "@/helpers";
import { hashPassword } from "@/tests/utils";

const generateMockEmployee = async (overrides = {}) => ({
  staffId: 1,
  staffFName: "John",
  staffLName: "Doe",
  dept: "Development",
  position: "Developer",
  country: "USA",
  email: "test@example.com",
  hashedPassword: await hashPassword("test-password"),
  reportingManager: null,
  reportingManagerName: null,
  role: 1,
  tempReportingManager: null,
  tempReportingManagerName: null,
  ...overrides,
});

const staffId = {
  [Dept.CEO]: 130002,
  [`${Dept.SALES}_Same_Team`]: 140004,
  [`${Dept.SALES}_Different_Team`]: 140880,
  [Dept.ENGINEERING]: 150115,
};

const mockRequest = {
  staffId: 140003,
  staffName: "Janice Chan",
  reportingManager: 140894,
  managerName: "Rahim Khalid",
  dept: "Sales",
  requestedDate: "2024-10-08T00:00:00.000Z",
  requestType: "FULL",
  reason: "Raining",
  status: "APPROVED",
  requestId: 22,
};

export { generateMockEmployee, mockRequest, staffId };
