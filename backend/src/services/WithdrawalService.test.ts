import Mailer from "@/config/mailer";
import EmployeeDb from "@/database/EmployeeDb";
import LogDb from "@/database/LogDb";
import ReassignmentDb from "@/database/ReassignmentDb";
import RequestDb from "@/database/RequestDb";
import WithdrawalDb from "@/database/WithdrawalDb";
import {
  Action,
  HttpStatusResponse,
  PerformedBy,
  Status,
  Request,
} from "@/helpers";
import NotificationService from "@/services/NotificationService";
import ReassignmentService from "@/services/ReassignmentService";
import RequestService from "@/services/RequestService";
import WithdrawalService from "@/services/WithdrawalService";
import * as dateUtils from "@/helpers/date";
import {
  generateMockEmployeeTest,
  mockReassignmentData,
  mockRequestData,
  mockWithdrawalData,
} from "@/tests/mockData";
import { jest } from "@jest/globals";
import dayjs from "dayjs";
import nodemailer from "nodemailer";
import EmployeeService from "./EmployeeService";
import LogService from "./LogService";

describe("getWithdrawalRequest", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;
  let employeeDbMock: EmployeeDb;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let logDbMock: jest.Mocked<LogDb>;
  let logServiceMock: jest.Mocked<LogService>;
  let mockMailer: jest.Mocked<Mailer>;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let reassignmentDbMock: ReassignmentDb;
  let reassignmentServiceMock: jest.Mocked<ReassignmentService>;
  let withdrawalService: WithdrawalService;
  let withdrawalDbMock: jest.Mocked<WithdrawalDb>;

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    employeeDbMock = new EmployeeDb() as jest.Mocked<EmployeeDb>;
    reassignmentDbMock = new ReassignmentDb() as jest.Mocked<ReassignmentDb>;
    employeeServiceMock = new EmployeeService(
      employeeDbMock,
    ) as jest.Mocked<EmployeeService>;
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(null as never),
    } as unknown as jest.Mocked<nodemailer.Transporter>;
    mockMailer = {
      getInstance: jest.fn().mockReturnThis(),
      getTransporter: jest.fn().mockReturnValue(mockTransporter),
    } as unknown as jest.Mocked<Mailer>;

    notificationServiceMock = new NotificationService(
      employeeServiceMock,
      mockMailer,
    ) as jest.Mocked<NotificationService>;

    logDbMock = new LogDb() as jest.Mocked<LogDb>;
    logServiceMock = new LogService(
      logDbMock,
      employeeServiceMock,
      reassignmentDbMock,
    ) as jest.Mocked<LogService>;

    reassignmentServiceMock = new ReassignmentService(
      reassignmentDbMock,
      requestDbMock,
      employeeServiceMock,
      logServiceMock,
      notificationServiceMock,
    ) as jest.Mocked<ReassignmentService>;
    requestService = new RequestService(
      logServiceMock,
      employeeServiceMock,
      notificationServiceMock,
      requestDbMock,
      reassignmentServiceMock,
    );
    withdrawalDbMock = new WithdrawalDb() as jest.Mocked<WithdrawalDb>;

    withdrawalService = new WithdrawalService(
      logServiceMock,
      withdrawalDbMock,
      requestService,
      reassignmentServiceMock,
      employeeServiceMock,
      notificationServiceMock,
    );
    withdrawalDbMock.getWithdrawalRequest = jest.fn();
    jest.resetAllMocks();
  });

  it("should return array of withdrawal requests for a valid staffId", async () => {
    const { staffId } = mockWithdrawalData;
    withdrawalDbMock.getWithdrawalRequest.mockResolvedValue([
      mockWithdrawalData,
    ] as any);
    const result = await withdrawalService.getWithdrawalRequest(staffId);
    expect(result).toEqual([mockWithdrawalData] as any);
  });

  it("should return null for an invalid staffId", async () => {
    withdrawalDbMock.getWithdrawalRequest.mockResolvedValue([]);
    const result = await withdrawalService.getWithdrawalRequest(1044);
    expect(result).toEqual(null);
  });
});

