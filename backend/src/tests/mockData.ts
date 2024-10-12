import { Status } from "@/helpers";
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

const generateMockEmployeeTest = async (overrides = {}) => ({
  staffId: 140003,
  staffFName: "Janice",
  staffLName: "Chan",
  dept: "Sales",
  position: "Account Manager",
  country: "Singapore",
  email: "test@example.com",
  hashedPassword: await hashPassword("test-password"),
  reportingManager: 140894,
  reportingManagerName: "Rahim Khalid",
  role: 2,
  tempReportingManager: null,
  tempReportingManagerName: null,
  ...overrides,
});

const mockRequestData = {
  [Status.PENDING]: {
    staffId: 140003,
    staffName: "Janice Chan",
    reportingManager: 140894,
    managerName: "Rahim Khalid",
    dept: "Sales",
    requestedDate: "2024-10-08T00:00:00.000Z",
    requestType: "FULL",
    reason: "Raining",
    status: "PENDING",
    requestId: 22,
  },
  [Status.APPROVED]: {
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
  },
  [Status.REJECTED]: {
    staffId: 140003,
    staffName: "Janice Chan",
    reportingManager: 140894,
    managerName: "Rahim Khalid",
    dept: "Sales",
    requestedDate: "2024-10-08T00:00:00.000Z",
    requestType: "FULL",
    reason: "Raining",
    status: "REJECTED",
    requestId: 22,
    performedBy: 140894,
  },
  testing: {
    staffId: 140003,
    staffName: "Janice Chan",
    reportingManager: 140894,
    managerName: "Rahim Khalid",
    dept: "Sales",
    requestedDate: new Date(),
    requestType: "FULL",
    reason: "Raining",
    status: "REJECTED",
    requestId: 22,
    performedBy: 140894,
  },

};

export { generateMockEmployee, generateMockEmployeeTest, mockRequestData };
