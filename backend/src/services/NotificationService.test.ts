import NotificationService from "@/services/NotificationService";
import EmployeeService from "@/services/EmployeeService";
import Mailer from "@/config/mailer";
import { jest } from "@jest/globals";
import nodemailer from "nodemailer";

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;
  let mockMailer: jest.Mocked<Mailer>;

  beforeEach(() => {
    employeeServiceMock = {
      getEmployee: jest.fn(),
    } as any;

    mockTransporter = {
      sendMail: jest.fn().mockImplementation(() => Promise.resolve())
    } as unknown as jest.Mocked<nodemailer.Transporter>;
    mockMailer = {
      getInstance: jest.fn().mockReturnThis(),
      getTransporter: jest.fn().mockReturnValue(mockTransporter),
    } as unknown as jest.Mocked<Mailer>;

    notificationService = new NotificationService(employeeServiceMock, mockMailer);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("pushRequestSentNotification", () => {
    const mockStaffEmail = "staff@lurence.org";
    const mockManagerId = 1;
    const mockRequestDates: [string, string][] = [["2023-06-01", "Full Day"]];
    const mockRequestReason = "Working on project";

    it("should send an email successfully", async () => {
      employeeServiceMock.getEmployee.mockResolvedValue({
        staffFName: "John",
        staffLName: "Doe",
        email: "john.doe@lurence.org",
      } as any);

      const result = await notificationService.pushRequestSentNotification(
        mockStaffEmail,
        mockManagerId,
        mockRequestDates,
        mockRequestReason
      );

      expect(result).toBe("Email sent successfully!");
      expect(employeeServiceMock.getEmployee).toHaveBeenCalledWith(mockManagerId);
      expect(mockMailer.getTransporter().sendMail).toHaveBeenCalled();
    });

    it("should handle error when manager details are not found", async () => {
      employeeServiceMock.getEmployee.mockResolvedValue(null);

      const result = await notificationService.pushRequestSentNotification(
        mockStaffEmail,
        mockManagerId,
        mockRequestDates,
        mockRequestReason
      );

      expect(result).toBe("Failed to send email");
      expect(employeeServiceMock.getEmployee).toHaveBeenCalledWith(mockManagerId);
      expect(mockMailer.getTransporter().sendMail).not.toHaveBeenCalled();
    });

    it("should handle error when sending email fails", async () => {
      employeeServiceMock.getEmployee.mockResolvedValue({
        staffFName: "John",
        staffLName: "Doe",
        email: "john.doe@example.com",
      } as any);

      (mockTransporter.sendMail as jest.Mock).mockRejectedValue(new Error("Send failed") as never);

      const result = await notificationService.pushRequestSentNotification(
        mockStaffEmail,
        mockManagerId,
        mockRequestDates,
        mockRequestReason
      );

      expect(result).toBe("Failed to send email");
    });

    it("should throw an error when no request dates are provided", async () => {
      employeeServiceMock.getEmployee.mockResolvedValue({
        staffFName: "John",
        staffLName: "Doe",
        email: "john.doe@example.com",
      } as any);

      const result = await notificationService.pushRequestSentNotification(
        mockStaffEmail,
        mockManagerId,
        [],
        mockRequestReason
      );

      expect(result).toBe("Failed to send email");
    });
  });
});