describe("withdrawRequest", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;
  let employeeDbMock: EmployeeDb;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let logDbMock: jest.Mocked<LogDb>;
  let logServiceMock: jest.Mocked<LogService>;
  let mockMailer: jest.Mocked<Mailer>;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let reassignmentDbMock: ReassignmentDb;
  let reassignmentServiceMock: jest.Mocked<ReassignmentService>;
  let withdrawalService: WithdrawalService;
  let withdrawalDbMock: jest.Mocked<WithdrawalDb>;

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    employeeDbMock = new EmployeeDb() as jest.Mocked<EmployeeDb>;
    reassignmentDbMock = new ReassignmentDb() as jest.Mocked<ReassignmentDb>;
    employeeServiceMock = new EmployeeService(
      employeeDbMock,
    ) as jest.Mocked<EmployeeService>;
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(null as never),
    } as unknown as jest.Mocked<nodemailer.Transporter>;
    mockMailer = {
      getInstance: jest.fn().mockReturnThis(),
      getTransporter: jest.fn().mockReturnValue(mockTransporter),
    } as unknown as jest.Mocked<Mailer>;

    notificationServiceMock = new NotificationService(
      employeeServiceMock,
      mockMailer,
    ) as jest.Mocked<NotificationService>;

    logDbMock = new LogDb() as jest.Mocked<LogDb>;
    logServiceMock = new LogService(
      logDbMock,
      employeeServiceMock,
      reassignmentDbMock,
    ) as jest.Mocked<LogService>;

    reassignmentServiceMock = new ReassignmentService(
      reassignmentDbMock,
      requestDbMock,
      employeeServiceMock,
      logServiceMock,
      notificationServiceMock,
    ) as jest.Mocked<ReassignmentService>;
    requestService = new RequestService(
      logServiceMock,
      employeeServiceMock,
      notificationServiceMock,
      requestDbMock,
      reassignmentServiceMock,
    );
    withdrawalDbMock = new WithdrawalDb() as jest.Mocked<WithdrawalDb>;

    withdrawalService = new WithdrawalService(
      logServiceMock,
      withdrawalDbMock,
      requestService,
      reassignmentServiceMock,
      employeeServiceMock,
      notificationServiceMock,
    );
    withdrawalDbMock.withdrawRequest = jest.fn();
    requestDbMock.getApprovedRequestByRequestId = jest.fn();
    withdrawalDbMock.getWithdrawalRequest = jest.fn();
    requestDbMock.updateRequestinitiatedWithdrawalValue = jest.fn();
    logServiceMock.logRequestHelper = jest.fn();
    withdrawalDbMock.getWithdrawalRequest = jest.fn();
    employeeServiceMock.getEmployee = jest.fn();
    jest.resetAllMocks();
  });

  it("should return null for a valid requestId with existing pending / approved withdrawal", async () => {
    const { requestId } = mockWithdrawalData;
    requestDbMock.getApprovedRequestByRequestId.mockResolvedValue([
      mockRequestData.APPROVED,
    ] as any);
    withdrawalDbMock.getWithdrawalRequest.mockResolvedValue([
      mockWithdrawalData,
    ] as any);
    withdrawalDbMock.withdrawRequest.mockResolvedValue(HttpStatusResponse.OK);
    const result = await withdrawalService.withdrawRequest(requestId);
    expect(result).toEqual(null);
  });

  it("should return null for an invalid requestId", async () => {
    requestDbMock.getApprovedRequestByRequestId.mockResolvedValue([] as any);
    const result = await withdrawalService.getWithdrawalRequest(1044);
    expect(result).toEqual(null);
  });

  it("should return HttpStatusResponse.OK for a valid requestId with no existing pending / approved withdrawal", async () => {
    const { requestId } = mockWithdrawalData;
    requestDbMock.getApprovedRequestByRequestId.mockResolvedValue([
      mockRequestData.APPROVED,
    ] as any);
    jest.spyOn(dateUtils, "checkPastWithdrawalDate").mockReturnValue(false);
    jest.spyOn(dateUtils, "checkValidWithdrawalDate").mockReturnValue(true);
    requestDbMock.updateRequestinitiatedWithdrawalValue.mockResolvedValue(true);
    withdrawalDbMock.getWithdrawalRequest.mockResolvedValue([] as any);
    withdrawalDbMock.withdrawRequest.mockResolvedValue(HttpStatusResponse.OK);
    employeeServiceMock.getEmployee.mockResolvedValue(
      generateMockEmployeeTest as any,
    );
    const result = await withdrawalService.withdrawRequest(requestId);
    expect(result).toEqual(HttpStatusResponse.OK);
    expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
      requestType: Request.WITHDRAWAL,
      requestId: mockWithdrawalData.requestId,
      action: Action.APPLY,
    });
  });
});

