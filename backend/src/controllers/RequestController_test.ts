// import RequestController from "@/controllers/RequestController";
// import { errMsg, successMsg, noteMsg } from "@/helpers";
// import EmployeeService from "@/services/EmployeeService";
// import RequestService from "@/services/RequestService";
// import RequestDb from "@/database/RequestDb";
// import { Context } from "koa";
// import EmployeeDb from "@/database/EmployeeDb";
//
// describe("RequestController", () => {
//   let requestController: RequestController;
//   let employeeServiceMock: jest.Mocked<EmployeeService>;
//   let requestServiceMock: jest.Mocked<RequestService>;
//   let employeeDbMock: EmployeeDb;
//   let requestDbMock: RequestDb;
//   let ctx: Context;
//   type ResponseDates = {
//     successDates: [string, string][];
//     noteDates: [string, string][];
//     errorDates: [string, string][];
//   };
//
//   beforeEach(() => {
//     employeeDbMock = new EmployeeDb() as jest.Mocked<EmployeeDb>;
//     requestDbMock = new RequestDb() as jest.Mocked<RequestDb>;
//     employeeServiceMock = new EmployeeService(
//       employeeDbMock
//     ) as jest.Mocked<EmployeeService>;
//     requestServiceMock = new RequestService(
//       employeeServiceMock,
//       requestDbMock
//     ) as jest.Mocked<RequestService>;
//     requestController = new RequestController(requestServiceMock);
//     ctx = {
//       method: "POST",
//       query: {},
//       body: {},
//       request: { body: {} },
//       response: {},
//     } as Context;
//     requestServiceMock.postRequest = jest.fn();
//   });
//
//   afterEach(() => {
//     jest.resetAllMocks();
//   })
//
//   it("should return an error when missing parameters", async () => {
//     // Act
//     await requestController.postRequest(ctx);
//
//     // Assert
//     expect(ctx.body).toEqual({
//       errMsg: {
//         _errors: [],
//         staffId: {
//           _errors: ["Required"],
//         },
//         staffName: {
//           _errors: ["Required"],
//         },
//         reportingManager: {
//           _errors: ["Required"],
//         },
//         managerName: {
//           _errors: ["Required"],
//         },
//         dept: {
//           _errors: ["Required"],
//         },
//         requestedDates: {
//           _errors: ["Required"],
//         },
//         reason: {
//           _errors: ["Required"],
//         },
//       },
//     });
//   });
//
//   it("Happy Case: should return a (success{message, dates}, error, note) object when a valid date is inputted", async () => {
//     // Arrange
//     ctx.request.body = {
//       staffId: 3,
//       staffName: "Amy Cheong",
//       reportingManager: 1,
//       managerName: "John Doe",
//       dept: "IT",
//       requestedDates: [
//         ["2024-09-19", "FULL"],
//         ["2024-09-20", "FULL"],
//       ],
//       reason: "Take care of mother",
//     };
//
//     const expectedServiceResponse: ResponseDates = {
//       successDates: [
//         ["2024-09-19", "FULL"],
//         ["2024-09-20", "FULL"],
//       ],
//       noteDates: [],
//       errorDates: [],
//     };
//
//     const expectedResponse = {
//       success: {
//         message: successMsg,
//         dates: [
//           ["2024-09-19", "FULL"],
//           ["2024-09-20", "FULL"],
//         ],
//       },
//       error: {
//         message: "",
//         dates: [],
//       },
//       note: {
//         message: "",
//         dates: [],
//       },
//     };
//
//     requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
//
//     // Act
//     await requestController.postRequest(ctx);
//
//     // Assert
//     expect(ctx.body).toEqual(expectedResponse);
//     expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
//       ctx.request.body
//     );
//   });
//
//   it("Happy Case: should return a (success{message, dates}, error, note{message, dates}) object when a valid date is inputted but there is already >= 2 requests in that week", async () => {
//     // Arrange
//     ctx.request.body = {
//       staffId: 3,
//       staffName: "Amy Cheong",
//       reportingManager: 1,
//       managerName: "John Doe",
//       dept: "IT",
//       requestedDates: [
//         ["2024-09-19", "FULL"],
//         ["2024-09-20", "FULL"],
//       ],
//       reason: "Take care of mother",
//     };
//
//     const expectedServiceResponse: ResponseDates = {
//       successDates: [
//         ["2024-09-19", "FULL"],
//         ["2024-09-20", "FULL"],
//       ],
//       noteDates: [
//         ["2024-09-19", "FULL"],
//         ["2024-09-20", "FULL"],
//       ],
//       errorDates: [],
//     };
//
//     const expectedResponse = {
//       success: {
//         message: successMsg,
//         dates: [
//           ["2024-09-19", "FULL"],
//           ["2024-09-20", "FULL"],
//         ],
//       },
//       error: {
//         message: "",
//         dates: [],
//       },
//       note: {
//         message: noteMsg,
//         dates: [
//           ["2024-09-19", "FULL"],
//           ["2024-09-20", "FULL"],
//         ],
//       },
//     };
//
//     requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
//
//     // Act
//     await requestController.postRequest(ctx);
//
//     // Assert
//     expect(ctx.body).toEqual(expectedResponse);
//     expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
//       ctx.request.body
//     );
//   });
//
//   it("Sad Case: should return a (success, error{message, dates}, note) object when an invalid date is received", async () => {
//     // Arrange
//     ctx.request.body = {
//       staffId: 3,
//       staffName: "Amy Cheong",
//       reportingManager: 1,
//       managerName: "John Doe",
//       dept: "IT",
//       requestedDates: [
//         ["2024-09-19", "FULL"],
//         ["2024-09-20", "FULL"],
//       ],
//       reason: "Take care of mother",
//     };
//
//     const expectedServiceResponse: ResponseDates = {
//       successDates: [],
//       noteDates: [],
//       errorDates: [
//         ["2024-09-19", "FULL"],
//         ["2024-09-20", "FULL"],
//       ],
//     };
//
//     const expectedResponse = {
//       success: {
//         message: "",
//         dates: [],
//       },
//       error: {
//         message: errMsg.SAME_DAY_REQUEST,
//         dates: [
//           ["2024-09-19", "FULL"],
//           ["2024-09-20", "FULL"],
//         ],
//       },
//       note: {
//         message: "",
//         dates: [],
//       },
//     };
//
//     requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
//
//     // Act
//     await requestController.postRequest(ctx);
//
//     // Assert
//     expect(ctx.body).toEqual(expectedResponse);
//     expect(requestServiceMock.postRequest).toHaveBeenCalledWith(
//       ctx.request.body
//     );
//   });
// });
