const generateMockEmployee = (overrides = {}) => ({
  staffId: 1,
  staffFName: "John",
  staffLName: "Doe",
  dept: "Development",
  position: "Developer",
  country: "USA",
  email: "test@example.com",
  reportingManager: null,
  role: 1,
  ...overrides,
});

export default generateMockEmployee;