describe("getOwnWithdrawalRequests", () => {
  let withdrawalService: WithdrawalService;
  let requestService: RequestService;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let logServiceMock: any;
  let reassignmentServiceMock: jest.Mocked<ReassignmentService>;
  let withdrawalDbMock: any;
  let notificationServiceMock: jest.Mocked<NotificationService>;

  beforeEach(() => {
    withdrawalDbMock = {
      getOwnWithdrawalRequests: jest.fn(),
    };
    logServiceMock = {
      logRequestHelper: jest.fn(),
    };

    withdrawalService = new WithdrawalService(
      logServiceMock,
      withdrawalDbMock,
      requestService,
      reassignmentServiceMock,
      employeeServiceMock,
      notificationServiceMock,
    );
  });

  it("should retrieve withdrawal requests and log the request when there are own requests", async () => {
    const staffId = 1;
    const ownRequests = [
      {
        staffName: "John Doe",
        dept: "Finance",
        position: "Accountant",
        reportingManager: 2,
        managerName: "Jane Smith",
      },
    ];

    withdrawalDbMock.getOwnWithdrawalRequests.mockResolvedValueOnce(
      ownRequests,
    );

    const result = await withdrawalService.getOwnWithdrawalRequests(staffId);

    expect(result).toEqual(ownRequests);
    expect(withdrawalDbMock.getOwnWithdrawalRequests).toHaveBeenCalledWith(
      staffId,
    );
    expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
      performedBy: staffId,
      requestType: "WITHDRAWAL",
      action: Action.RETRIEVE,
      staffName: ownRequests[0].staffName,
      dept: ownRequests[0].dept,
      position: ownRequests[0].position,
      reportingManagerId: ownRequests[0].reportingManager,
      managerName: ownRequests[0].managerName,
    });
  });

  it("should return an empty array and not log when there are no own requests", async () => {
    const staffId = 1;

    withdrawalDbMock.getOwnWithdrawalRequests.mockResolvedValueOnce([]);

    const result = await withdrawalService.getOwnWithdrawalRequests(staffId);

    expect(result).toEqual([]);
    expect(withdrawalDbMock.getOwnWithdrawalRequests).toHaveBeenCalledWith(
      staffId,
    );
    expect(logServiceMock.logRequestHelper).not.toHaveBeenCalled();
  });
});

describe("getWithdrawalRequestById", () => {
  let withdrawalService: WithdrawalService;
  let requestService: RequestService;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let logServiceMock: any;
  let reassignmentServiceMock: jest.Mocked<ReassignmentService>;
  let withdrawalDbMock: any;
  let notificationServiceMock: jest.Mocked<NotificationService>;

  beforeEach(() => {
    withdrawalDbMock = {
      getWithdrawalRequestById: jest.fn(),
    };

    withdrawalService = new WithdrawalService(
      logServiceMock,
      withdrawalDbMock,
      requestService,
      reassignmentServiceMock,
      employeeServiceMock,
      notificationServiceMock,
    );
  });

  it("should return the withdrawal request when found", async () => {
    const withdrawalId = 1;
    const mockRequest = {
      id: withdrawalId,
      staffName: "John Doe",
      dept: "Finance",
      position: "Accountant",
    };

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValueOnce(
      mockRequest,
    );

    const result =
      await withdrawalService.getWithdrawalRequestById(withdrawalId);

    expect(result).toEqual(mockRequest);
    expect(withdrawalDbMock.getWithdrawalRequestById).toHaveBeenCalledWith(
      withdrawalId,
    );
  });

  it("should return null when the withdrawal request is not found", async () => {
    const withdrawalId = 1;

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValueOnce(null);

    const result =
      await withdrawalService.getWithdrawalRequestById(withdrawalId);

    expect(result).toBeNull();
    expect(withdrawalDbMock.getWithdrawalRequestById).toHaveBeenCalledWith(
      withdrawalId,
    );
  });
});

