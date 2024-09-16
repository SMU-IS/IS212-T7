enum Role {
  HR = 1,
  Staff = 2,
  Manager = 3,
}

enum errMsg {
  MISSING_PARAMETERS = "Missing Parameters",
  UNAUTHORISED = "User is not authorised to perform this role.",
}

enum AccessControl {
  VIEW_OWN_SCHEDULE = "VIEW_OWN_SCHEDULE",
  VIEW_OVERALL_SCHEDULE = "VIEW_OVERALL_SCHEDULE",
}

export { AccessControl, Role, errMsg };
