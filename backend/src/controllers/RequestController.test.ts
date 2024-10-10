import RequestController from "@/controllers/RequestController";
import { successMsg, noteMsg, errMsg } from "@/helpers";
import RequestService from "@/services/RequestService";
import RequestDb from "@/database/RequestDb";
import { Context } from "koa";

describe("RequestController", () => {
  let requestController: RequestController;
  let requestServiceMock: jest.Mocked<RequestService>;
  let requestDbMock: RequestDb;
  let ctx: Context;
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
    requestServiceMock = new RequestService(
      requestDbMock
    ) as jest.Mocked<RequestService>;
    requestController = new RequestController(requestServiceMock);
    ctx = {
      method: "POST",
      query: {},
      body: {},
      request: { body: {} },
      response: {},
    } as Context;
    requestServiceMock.postRequest = jest.fn();
    jest.resetAllMocks();
  });

  it("should return an error when missing parameters", async () => {
    await requestController.postRequest(ctx);
    expect(ctx.body).toEqual({
      errMsg: {
        _errors: [],
        staffId: {
          _errors: ["Required"],
        },
        staffName: {
          _errors: ["Required"],
        },
        reportingManager: {
          _errors: ["Required"],
        },
        managerName: {
          _errors: ["Required"],
        },
        dept: {
          _errors: ["Required"],
        },
        requestedDates: {
          _errors: ["Required"],
        },
        reason: {
          _errors: ["Required"],
        },
      },
    });
  });

  it("should return a (success{message, dates}, error, note) object when a valid date is inputted", async () => {
    ctx.request.body = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "IT",
      requestedDates: [
        ["2024-09-19", "FULL"],
        ["2024-09-20", "FULL"],
      ],
      reason: "Take care of mother",
    };

    const expectedServiceResponse: ResponseDates = {
      successDates: [
        ["2024-09-19", "FULL"],
        ["2024-09-20", "FULL"],
      ],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };

    const expectedResponse = {
      success: {
        message: successMsg,
        dates: [
          ["2024-09-19", "FULL"],
          ["2024-09-20", "FULL"],
        ],
      },
      error: [],
      note: {
        message: "",
        dates: [],
      },
    };

    requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
    await requestController.postRequest(ctx);
    expect(ctx.body).toEqual(expectedResponse);
    expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
      ctx.request.body
    );
  });

  it("should return a (success{message, dates}, error, note{message, dates}) object when a valid date is inputted", async () => {
    ctx.request.body = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "IT",
      requestedDates: [
        ["2024-09-19", "FULL"],
        ["2024-09-20", "FULL"],
      ],
      reason: "Take care of mother",
    };

    const expectedServiceResponse: ResponseDates = {
      successDates: [
        ["2024-09-19", "FULL"],
        ["2024-09-20", "FULL"],
      ],
      noteDates: [["2024-09-20", "FULL"]],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };

    const expectedResponse = {
      success: {
        message: successMsg,
        dates: [
          ["2024-09-19", "FULL"],
          ["2024-09-20", "FULL"],
        ],
      },
      error: [],
      note: {
        message: noteMsg,
        dates: [["2024-09-20", "FULL"]],
      },
    };

    requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
    await requestController.postRequest(ctx);
    expect(ctx.body).toEqual(expectedResponse);
    expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
      ctx.request.body
    );
  });

  it("should return a (success{message, dates}, error[duplicate], note) object when a duplicated date is inputted", async () => {
    ctx.request.body = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "IT",
      requestedDates: [
        ["2024-09-20", "FULL"],
        ["2024-09-20", "FULL"],
      ],
      reason: "Take care of mother",
    };

    const expectedServiceResponse: ResponseDates = {
      successDates: [["2024-09-20", "FULL"]],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [["2024-09-20", "FULL"]],
      insertErrorDates: [],
    };

    const expectedResponse = {
      success: {
        message: successMsg,
        dates: [["2024-09-20", "FULL"]],
      },
      error: [
        {
          message: errMsg.DUPLICATE_DATE,
          dates: [["2024-09-20", "FULL"]],
        },
      ],
      note: {
        message: "",
        dates: [],
      },
    };

    requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
    await requestController.postRequest(ctx);
    expect(ctx.body).toEqual(expectedResponse);
    expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
      ctx.request.body
    );
  });

  it("should return a (success, error[weekend], note) object when a weekend is inputted", async () => {
    ctx.request.body = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "IT",
      requestedDates: [["2024-09-21", "FULL"]],
      reason: "Take care of mother",
    };

    const expectedServiceResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
      weekendDates: [["2024-09-21", "FULL"]],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };

    const expectedResponse = {
      success: {
        message: "",
        dates: [],
      },
      error: [
        {
          message: errMsg.WEEKEND_REQUEST,
          dates: [["2024-09-21", "FULL"]],
        },
      ],
      note: {
        message: "",
        dates: [],
      },
    };

    requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
    await requestController.postRequest(ctx);
    expect(ctx.body).toEqual(expectedResponse);
    expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
      ctx.request.body
    );
  });

  it("should return a (success, error[pastDate], note) object when a past date is inputted", async () => {
    ctx.request.body = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "IT",
      requestedDates: [["2024-08-21", "FULL"]],
      reason: "Take care of mother",
    };

    const expectedServiceResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [["2024-08-21", "FULL"]],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };

    const expectedResponse = {
      success: {
        message: "",
        dates: [],
      },
      error: [
        {
          message: errMsg.PAST_DATE,
          dates: [["2024-08-21", "FULL"]],
        },
      ],
      note: {
        message: "",
        dates: [],
      },
    };

    requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
    await requestController.postRequest(ctx);
    expect(ctx.body).toEqual(expectedResponse);
    expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
      ctx.request.body
    );
  });

  it("should return a (success, error[pastDeadline], note) object when a date that is past application deadline is inputted", async () => {
    ctx.request.body = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "IT",
      requestedDates: [["2024-09-21", "FULL"]],
      reason: "Take care of mother",
    };

    const expectedServiceResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [["2024-08-21", "FULL"]],
      duplicateDates: [],
      insertErrorDates: [],
    };

    const expectedResponse = {
      success: {
        message: "",
        dates: [],
      },
      error: [
        {
          message: errMsg.PAST_DEADLINE,
          dates: [["2024-08-21", "FULL"]],
        },
      ],
      note: {
        message: "",
        dates: [],
      },
    };
    requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
    await requestController.postRequest(ctx);
    expect(ctx.body).toEqual(expectedResponse);
    expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
      ctx.request.body
    );
  });

  it("should return a (success, error[insertError], note) object when a there is a DB insert error", async () => {
    ctx.request.body = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "IT",
      requestedDates: [["2024-09-21", "FULL"]],
      reason: "Take care of mother",
    };

    const expectedServiceResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [["2024-09-21", "FULL"]],
    };

    const expectedResponse = {
      success: {
        message: "",
        dates: [],
      },
      error: [
        {
          message: errMsg.INSERT_ERROR,
          dates: [["2024-09-21", "FULL"]],
        },
      ],
      note: {
        message: "",
        dates: [],
      },
    };

    requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
    await requestController.postRequest(ctx);
    expect(ctx.body).toEqual(expectedResponse);
    expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
      ctx.request.body
    );
  });

  it("should return a (success, error[insertError, pastDate], note) object when a there is a DB insert error and a past date is inputted", async () => {
    ctx.request.body = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "IT",
      requestedDates: [
        ["2024-09-21", "FULL"],
        ["2023-09-21", "FULL"],
      ],
      reason: "Take care of mother",
    };

    const expectedServiceResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [],
      weekendDates: [],
      pastDates: [["2023-09-21", "FULL"]],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [["2024-09-21", "FULL"]],
    };

    const expectedResponse = {
      success: {
        message: "",
        dates: [],
      },
      error: [
        {
          message: errMsg.PAST_DATE,
          dates: [["2023-09-21", "FULL"]],
        },
        {
          message: errMsg.INSERT_ERROR,
          dates: [["2024-09-21", "FULL"]],
        },
      ],
      note: {
        message: "",
        dates: [],
      },
    };

    requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
    await requestController.postRequest(ctx);
    expect(ctx.body).toEqual(expectedResponse);
    expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
      ctx.request.body
    );
  });

  it("should return a (success, error[sameDayRequest], note) object when a there is an existing request for the inputted date", async () => {
    ctx.request.body = {
      staffId: 3,
      staffName: "Amy Cheong",
      reportingManager: 1,
      managerName: "John Doe",
      dept: "IT",
      requestedDates: [["2024-09-21", "FULL"]],
      reason: "Take care of mother",
    };

    const expectedServiceResponse: ResponseDates = {
      successDates: [],
      noteDates: [],
      errorDates: [["2023-09-21", "FULL"]],
      weekendDates: [],
      pastDates: [],
      pastDeadlineDates: [],
      duplicateDates: [],
      insertErrorDates: [],
    };

    const expectedResponse = {
      success: {
        message: "",
        dates: [],
      },
      error: [
        {
          message: errMsg.SAME_DAY_REQUEST,
          dates: [["2023-09-21", "FULL"]],
        },
      ],
      note: {
        message: "",
        dates: [],
      },
    };
    requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
    await requestController.postRequest(ctx);
    expect(ctx.body).toEqual(expectedResponse);
    expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
      ctx.request.body
    );
  });
});