describe("updateWithdrawalStatusToExpired", () => {
  let withdrawalService: WithdrawalService;
  let withdrawalDbMock: any;
  let logServiceMock: any;
  let requestServiceMock: any;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let reassignmentServiceMock: jest.Mocked<ReassignmentService>;
  let notificationServiceMock: jest.Mocked<NotificationService>;

  beforeEach(() => {
    withdrawalDbMock = {
      updateWithdrawalStatusToExpired: jest.fn(),
    };

    logServiceMock = {
      logRequestHelper: jest.fn(),
    };

    employeeServiceMock = {
      getEmployee: jest.fn(),
    } as any;

    notificationServiceMock = {
      notify: jest.fn(),
    } as any;

    withdrawalService = new WithdrawalService(
      logServiceMock,
      withdrawalDbMock,
      requestServiceMock,
      reassignmentServiceMock,
      employeeServiceMock,
      notificationServiceMock,
    );
  });

  it("should update withdrawal status, notify the employee, and log the action", async () => {
    const mockRequest = [
      {
        requestId: "123",
        requestedDate: "2024-10-26T10:00:00Z",
        requestType: "SomeType",
        staffId: "staff123",
      },
    ];
    const mockEmployee = {
      email: "employee@example.com",
    };

    withdrawalDbMock.updateWithdrawalStatusToExpired.mockResolvedValue(
      mockRequest,
    );
    employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee as any);

    await withdrawalService.updateWithdrawalStatusToExpired();

    expect(withdrawalDbMock.updateWithdrawalStatusToExpired).toHaveBeenCalled();

    expect(employeeServiceMock.getEmployee).toHaveBeenCalledWith(
      mockRequest[0].staffId,
    );

    expect(notificationServiceMock.notify).toHaveBeenCalledWith(
      mockEmployee.email,
      `[WITHDRAWAL] Withdrawal Expired`,
      `Your request withdrawal has expired. Please contact your reporting manager for more details.`,
      null,
      [
        [
          dayjs(mockRequest[0].requestedDate).format("YYYY-MM-DD"),
          mockRequest[0].requestType,
        ],
      ],
    );

    expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
      performedBy: PerformedBy.SYSTEM,
      requestId: mockRequest[0].requestId,
      requestType: "WITHDRAWAL",
      action: Action.EXPIRE,
      dept: PerformedBy.PERFORMED_BY_SYSTEM,
      position: PerformedBy.PERFORMED_BY_SYSTEM,
    });
  });

  it("should not proceed with notification and logging if no withdrawal request is found", async () => {
    withdrawalDbMock.updateWithdrawalStatusToExpired.mockResolvedValue(null);

    await withdrawalService.updateWithdrawalStatusToExpired();

    expect(employeeServiceMock.getEmployee).not.toHaveBeenCalled();
    expect(notificationServiceMock.notify).not.toHaveBeenCalled();
    expect(logServiceMock.logRequestHelper).not.toHaveBeenCalled();
  });

  it("should not log the action if no withdrawal requests are returned", async () => {
    withdrawalDbMock.updateWithdrawalStatusToExpired.mockResolvedValueOnce(
      null,
    );

    await withdrawalService.updateWithdrawalStatusToExpired();

    expect(withdrawalDbMock.updateWithdrawalStatusToExpired).toHaveBeenCalled();
    expect(logServiceMock.logRequestHelper).not.toHaveBeenCalled();
  });
});

