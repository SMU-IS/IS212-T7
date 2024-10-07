import RequestDb from "@/database/RequestDb";
import RequestService from "@/services/RequestService";
import { generateMockEmployee, mockRequestData } from "@/tests/mockData";
import { jest } from "@jest/globals";

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
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    requestService = new RequestService(requestDbMock);

    /**
     * Mock Database Calls
     */
    requestDbMock.getPendingRequests = jest.fn();

    jest.resetAllMocks();
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
