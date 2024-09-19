import { Context } from "koa";
import EmployeeController from "@/controllers/EmployeeController";
import EmployeeService from "@/services/employeeService";
import { errMsg } from "@/helpers";

import generateMockEmployee from "../../tests/mockData/mockData";

describe("EmployeeController", () => {
    let employeeController: EmployeeController;
    let employeeServiceMock: jest.Mocked<EmployeeService>;
    let ctx: Context;
    let mockEmployee: any;

    beforeEach(() => {
        employeeServiceMock = new EmployeeService() as jest.Mocked<EmployeeService>;
        employeeController = new EmployeeController(employeeServiceMock);
        ctx = {
            method: "POST",
            query: {},
            body: {},
            request: { body: {} },
            response: {},
        } as Context;
        mockEmployee = generateMockEmployee();
        employeeServiceMock.getEmployeeByEmail = jest.fn();
        jest.resetAllMocks();
    });

    it("should return an error when missing parameters", async () => {
        // Act
        await employeeController.getEmployeeByEmail(ctx);

        // Assert
        expect(ctx.body).toEqual({
            error: errMsg.MISSING_PARAMETERS,
        });
    });

    it("should return employee role when a valid email and password is provided", async () => {
        // Arrange
        ctx.request.body = { staffEmail: "test@example.com", staffPassword: "password" };
        const returnValue: any = {
            staffId: mockEmployee.staffId,
            role: mockEmployee.role
        };
        employeeServiceMock.getEmployeeByEmail.mockResolvedValue(returnValue);

        // Act
        await employeeController.getEmployeeByEmail(ctx);

        // Assert
        expect(ctx.body).toEqual({
            staffId: mockEmployee.staffId,
            role: mockEmployee.role
        });
    });

    it("should inform user of failure to find an employee with provided email", async () => {
        // Arrange
        ctx.request.body = { staffEmail: "nonexistent@example.com", staffPassword: "password" };
        employeeServiceMock.getEmployeeByEmail.mockResolvedValue(null);

        // Act
        await employeeController.getEmployeeByEmail(ctx);

        // Assert
        expect(ctx.body).toEqual({
            error: errMsg.USER_DOES_NOT_EXIST,
        });
    });
});