describe("rejectWithdrawalRequest", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;
  let employeeDbMock: EmployeeDb;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let logDbMock: jest.Mocked<LogDb>;
  let logServiceMock: jest.Mocked<LogService>;
  let mockMailer: jest.Mocked<Mailer>;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let reassignmentDbMock: ReassignmentDb;
  let reassignmentServiceMock: jest.Mocked<ReassignmentService>;
  let withdrawalService: WithdrawalService;
  let withdrawalDbMock: jest.Mocked<WithdrawalDb>;

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    employeeDbMock = new EmployeeDb() as jest.Mocked<EmployeeDb>;
    reassignmentDbMock = new ReassignmentDb() as jest.Mocked<ReassignmentDb>;
    employeeServiceMock = new EmployeeService(
      employeeDbMock,
    ) as jest.Mocked<EmployeeService>;
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(null as never),
    } as unknown as jest.Mocked<nodemailer.Transporter>;
    mockMailer = {
      getInstance: jest.fn().mockReturnThis(),
      getTransporter: jest.fn().mockReturnValue(mockTransporter),
    } as unknown as jest.Mocked<Mailer>;

    notificationServiceMock = new NotificationService(
      employeeServiceMock,
      mockMailer,
    ) as jest.Mocked<NotificationService>;

    logDbMock = new LogDb() as jest.Mocked<LogDb>;
    logServiceMock = new LogService(
      logDbMock,
      employeeServiceMock,
      reassignmentDbMock,
    ) as jest.Mocked<LogService>;

    reassignmentServiceMock = new ReassignmentService(
      reassignmentDbMock,
      requestDbMock,
      employeeServiceMock,
      logServiceMock,
      notificationServiceMock,
    ) as jest.Mocked<ReassignmentService>;
    requestService = new RequestService(
      logServiceMock,
      employeeServiceMock,
      notificationServiceMock,
      requestDbMock,
      reassignmentServiceMock,
    );
    withdrawalDbMock = new WithdrawalDb() as jest.Mocked<WithdrawalDb>;

    withdrawalService = new WithdrawalService(
      logServiceMock,
      withdrawalDbMock,
      requestService,
      reassignmentServiceMock,
      employeeServiceMock,
      notificationServiceMock,
    );
    withdrawalDbMock.getWithdrawalRequestById = jest.fn();
    withdrawalDbMock.rejectWithdrawalRequest = jest.fn();
    reassignmentServiceMock.getReassignmentActive = jest.fn();
    logServiceMock.logRequestHelper = jest.fn();
    employeeServiceMock.getEmployee = jest.fn();
    jest.resetAllMocks();
  });

  it("should return null if the request is not found or not pending", async () => {
    const performedBy = 2;
    const withdrawalId = 1;
    const reason = "plans cancelled";

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(null);

    const result = await withdrawalService.rejectWithdrawalRequest(
      performedBy,
      withdrawalId,
      reason,
    );

    expect(result).toBeNull();
  });

  it("should return null if the performer is not the reporting manager and there is no active reassignment", async () => {
    const performedBy = 2;
    const withdrawalId = 1;
    const reason = "plans cancelled";
    const mockRequest = {
      id: withdrawalId,
      status: Status.PENDING,
      requestId: 100,
      reportingManager: 1,
    };

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(
      mockRequest as any,
    );
    reassignmentServiceMock.getReassignmentActive.mockResolvedValue(null);

    const result = await withdrawalService.rejectWithdrawalRequest(
      performedBy,
      withdrawalId,
      reason,
    );

    expect(result).toBeNull();
  });

  it("should return null if approving the withdrawal request fails", async () => {
    const performedBy = 2;
    const withdrawalId = 1;
    const reason = "plans cancelled";
    const mockRequest = {
      id: withdrawalId,
      status: Status.PENDING,
      requestId: 100,
      reportingManager: 1,
    };

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(
      mockRequest as any,
    );
    withdrawalDbMock.rejectWithdrawalRequest.mockResolvedValue(null);

    const result = await withdrawalService.rejectWithdrawalRequest(
      performedBy,
      withdrawalId,
      reason,
    );

    expect(result).toBeNull();
  });

  it("should return OK if rejecting the withdrawal request is done successfully", async () => {
    const performedBy = 2;
    const withdrawalId = 1;
    const reason = "plans cancelled";
    const mockRequest = {
      id: withdrawalId,
      status: Status.PENDING,
      requestId: 100,
      reportingManager: 1,
    };

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(
      mockRequest as any,
    );
    reassignmentServiceMock.getReassignmentActive.mockResolvedValue(
      mockReassignmentData as any,
    );

    withdrawalDbMock.rejectWithdrawalRequest.mockResolvedValue(
      HttpStatusResponse.OK,
    );

    employeeServiceMock.getEmployee.mockResolvedValue(
      generateMockEmployeeTest as any,
    );

    const result = await withdrawalService.rejectWithdrawalRequest(
      performedBy,
      withdrawalId,
      reason,
    );

    expect(result).toEqual(HttpStatusResponse.OK);
    expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        requestType: Request.WITHDRAWAL,
        reason: reason,
        performedBy: performedBy,
        requestId: mockRequest.id,
        action: Action.REJECT,
      }),
    );
  });
});

