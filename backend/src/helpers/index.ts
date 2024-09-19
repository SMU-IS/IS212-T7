enum Role {
  HR = 1,
  Staff = 2,
  Manager = 3,
}

enum errMsg {
  MISSING_PARAMETERS = "Missing Parameters",
  UNAUTHORISED = "User is not authorised to perform this role.",
  USER_DOES_NOT_EXIST = "User does not exist.",
}

enum AccessControl {
  VIEW_OWN_SCHEDULE = "VIEW_OWN_SCHEDULE",
  VIEW_OVERALL_SCHEDULE = "VIEW_OVERALL_SCHEDULE",
}

export { AccessControl, Role, errMsg };
