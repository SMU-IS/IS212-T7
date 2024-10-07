import UtilsController from "@/controllers/UtilsController";
import EmployeeDb from "@/database/EmployeeDb";
import RequestDb from "@/database/RequestDb";
import { AccessControl, errMsg } from "@/helpers";
import { checkUserRolePermission } from "@/middleware/checkUserRolePermission";
import RequestService from "@/services/RequestService";
import { middlewareMockData } from "@/tests/middlewareMockData";
import { generateMockEmployee, mockRequestData } from "@/tests/mockData";
import { jest } from "@jest/globals";
import { Context, Next } from "koa";
import EmployeeService from "./EmployeeService";

describe("post requests", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;

  type ResponseDates = {
    successDates: [string, string][];
    noteDates: [string, string][];
    errorDates: [string, string][];
  };

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    requestDbMock.postRequest = jest.fn();
    requestService = new RequestService(
      requestDbMock
    ) as jest.Mocked<RequestService>;
    jest.resetAllMocks();
  });

  it("should successfully insert a request and return the result (happy path)", async () => {
    // Arrange
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [
        ["2024-09-19", "FULL"],
        ["2024-09-20", "FULL"],
      ],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [
        ["2024-09-19", "FULL"],
        ["2024-09-20", "FULL"],
      ],
      noteDates: [],
      errorDates: [],
    };

    requestDbMock.postRequest.mockResolvedValue(expectedResponse);

    // Act
    const result = await requestService.postRequest(requestDetails);

    // Assert
    expect(result).toEqual(expectedResponse);
    expect(requestDbMock.postRequest).toHaveBeenCalledWith(requestDetails);
  });

  it("should handle error dates in the response (sad path)", async () => {
    // Arrange
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [
        ["2024-09-19", "FULL"],
        ["2024-09-20", "FULL"],
      ],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [
        ["2024-09-19", "FULL"],
        ["2024-09-20", "FULL"],
      ],
    };

    requestDbMock.postRequest.mockResolvedValue(expectedResponse);

    // Act
    const result = await requestService.postRequest(requestDetails);

    // Assert
    expect(result).toEqual(expectedResponse);
    expect(requestDbMock.postRequest).toHaveBeenCalledWith(requestDetails);
  });

  it("should handle note dates in the response (happy path)", async () => {
    // Arrange
    const requestDetails = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "Development",
      requestedDates: [["2024-09-21", "FULL"]],
      reason: "Take care of mother",
    };

    const expectedResponse: ResponseDates = {
      successDates: [["2024-09-21", "FULL"]],
      noteDates: [["2024-09-21", "FULL"]],
      errorDates: [],
    };

    requestDbMock.postRequest.mockResolvedValue(expectedResponse);

    // Act
    const result = await requestService.postRequest(requestDetails);

    // Assert
    expect(result).toEqual(expectedResponse);
    expect(requestDbMock.postRequest).toHaveBeenCalledWith(requestDetails);
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