describe("approveWithdrawalRequest", () => {
  let requestService: jest.Mocked<RequestService>;
  let requestDbMock: jest.Mocked<RequestDb>;
  let employeeDbMock: EmployeeDb;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let logDbMock: jest.Mocked<LogDb>;
  let logServiceMock: jest.Mocked<LogService>;
  let mockMailer: jest.Mocked<Mailer>;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let reassignmentDbMock: ReassignmentDb;
  let reassignmentServiceMock: jest.Mocked<ReassignmentService>;
  let withdrawalService: WithdrawalService;
  let withdrawalDbMock: jest.Mocked<WithdrawalDb>;

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    employeeDbMock = new EmployeeDb() as jest.Mocked<EmployeeDb>;
    reassignmentDbMock = new ReassignmentDb() as jest.Mocked<ReassignmentDb>;
    employeeServiceMock = new EmployeeService(
      employeeDbMock,
    ) as jest.Mocked<EmployeeService>;
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(null as never),
    } as unknown as jest.Mocked<nodemailer.Transporter>;
    mockMailer = {
      getInstance: jest.fn().mockReturnThis(),
      getTransporter: jest.fn().mockReturnValue(mockTransporter),
    } as unknown as jest.Mocked<Mailer>;

    notificationServiceMock = new NotificationService(
      employeeServiceMock,
      mockMailer,
    ) as jest.Mocked<NotificationService>;

    logDbMock = new LogDb() as jest.Mocked<LogDb>;
    logServiceMock = new LogService(
      logDbMock,
      employeeServiceMock,
      reassignmentDbMock,
    ) as jest.Mocked<LogService>;

    reassignmentServiceMock = new ReassignmentService(
      reassignmentDbMock,
      requestDbMock,
      employeeServiceMock,
      logServiceMock,
      notificationServiceMock,
    ) as jest.Mocked<ReassignmentService>;
    requestService = new RequestService(
      logServiceMock,
      employeeServiceMock,
      notificationServiceMock,
      requestDbMock,
      reassignmentServiceMock,
    ) as jest.Mocked<RequestService>;
    withdrawalDbMock = new WithdrawalDb() as jest.Mocked<WithdrawalDb>;

    withdrawalService = new WithdrawalService(
      logServiceMock,
      withdrawalDbMock,
      requestService,
      reassignmentServiceMock,
      employeeServiceMock,
      notificationServiceMock,
    );
    withdrawalDbMock.getWithdrawalRequestById = jest.fn();
    withdrawalDbMock.approveWithdrawalRequest = jest.fn();
    reassignmentServiceMock.getReassignmentActive = jest.fn();
    requestService.setWithdrawnStatus = jest.fn();
    employeeServiceMock.getEmployee = jest.fn();
    logServiceMock.logRequestHelper = jest.fn();
    jest.resetAllMocks();
  });

  it("should return null if the request is not found or not pending", async () => {
    const performedBy = 2;
    const withdrawalId = 1;

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(null);

    const result = await withdrawalService.approveWithdrawalRequest(
      performedBy,
      withdrawalId,
    );

    expect(result).toBeNull();
  });

  it("should return null if the performer is not the reporting manager and there is no active reassignment", async () => {
    const performedBy = 2;
    const withdrawalId = 1;
    const mockRequest = {
      id: withdrawalId,
      status: Status.PENDING,
      requestId: 100,
      reportingManager: 1,
    };

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(
      mockRequest as any,
    );
    reassignmentServiceMock.getReassignmentActive.mockResolvedValue(null);

    const result = await withdrawalService.approveWithdrawalRequest(
      performedBy,
      withdrawalId,
    );

    expect(result).toBeNull();
  });

  it("should return null if approving the withdrawal request fails", async () => {
    const performedBy = 2;
    const withdrawalId = 1;
    const mockRequest = {
      id: withdrawalId,
      status: Status.PENDING,
      requestId: 100,
      reportingManager: 1,
    };

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(
      mockRequest as any,
    );
    withdrawalDbMock.approveWithdrawalRequest.mockResolvedValue(null);

    const result = await withdrawalService.approveWithdrawalRequest(
      performedBy,
      withdrawalId,
    );

    expect(result).toBeNull();
  });

  it("should return OK if approving the withdrawal request is done successfully", async () => {
    const performedBy = 2;
    const withdrawalId = 1;
    const mockRequest = {
      id: withdrawalId,
      status: Status.PENDING,
      requestId: 100,
      reportingManager: 1,
    };

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(
      mockRequest as any,
    );
    reassignmentServiceMock.getReassignmentActive.mockResolvedValue(
      mockReassignmentData as any,
    );

    requestService.setWithdrawnStatus.mockResolvedValue(HttpStatusResponse.OK);

    withdrawalDbMock.approveWithdrawalRequest.mockResolvedValue(
      HttpStatusResponse.OK,
    );

    employeeServiceMock.getEmployee.mockResolvedValue(
      generateMockEmployeeTest as any,
    );

    const result = await withdrawalService.approveWithdrawalRequest(
      performedBy,
      withdrawalId,
    );

    expect(result).toEqual(HttpStatusResponse.OK);

    expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        requestType: Request.WITHDRAWAL,
        performedBy: performedBy,
        requestId: mockRequest.id,
        action: Action.APPROVE,
      }),
    );
  });

  it("should return null if setting the withdrawn status fails", async () => {
    const performedBy = 2;
    const withdrawalId = 1;
    const mockRequest = {
      id: withdrawalId,
      status: Status.PENDING,
      requestId: 100,
      reportingManager: 1,
    };

    withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(
      mockRequest as any,
    );
    reassignmentServiceMock.getReassignmentActive.mockResolvedValue(
      mockReassignmentData as any,
    );

    requestService.setWithdrawnStatus.mockResolvedValue(null);

    withdrawalDbMock.approveWithdrawalRequest.mockResolvedValue(
      HttpStatusResponse.OK,
    );

    const result = await withdrawalService.approveWithdrawalRequest(
      performedBy,
      withdrawalId,
    );

    expect(result).toBeNull();
  });
});

