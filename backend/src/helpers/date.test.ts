import { weekMap, checkDate } from "./date";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);

describe("weekMap", () => {
  it("should correctly map dates to their respective week numbers (3 days of same week)", () => {
    const dates = [
      new Date("2024-09-19"),
      new Date("2024-09-20"),
      new Date("2024-09-21"),
    ];
    const result = weekMap(dates);
    expect(result).toStrictEqual({ "2024-38": 3 });
  });
});

describe("weekMap", () => {
  it("should correctly map dates to their respective week numbers (2 days from 2 different weeks)", () => {
    const dates = [new Date("2024-09-19"), new Date("2024-09-12")];
    const result = weekMap(dates);
    expect(result).toStrictEqual({ "2024-37": 1, "2024-38": 1 });
  });
});

describe("weekMap", () => {
  it("should correctly map dates to their respective week numbers (Monday and Sunday should be within same week)", () => {
    const dates = [new Date("2024-09-16"), new Date("2024-09-22")];
    const result = weekMap(dates);
    expect(result).toStrictEqual({ "2024-38": 2 });
  });
});

describe("checkDate", () => {
  it("should return true if there are already 2 or more requests in the same week", () => {
    const dates = [new Date("2024-09-19"), new Date("2024-09-20")];
    const weekMapping = weekMap(dates);
    expect(weekMapping).toStrictEqual({ "2024-38": 2 });
    const newDate = new Date("2024-09-21");
    const result = checkDate(newDate, weekMapping);
    expect(result).toBe(true);
  });

  it("should return false if there are less than 2 requests in the same week", () => {
    const dates = [new Date("2024-09-19")];
    const weekMapping = weekMap(dates);
    expect(weekMapping).toStrictEqual({ "2024-38": 1 });
    const newDate = new Date("2024-09-20");
    const result = checkDate(newDate, weekMapping);
    expect(result).toBe(false);
  });
});
