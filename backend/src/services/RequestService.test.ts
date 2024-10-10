import RequestService from "@/services/RequestService";
import RequestDb from "@/database/RequestDb";
import UtilsController from "@/controllers/UtilsController";
import { checkUserRolePermission } from "@/middleware/checkUserRolePermission";
import { middlewareMockData } from "@/tests/middlewareMockData";
import { Context, Next } from "koa";
import EmployeeService from "./EmployeeService";
import EmployeeDb from "@/database/EmployeeDb";
import { jest } from "@jest/globals";
import dayjs from "dayjs";
import {
  generateMockEmployee,
  mockRequestData,
  generateMockEmployeeTest,
} from "@/tests/mockData";
import * as dateUtils from "@/helpers/date"; 
import { AccessControl, errMsg, HttpStatusResponse } from "@/helpers";


describe("postRequest", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;
  const mondayWkAfter = dayjs()
    .tz("Asia/Singapore")
    .day(1)
    .add(1, "week")
    .format("YYYY-MM-DD");
  const tuesdayWkAfter = dayjs()
    .tz("Asia/Singapore")
    .day(2)
    .add(1, "week")
    .format("YYYY-MM-DD");
  const wednesdayWkAfter = dayjs()
    .tz("Asia/Singapore")
    .day(3)
    .add(1, "week")
    .format("YYYY-MM-DD");
  const saturdayWkAfter = dayjs()
    .tz("Asia/Singapore")
    .day(6)
    .add(1, "week")
    .format("YYYY-MM-DD");

  const mondayWeekBefore = dayjs()
    .tz("Asia/Singapore")
    .day(1)
    .subtract(1, "week")
    .format("YYYY-MM-DD");

  type ResponseDates = {
    successDates: [string, string][];
    noteDates: [string, string][];
    errorDates: [string, string][];
    weekendDates: [string, string][];
    pastDates: [string, string][];
    pastDeadlineDates: [string, string][];
    duplicateDates: [string, string][];
    insertErrorDates: [string, string][];
  };

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    requestService = new RequestService(requestDbMock);
    requestDbMock.postRequest = jest.fn();
    requestDbMock.getPendingOrApprovedRequests = jest.fn();
    jest.mock("@/helpers/date"); 
    jest.resetAllMocks();
  });

  it("should return weekendDates array for weekend inputted", async () => {
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [[saturdayWkAfter, "FULL"]],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
      weekendDates: [[saturdayWkAfter, "FULL"]],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };
    mockRequestData.PENDING.requestedDate = String(new Date(tuesdayWkAfter));
    requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
      mockRequestData.PENDING,
    ] as any);
    const result = await requestService.postRequest(requestDetails);
    console.log(result);
    expect(result).toEqual(expectedResponse);
  });

  it("should return pastDates array for past date inputted", async () => {
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [[mondayWeekBefore, "FULL"]],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [[mondayWeekBefore, "FULL"]],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };
    mockRequestData.PENDING.requestedDate = String(new Date(tuesdayWkAfter));
    requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
      mockRequestData.PENDING,
    ] as any);
    const result = await requestService.postRequest(requestDetails);
    console.log(result);
    expect(result).toEqual(expectedResponse);
  });

  it("should return successDates for successful date inputted", async () => {
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [[wednesdayWkAfter, "FULL"]],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [[wednesdayWkAfter, "FULL"]],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };
    mockRequestData.testing.requestedDate = new Date(tuesdayWkAfter);
    requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
      mockRequestData.testing,
    ] as any);
    requestDbMock.postRequest.mockResolvedValue(true);
    const result = await requestService.postRequest(requestDetails);
    console.log(result);
    expect(result).toEqual(expectedResponse);
  });

  it("should return duplicateDates array and successDates for duplicate date inputted (successful date)", async () => {
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [
        [wednesdayWkAfter, "FULL"],
        [wednesdayWkAfter, "AM"],
      ],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [[wednesdayWkAfter, "FULL"]],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [[wednesdayWkAfter, "AM"]],
      insertErrorDates: [],
    };
    mockRequestData.testing.requestedDate = new Date(tuesdayWkAfter);
    requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
      mockRequestData.testing,
    ] as any);
    requestDbMock.postRequest.mockResolvedValue(true);
    const result = await requestService.postRequest(requestDetails);
    console.log(result);
    expect(result).toEqual(expectedResponse);
  });

  it("should return noteDates array and successDates for successful dates inputted with >2 existing requests for that week", async () => {
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [
        [mondayWkAfter, "FULL"],
        [wednesdayWkAfter, "FULL"],
      ],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [
        [mondayWkAfter, "FULL"],
        [wednesdayWkAfter, "FULL"],
      ],
      noteDates: [[wednesdayWkAfter, "FULL"]],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };
    mockRequestData.testing.requestedDate = new Date(tuesdayWkAfter);
    requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
      mockRequestData.testing,
    ] as any);
    requestDbMock.postRequest.mockResolvedValue(true);
    const result = await requestService.postRequest(requestDetails);
    console.log(result);
    expect(result).toEqual(expectedResponse);
  });

  it("should return insertError array when successful dates inputted but with DB Error", async () => {
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [[mondayWkAfter, "FULL"]],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [[mondayWkAfter, "FULL"]],
    };
    mockRequestData.testing.requestedDate = new Date(tuesdayWkAfter);
    requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
      mockRequestData.testing,
    ] as any);
    requestDbMock.postRequest.mockResolvedValue(false);
    const result = await requestService.postRequest(requestDetails);
    console.log(result);
    expect(result).toEqual(expectedResponse);
  });

  it("should return pastDeadlineDates array when dates inputted has past deadline", async () => {
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [[mondayWkAfter, "FULL"]],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [[mondayWkAfter, "FULL"]],
      duplicateDates: [],
      insertErrorDates: [],
    };
    mockRequestData.testing.requestedDate = new Date(tuesdayWkAfter);
    requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
      mockRequestData.testing,
    ] as any);
    jest.spyOn(dateUtils, "checkLatestDate").mockReturnValue(true);
    const result = await requestService.postRequest(requestDetails);
    console.log(result);
    expect(result).toEqual(expectedResponse);
  });

  it("should return errorDates array when there is already a pending / approved request for that date", async () => {
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [[mondayWkAfter, "FULL"]],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [[mondayWkAfter, "FULL"]],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };
    mockRequestData.testing.requestedDate = new Date(mondayWkAfter);
    requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
      mockRequestData.testing,
    ] as any);
    const result = await requestService.postRequest(requestDetails);
    console.log(result);
    expect(result).toEqual(expectedResponse);
  });
});

