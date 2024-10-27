import { Context } from 'koa';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import EmployeeController from '@/controllers/EmployeeController';
import EmployeeService from '@/services/EmployeeService';
import EmployeeDb from '@/database/EmployeeDb';
import Employee from '@/models/Employee';
import { errMsg } from "@/helpers";
import path from "path";
import { readFileSync } from "fs";
import { hashPassword } from "@/tests/utils";

// Unmock mongoose and Employee model specifically for this test file
jest.unmock('mongoose');
jest.unmock('@/models/Employee');

describe('Employee Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let employeeController: EmployeeController;
  let ctx: Context;

  const filePath = path.resolve("@/../script/employee.json");
  const fileContent = readFileSync(filePath, "utf-8");
  const employees = JSON.parse(fileContent);

  beforeAll(async () => {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);

    // Initialize the controller with its dependencies
    const employeeDb = new EmployeeDb();
    const employeeService = new EmployeeService(employeeDb);
    employeeController = new EmployeeController(employeeService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections
    await Employee.deleteMany();

    const EMPLOYEE_LIMIT = 50; // Adjust this value as needed

    // Populate table
    for (let i = 0; i < Math.min(EMPLOYEE_LIMIT, employees.length); i++) {
      const employeeData = employees[i];
      employeeData.hashedPassword = await hashPassword("password123");
      await Employee.create(employeeData);
    }

    // Reset mock context
    ctx = {
      method: 'POST',
      query: {},
      body: {},
      request: { body: {} },
      response: {},
    } as Context;
  }, 60000); // Run for 1 min.

  describe('getEmployeeByEmail', () => {
    it('should return employee data when credentials are valid', async () => {
      ctx.request.body = {
        staffEmail: 'jack.sim@allinone.com.sg',
        staffPassword: 'password123'
      };

      await employeeController.getEmployeeByEmail(ctx);

      expect(ctx.body).toMatchObject({
        staffId: 130002,
        name: 'Jack Sim',
        dept: 'CEO',
        position: 'MD',
        email: 'jack.sim@allinone.com.sg',
        reportingManager: 130002,
        role: 1,
      });
    });

    it('should return error for non-existent user', async () => {
      ctx.request.body = {
        staffEmail: 'nonexistent@lurence.org',
        staffPassword: 'test-password'
      };

      await employeeController.getEmployeeByEmail(ctx);

      expect(ctx.body).toEqual({
        error: errMsg.USER_DOES_NOT_EXIST
      });
    });
  });
});