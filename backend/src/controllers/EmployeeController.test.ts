import { Context } from "koa";
import EmployeeController from "@/controllers/EmployeeController";
import EmployeeService from "@/services/employeeService";

describe("EmployeeController", () => {
    let employeeController: EmployeeController;
    let employeeServiceMock: jest.Mocked<EmployeeService>;
    let ctx: Context;
    let mockEmployee: any;

    beforeEach(() => {
        employeeServiceMock = new EmployeeService() as jest.Mocked<EmployeeService>;
        employeeController = new EmployeeController(employeeServiceMock);
        ctx = {
            query: {},
            body: {},
        } as Context;
        mockEmployee = {
            staffId: 1,
            staffFName: "John",
            staffLName: "Doe",
            dept: "Development",
            position: "Developer",
            country: "USA",
            email: "test@example.com",
            reportingManager: null,
            role: 1
        };
        employeeServiceMock.getEmployeeByEmail = jest.fn();
        jest.resetAllMocks();
    });

    it("should return an error when missing parameters", async () => {
        await employeeController.getEmployeeByEmail(ctx);
        expect(ctx.body).toEqual({
            error: "Missing Parameters",
        });
    });

    it("should return employee role when a valid email and password is provided", async () => {
        ctx.query = { staffEmail: "test@example.com", staffPassword: "password" };
        const returnValue: any = {
            staffId: mockEmployee.staffId,
            role: mockEmployee.role
        };
        employeeServiceMock.getEmployeeByEmail.mockResolvedValue(returnValue);
        await employeeController.getEmployeeByEmail(ctx);
        console.log(ctx.body);
        expect(ctx.body).toEqual({
            staffId: mockEmployee.staffId,
            role: mockEmployee.role
        });
    });

    it("should inform user of failure to find an employee with provided email", async () => {
        ctx.query = { staffEmail: "nonexistent@example.com", staffPassword: "password" };
        employeeServiceMock.getEmployeeByEmail.mockResolvedValue(null);

        await employeeController.getEmployeeByEmail(ctx);
        expect(ctx.body).toEqual({
            error: "Employee not found.",
        });
    });
});