describe("getPendingOrApprovedRequests", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    requestService = new RequestService(requestDbMock);
    requestDbMock.getPendingOrApprovedRequests = jest.fn();
    jest.resetAllMocks();
  });

  it("should return array of requests for a valid staffId", async () => {
    const { staffId } = mockRequestData.PENDING;
    requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
      mockRequestData.PENDING,
    ] as any);
    const result = await requestService.getPendingOrApprovedRequests(staffId);
    console.log(result);
    expect(result).toEqual([mockRequestData.PENDING] as any);
  });

  it("should return [] for an invalid staffId", async () => {
    requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([]);
    const result = await requestService.getPendingOrApprovedRequests(1044);
    console.log(result);
    expect(result).toEqual([]);
  });
});

describe("cancel pending requests", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    requestService = new RequestService(requestDbMock);

    /**
     * Mock Database Calls
     */
    requestDbMock.cancelPendingRequests = jest.fn();
    EmployeeService.prototype.getEmployee = jest.fn() as any;
    UtilsController.throwAPIError = jest.fn();

    jest.resetAllMocks();
  });

  it("should return status not modified if there is no pending request", async () => {
    const { staffId, requestId } = mockRequestData.APPROVED;
    requestDbMock.cancelPendingRequests.mockResolvedValue(null);
    const result = await requestService.cancelPendingRequests(
      staffId,
      requestId
    );
    expect(result).toEqual(null);
  });

  it("should cancel user's pending request", async () => {
    const { staffId, requestId } = mockRequestData.PENDING;
    requestDbMock.cancelPendingRequests.mockResolvedValue(
      mockRequestData.APPROVED as any
    );
    const result = await requestService.cancelPendingRequests(
      staffId,
      requestId
    );
    expect(result).toEqual(HttpStatusResponse.OK);
  });
});

