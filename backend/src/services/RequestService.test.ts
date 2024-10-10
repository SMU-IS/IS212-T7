import RequestService from "@/services/RequestService";
import RequestDb from "@/database/RequestDb";
import { jest } from "@jest/globals";
import dayjs from "dayjs";
import { mockRequestData } from "@/tests/mockData";
import * as dateUtils from "@/helpers/date"; 

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
