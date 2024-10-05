enum Role {
  HR = 1,
  Staff = 2,
  Manager = 3,
}

enum errMsg {
  MISSING_HEADER = "Missing header",
  MISSING_PARAMETERS = "Missing parameters",
  WRONG_PASSWORD = "User has entered the wrong password.",
  UNAUTHORISED = "User is not authorised to perform this role.",
  USER_DOES_NOT_EXIST = "User does not exist.",
  REQUESTS_NOT_FOUND = "No requests found",
  SAME_DAY_REQUEST = "Existing request for selected day found.",
  DIFFERENT_DEPARTMENT = "User is from a different department and has no additional privilege to view data.",
  DIFFERENT_TEAM = "User is from a different team and has no additional privilege to view data.",
}

const noteMsg =
  "Note: More than 2 requests have already been made for the selected week.";

const successMsg = "Selected dates submitted successfully.";

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

enum RequestType {
  AM = "AM",
  PM = "PM",
  FULL = "FULL",
}

enum Status {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  WITHDRAWN = "WITHDRAWN",
  EXPIRED = "EXPIRED",
}

enum Dept {
  CEO = "CEO",
  CONSULTANCY = "Consultancy",
  ENGINEERING = "Engineering",
  FINANCE = "Finance",
  HR = "HR",
  IT = "IT",
  SALES = "Sales",
  SOLUTIONING = "Solutioning",
}

export {
  AccessControl,
  Dept,
  PERMISSIONS,
  RequestType,
  Role,
  Status,
  errMsg,
  successMsg,
  noteMsg,
};