describe("get pending requests", () => {
  let employeeDbMock: EmployeeDb;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;
  let ctx: Context;
  let next: Next;
  const checkUserRolePermMiddleware = checkUserRolePermission(
    AccessControl.VIEW_PENDING_REQUEST
  );

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    requestService = new RequestService(requestDbMock);

    employeeDbMock = new EmployeeDb() as jest.Mocked<EmployeeDb>;
    employeeServiceMock = new EmployeeService(
      employeeDbMock
    ) as jest.Mocked<EmployeeService>;

    /**
     * Mock Database Calls
     */
    requestDbMock.getPendingRequests = jest.fn();
    next = jest.fn() as any;
    EmployeeService.prototype.getEmployee = jest.fn() as any;
    UtilsController.throwAPIError = jest.fn();

    jest.resetAllMocks();
  });

  it("should not return pending requests because of missing headers", async () => {
    ctx = {
      request: {
        header: {},
      },
    } as unknown as Context;
    ctx.request.header.id = undefined;

    await checkUserRolePermMiddleware(ctx, next);
    expect(UtilsController.throwAPIError).toHaveBeenCalledWith(
      ctx,
      errMsg.MISSING_HEADER
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should not return pending requests because user is unauthorised", async () => {
    ctx = {
      request: {
        header: {},
      },
    } as unknown as Context;
    ctx.request.header.id = String(middlewareMockData.Engineering.staffId);

    employeeServiceMock.getEmployee.mockResolvedValue(
      middlewareMockData.Engineering as any
    );
    await checkUserRolePermMiddleware(ctx, next);
    expect(UtilsController.throwAPIError).toHaveBeenCalledWith(
      ctx,
      errMsg.UNAUTHORISED
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return user's direct subordinates pending requests", async () => {
    const { reportingManager } = mockRequestData.PENDING;
    requestDbMock.getPendingRequests.mockResolvedValue(
      mockRequestData.PENDING as any
    );
    const result = await requestService.getPendingRequests(reportingManager);
    expect(result).toEqual(mockRequestData.PENDING as any);
  });

  it("should not return user's direct subordinates requests that have been approved", async () => {
    const { reportingManager } = mockRequestData.APPROVED;
    requestDbMock.getPendingRequests.mockResolvedValue([]);
    const result = await requestService.getPendingRequests(reportingManager);
    expect(result).toEqual([]);
  });
});

describe("get schedules", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;
  let mockEmployee: any;

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    requestService = new RequestService(requestDbMock);
    mockEmployee = generateMockEmployee();

    /**
     * Mock Database Calls
     */
    requestDbMock.getTeamSchedule = jest.fn();
    requestDbMock.getDeptSchedule = jest.fn();
    requestDbMock.getCompanySchedule = jest.fn();

    jest.resetAllMocks();
  });

  it("should return team schedule", async () => {
    const { reportingManager, dept } = mockEmployee;

    requestDbMock.getTeamSchedule.mockResolvedValue(
      mockRequestData.APPROVED as any
    );
    const result = await requestService.getTeamSchedule(reportingManager, dept);
    expect(result).toEqual(mockRequestData.APPROVED as any);
  });

  it("should return department schedule", async () => {
    const { dept } = mockEmployee;
    requestDbMock.getDeptSchedule.mockResolvedValue(
      mockRequestData.APPROVED as any
    );
    const result = await requestService.getDeptSchedule(dept);
    expect(result).toEqual(mockRequestData.APPROVED as any);
  });

  it("should return company-wide schedule", async () => {
    requestDbMock.getCompanySchedule.mockResolvedValue(
      mockRequestData.APPROVED as any
    );
    const result = await requestService.getCompanySchedule();
    expect(result).toEqual(mockRequestData.APPROVED as any);
  });
});

describe("get own pending requests", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    requestService = new RequestService(requestDbMock);
    /**
     * Mock Database Calls
     */
    requestDbMock.getOwnPendingRequests = jest.fn();
    jest.resetAllMocks();
  });

  it("should return user's pending requests", async () => {
    const { staffId } = mockRequestData.PENDING;
    requestDbMock.getOwnPendingRequests.mockResolvedValue(
      mockRequestData.PENDING as any
    );
    const result = await requestService.getOwnPendingRequests(staffId);
    expect(result).toEqual(mockRequestData.PENDING as any);
  });

  it("should not return user's requests that have been approved", async () => {
    const { staffId } = mockRequestData.APPROVED;
    requestDbMock.getOwnPendingRequests.mockResolvedValue([]);
    const result = await requestService.getOwnPendingRequests(staffId);
    expect(result).toEqual([]);
  });
});

