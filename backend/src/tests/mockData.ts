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
  role: 1,
  ...overrides,
});

export default generateMockEmployee;