describe("getSubordinatesWithdrawalRequests", () => {
  let requestService: RequestService;
  let requestDbMock: jest.Mocked<RequestDb>;
  let employeeDbMock: EmployeeDb;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let logDbMock: jest.Mocked<LogDb>;
  let logServiceMock: jest.Mocked<LogService>;
  let mockMailer: jest.Mocked<Mailer>;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let reassignmentDbMock: ReassignmentDb;
  let reassignmentServiceMock: jest.Mocked<ReassignmentService>;
  let withdrawalService: jest.Mocked<WithdrawalService>;
  let withdrawalDbMock: jest.Mocked<WithdrawalDb>;

  beforeEach(() => {
    requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
    employeeDbMock = new EmployeeDb() as jest.Mocked<EmployeeDb>;
    reassignmentDbMock = new ReassignmentDb() as jest.Mocked<ReassignmentDb>;
    employeeServiceMock = new EmployeeService(
      employeeDbMock,
    ) as jest.Mocked<EmployeeService>;
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(null as never),
    } as unknown as jest.Mocked<nodemailer.Transporter>;
    mockMailer = {
      getInstance: jest.fn().mockReturnThis(),
      getTransporter: jest.fn().mockReturnValue(mockTransporter),
    } as unknown as jest.Mocked<Mailer>;

    notificationServiceMock = new NotificationService(
      employeeServiceMock,
      mockMailer,
    ) as jest.Mocked<NotificationService>;

    logDbMock = new LogDb() as jest.Mocked<LogDb>;
    logServiceMock = new LogService(
      logDbMock,
      employeeServiceMock,
      reassignmentDbMock,
    ) as jest.Mocked<LogService>;

    reassignmentServiceMock = new ReassignmentService(
      reassignmentDbMock,
      requestDbMock,
      employeeServiceMock,
      logServiceMock,
      notificationServiceMock,
    ) as jest.Mocked<ReassignmentService>;
    requestService = new RequestService(
      logServiceMock,
      employeeServiceMock,
      notificationServiceMock,
      requestDbMock,
      reassignmentServiceMock,
    );
    withdrawalDbMock = new WithdrawalDb() as jest.Mocked<WithdrawalDb>;

    withdrawalService = new WithdrawalService(
      logServiceMock,
      withdrawalDbMock,
      requestService,
      reassignmentServiceMock,
      employeeServiceMock,
      notificationServiceMock,
    ) as jest.Mocked<WithdrawalService>;
    withdrawalDbMock.getWithdrawalRequest = jest.fn();
    withdrawalDbMock.getSubordinatesWithdrawalRequests = jest.fn();
    reassignmentServiceMock.getActiveReassignmentAsTempManager = jest.fn();
    logServiceMock.logRequestHelper = jest.fn();
    employeeServiceMock.getEmployee = jest.fn();
    jest.resetAllMocks();
  });

  it("should log the request when there are subordinates' withdrawal requests", async () => {
    const mockWithdrawalData = [
      {
        requestId: 1,
        staffId: 150245,
        staffName: "Benjamin Tan",
        reportingManager: 151408,
        managerName: "Philip Lee",
        dept: "Engineering",
        position: "Call Centre",
        reason: "Plans cancelled",
        requestedDate: new Date("2024-09-15T00:00:00.000Z"),
        requestType: "AM",
        withdrawalId: 6,
        status: "PENDING",
      },
    ];

    const { reportingManager } = mockWithdrawalData[0];

    withdrawalDbMock.getSubordinatesWithdrawalRequests.mockResolvedValue(
      mockWithdrawalData as any,
    );

    reassignmentServiceMock.getActiveReassignmentAsTempManager.mockResolvedValue(
      null,
    );

    employeeServiceMock.getEmployee.mockResolvedValue({
      staffFName: "Philip",
      staffLName: "Lee",
      dept: "Engineering",
      position: "Manager",
    } as any);

    const result = await withdrawalService.getSubordinatesWithdrawalRequests(
      reportingManager,
      true,
    );

    expect(result).toEqual(mockWithdrawalData);

    expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        requestType: Request.WITHDRAWAL,
        performedBy: reportingManager,
        action: Action.RETRIEVE,
        staffName: "Philip Lee",
        dept: "Engineering",
        position: "Manager",
      }),
    );
  });

  it("should return [] if there is no reassignments", async () => {
    const { reportingManager } = mockWithdrawalData;
    withdrawalDbMock.getSubordinatesWithdrawalRequests.mockResolvedValue([]);
    reassignmentServiceMock.getActiveReassignmentAsTempManager.mockResolvedValue(
      null,
    );
    const result =
      await withdrawalService.getSubordinatesWithdrawalRequests(
        reportingManager,
      );
    expect(result).toEqual([]);
  });

  it("should return combined requests if there is active reassignment", async () => {
    const reportingManager = 1;
    const mockTempRequests = [{ id: 2, staffId: 3 }];
    const mockReassignmentData = { active: true, staffId: 3 };
    withdrawalDbMock.getSubordinatesWithdrawalRequests.mockResolvedValue([]);
    reassignmentServiceMock.getActiveReassignmentAsTempManager.mockResolvedValue(
      mockReassignmentData as any,
    );
    jest
      .spyOn(withdrawalService, "getSubordinatesWithdrawalRequests")
      .mockResolvedValue(mockTempRequests as any);

    const result =
      await withdrawalService.getSubordinatesWithdrawalRequests(
        reportingManager,
      );

    expect(result).toEqual(mockTempRequests);
  });
});