describe("reject pending requests", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;
  let employeeDbMock: EmployeeDb;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let mockEmployee: any;

  beforeEach(async () => {
    mockEmployee = await generateMockEmployeeTest();
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    requestService = new RequestService(requestDbMock);
    employeeDbMock = new EmployeeDb() as jest.Mocked<EmployeeDb>;
    employeeServiceMock = new EmployeeService(
      employeeDbMock
    ) as jest.Mocked<EmployeeService>;
    requestDbMock.getPendingRequestByRequestId = jest.fn();
    requestDbMock.rejectRequest = jest.fn();
    EmployeeService.prototype.getEmployee = jest.fn() as any;
    UtilsController.throwAPIError = jest.fn();
    jest.resetAllMocks();
  });

  it("should return status not modified if there is no pending request", async () => {
    const { reportingManager, requestId, reason } = mockRequestData.APPROVED;
    requestDbMock.getPendingRequestByRequestId.mockResolvedValue(null);
    const result = await requestService.rejectRequest(
      reportingManager,
      requestId,
      reason
    );
    expect(result).toEqual(null);
    expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(
      requestId
    );
  });

  it("should reject user's pending request", async () => {
    const { reportingManager, requestId, reason } = mockRequestData.PENDING;
    requestDbMock.rejectRequest.mockResolvedValue(
      mockRequestData.REJECTED as any
    );
    requestDbMock.getPendingRequestByRequestId.mockResolvedValue(
      mockRequestData.PENDING as any
    );
    employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee as any);
    const result = await requestService.rejectRequest(
      reportingManager,
      requestId,
      reason
    );
    expect(result).toEqual(HttpStatusResponse.OK);
    expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(
      requestId
    );
    expect(EmployeeService.prototype.getEmployee).toHaveBeenCalledWith(
      mockRequestData.PENDING.staffId
    );
  });

  it("should return status not modified if employee not found", async () => {
    const { reportingManager, requestId, reason } = mockRequestData.PENDING;
    requestDbMock.getPendingRequestByRequestId.mockResolvedValue(
      mockRequestData.PENDING as any
    );
    employeeServiceMock.getEmployee.mockResolvedValue(null);
    const result = await requestService.rejectRequest(
      reportingManager,
      requestId,
      reason
    );
    expect(result).toEqual(null);
    expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(
      requestId
    );
  });

  it("should return null if performedBy is not authorized", async () => {
    const { reportingManager, requestId, reason } = mockRequestData.PENDING;
    requestDbMock.getPendingRequestByRequestId.mockResolvedValue(
      mockRequestData.PENDING as any
    );
    mockEmployee.reportingManager = null;
    employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
    const result = await requestService.rejectRequest(
      reportingManager,
      requestId,
      reason
    );
    expect(result).toEqual(null);
    expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(
      requestId
    );
  });
});

describe("approve pending requests", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;
  let employeeDbMock: EmployeeDb;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let mockEmployee: any;

  beforeEach(async () => {
    mockEmployee = await generateMockEmployeeTest();
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    requestService = new RequestService(requestDbMock);
    employeeDbMock = new EmployeeDb() as jest.Mocked<EmployeeDb>;
    employeeServiceMock = new EmployeeService(
      employeeDbMock
    ) as jest.Mocked<EmployeeService>;
    requestDbMock.getPendingRequestByRequestId = jest.fn();
    requestDbMock.approveRequest = jest.fn();
    EmployeeService.prototype.getEmployee = jest.fn() as any;
    UtilsController.throwAPIError = jest.fn();
    jest.resetAllMocks();
  });

  it("should return status not modified if there is no pending request", async () => {
    const { reportingManager, requestId } = mockRequestData.APPROVED;
    requestDbMock.getPendingRequestByRequestId.mockResolvedValue(null);
    const result = await requestService.approveRequest(
      reportingManager,
      requestId
    );
    expect(result).toEqual(null);
    expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(
      requestId
    );
  });

  it("should approve user's pending request", async () => {
    const { reportingManager, requestId } = mockRequestData.PENDING;
    requestDbMock.approveRequest.mockResolvedValue(
      mockRequestData.APPROVED as any
    );
    requestDbMock.getPendingRequestByRequestId.mockResolvedValue(
      mockRequestData.PENDING as any
    );
    employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee as any);
    const result = await requestService.approveRequest(
      reportingManager,
      requestId
    );
    expect(result).toEqual(HttpStatusResponse.OK);
    expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(
      requestId
    );
    expect(EmployeeService.prototype.getEmployee).toHaveBeenCalledWith(
      mockRequestData.PENDING.staffId
    );
  });

  it("should return status not modified if employee not found", async () => {
    const { reportingManager, requestId } = mockRequestData.PENDING;
    requestDbMock.getPendingRequestByRequestId.mockResolvedValue(
      mockRequestData.PENDING as any
    );
    employeeServiceMock.getEmployee.mockResolvedValue(null);
    const result = await requestService.approveRequest(
      reportingManager,
      requestId
    );
    expect(result).toEqual(null);
    expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(
      requestId
    );
  });

  it("should return null if performedBy is not authorized", async () => {
    const { reportingManager, requestId } = mockRequestData.PENDING;
    requestDbMock.getPendingRequestByRequestId.mockResolvedValue(
      mockRequestData.PENDING as any
    );
    mockEmployee.reportingManager = null;
    employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
    const result = await requestService.approveRequest(
      reportingManager,
      requestId
    );
    expect(result).toEqual(null);
    expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(
      requestId
    );
  });
});
