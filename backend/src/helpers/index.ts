enum Role {
  HR = 1,
  Staff = 2,
  Manager = 3,
}

enum errMsg {
  MISSING_PARAMETERS = "Missing Parameters",
  UNAUTHORISED = "User is not authorised to perform this role.",
  INVALID_ROLE_ID = "Invalid roleId, it should only be 0, 1 or 2",
}

enum AccessControl {
  VIEW_OWN_SCHEDULE = "VIEW_OWN_SCHEDULE",
  VIEW_OVERALL_SCHEDULE = "VIEW_OVERALL_SCHEDULE",
}

// TODO: Add more permission
const PERMISSIONS: Record<string, string[]> = {
  1: [AccessControl.VIEW_OWN_SCHEDULE, AccessControl.VIEW_OVERALL_SCHEDULE],
  2: [AccessControl.VIEW_OWN_SCHEDULE],
  3: [AccessControl.VIEW_OWN_SCHEDULE, AccessControl.VIEW_OVERALL_SCHEDULE],
};

export { AccessControl, PERMISSIONS, Role, errMsg };
