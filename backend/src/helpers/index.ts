enum HttpStatusResponse {
  OK = "OK",
  NOT_MODIFIED = "NOT_MODIFIED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

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
  PAST_DATE = "Selected date must be at least 24 hours ahead",
  WEEKEND_REQUEST = "Applying WFH for the weekends is not allowed.",
  PAST_DEADLINE = "The application deadline for the selected day has passed.",
  DUPLICATE_DATE = "The same date has already been applied in this request",
  INSERT_ERROR = "Database insertion error.",
  DIFFERENT_DEPARTMENT = "User is from a different department and has no additional privilege to view data.",
  DIFFERENT_TEAM = "User is from a different team and has no additional privilege to view data.",
  ACTIVE_REASSIGNMENT = "User currently has an active reassignment. This request is no longer valid.",
  TEMP_MANAGER_OCCUPIED = "The manager you have selected has an active reassignment with another manager. Please select from other department.",
  INVALID_ACTION = "Invalid action. Must be 'approve' or 'reject'."
}

const noteMsg =
  "Note: More than 2 requests have already been made for the selected week.";

const successMsg = "Selected dates submitted successfully.";

enum AccessControl {
  VIEW_OWN_SCHEDULE = "VIEW_OWN_SCHEDULE",
  VIEW_OVERALL_SCHEDULE = "VIEW_OVERALL_SCHEDULE",
  VIEW_PENDING_REQUEST = "VIEW_PENDING_REQUEST",
  VIEW_SUB_WITHDRAWAL_REQUEST = "VIEW_SUB_WITHDRAWAL_REQUEST"

}

// TODO: Add more permission
const PERMISSIONS: Record<string, string[]> = {
  1: [
    AccessControl.VIEW_OWN_SCHEDULE,
    AccessControl.VIEW_OVERALL_SCHEDULE,
    AccessControl.VIEW_PENDING_REQUEST,
    AccessControl.VIEW_SUB_WITHDRAWAL_REQUEST

  ],
  2: [AccessControl.VIEW_OWN_SCHEDULE],
  3: [
    AccessControl.VIEW_OWN_SCHEDULE,
    AccessControl.VIEW_OVERALL_SCHEDULE,
    AccessControl.VIEW_PENDING_REQUEST,
    AccessControl.VIEW_SUB_WITHDRAWAL_REQUEST
  ],
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
  REVOKED = "REVOKED",
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

enum Request {
  APPLICATION = "APPLICATION",
  WITHDRAWAL = "WITHDRAWAL",
  REASSIGNMENT = "REASSIGNMENT",
}

enum Action {
  APPLY = "APPLY",
  RETRIEVE = "RETRIEVE",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  CANCEL = "CANCEL",
  REVOKE = "REVOKE",
  REASSIGN = "REASSIGN",
  EXPIRE = "EXPIRE",
  SET_ACTIVE = "SET_ACTIVE",
  SET_INACTIVE = "SET_INACTIVE",
}

enum PerformedBy {
  SYSTEM,
}

export {
  AccessControl,
  Action,
  Dept,
  HttpStatusResponse,
  PERMISSIONS,
  PerformedBy,
  Request,
  RequestType,
  Role,
  Status,
  errMsg,
  noteMsg,
  successMsg,
};
