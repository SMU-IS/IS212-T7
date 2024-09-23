
import React, { useState, useEffect } from "react";

import {
  Form,
  Button,
  Input,
  DatePicker,
  Space,
  Select,
  Card,
  Typography,
} from "antd";
import { WFHDate, TimeOfDay, FormData } from "./types";
import {
  isWeekday,
  isAtLeast24HoursAhead,
  formatDate,
  getDatesInSameWeek,
} from "../../utils/wfh-dateUtils";
import { validateForm } from "../../utils/wfh-validation";
import { useToast } from "@chakra-ui/react";


const { Option } = Select;
const { Title } = Typography;

export const WFHForm = () => {
  const toast = useToast();
  // these 5 variables to be populated from db
  const [name, setName] = useState<string>("");
  const [staffID, setStaffID] = useState<string>("");
  const [dept, setDept] = useState<string>("");
  const [managerName, setManagerName] = useState<string>("");
  const [managerID, setManagerId] = useState<string>("");

  // these variables will require user input
  const [wfhDates, setWfhDates] = useState<WFHDate[]>([]);
  const [reason, setReason] = useState<string>("");
  // add code here to fetch user data from db

  // handlers
  const handleWfhDatesChange = (selectedDate: any) => {
    if (selectedDate && selectedDate.$d) {
      const newDate = selectedDate.$d;

      if (!isWeekday(newDate)) {
        toast({
          title: "Invalid date",
          description: "Please select a weekday.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!isAtLeast24HoursAhead(newDate)) {
        toast({
          title: "Invalid date",
          description: "Selected date must be at least 24 hours ahead.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const dateExists = wfhDates.some(
        (wfhDate) => wfhDate.date.toDateString() === newDate.toDateString(),
      );

      if (dateExists) {
        toast({
          title: "Date already selected",
          description: "Please choose a different date.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const datesInSameWeek = getDatesInSameWeek(
        newDate,
        wfhDates.map((wfhDate) => wfhDate.date),
      );
      if (datesInSameWeek.length >= 2) {
        toast({
          title: "Weekly limit exceeded",
          description: "You have selected more than 2 WFH days for this week.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      }

      setWfhDates((prev) => [...prev, { date: newDate, timeOfDay: "FULL" }]);
    }
  };

  //this handler takes index of the date being updated & the timeOfDay (AM, PM, or Full Day) and updates the respective WFH date
  const handleTimeOfDayChange = (index: number, timeOfDay: TimeOfDay) => {
    setWfhDates((prev) =>
      prev.map((wfhDate, i) =>
        i === index ? { ...wfhDate, timeOfDay } : wfhDate,
      ),
    );
  };

  const handleRemoveDate = (index: number) => {
    setWfhDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReasonChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setReason(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData: FormData = { wfhDates, reason };
    const validationError = validateForm(formData);
    if (validationError) {
      toast({
        title: "Form Error",
        description: validationError,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    // format "date as YYYY-MM-DD"
    const requestedDates = wfhDates.map((wfhDate) => {
      const date = wfhDate.date;
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return [`${year}-${month}-${day}`, wfhDate.timeOfDay];
    });

    // prepare final object to send to API
    const payload = {
      staffId: Number(staffID),
      staffName: name,
      reportingManager: Number(managerID),
      managerName: managerName,
      dept: dept,
      requestedDates: requestedDates,
      reason: reason,
    };

    // to check output
    console.log("Formatted Data:", payload);

    // Add code to send data to the server here

    toast({
      title: "Success",
      description: "WFH application submitted successfully!",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Card style={{ maxWidth: "600px", margin: "0 auto", padding: "10px" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Work-From-Home Application Form
      </Title>
      <Form layout="vertical" onSubmitCapture={handleSubmit}>
        <Form.Item label="Staff Name" name="staffName" initialValue={name}>
          <Input value={name} readOnly />
        </Form.Item>

        <Form.Item label="Staff ID" name="staffID" initialValue={staffID}>
          <Input value={staffID} readOnly />
        </Form.Item>

        <Form.Item label="Department" name="dept" initialValue={dept}>
          <Input value={dept} readOnly />
        </Form.Item>

        <Form.Item label="Manager's Name" name="managerName">
          <Input value={managerName} readOnly />
        </Form.Item>

        <Form.Item label="Manager ID" name="managerID" initialValue={managerID}>
          <Input value={managerID} readOnly />
        </Form.Item>

        <Form.Item label="Date of Application">
          <Input value={new Date().toISOString().split("T")[0]} readOnly />
        </Form.Item>

        <Form.Item
          label="Select Work-From-Home Dates"
          name="wfhDates"
          rules={[
            { required: true, message: "Please select work-from-home dates" },
          ]}
        >
          <DatePicker
            onChange={handleWfhDatesChange}
            format="YYYY-MM-DD"
            showTime={false}
            disabledDate={(date) => date && !isWeekday(date.toDate())}
          />
        </Form.Item>

        {wfhDates.map((wfhDate, index) => (
          <Form.Item key={index} label={`Date ${index + 1}`}>
            <Space>
              <span>{formatDate(wfhDate.date)}</span>
              <Select
                value={wfhDate.timeOfDay}
                onChange={(value) =>
                  handleTimeOfDayChange(index, value as TimeOfDay)
                }
                style={{ width: 120 }}
              >
                <Option value="AM">AM</Option>
                <Option value="PM">PM</Option>
                <Option value="FULL">Full Day</Option>
              </Select>
              <Button
                onClick={() => handleRemoveDate(index)}
                type="primary"
                danger
              >
                Remove
              </Button>
            </Space>
          </Form.Item>
        ))}

        <Form.Item
          label="Reason for Work-From-Home"
          name="reason"
          rules={[{ required: true, message: "Please provide a reason" }]}
        >
          <Input.TextArea
            value={reason}
            onChange={handleReasonChange}
            rows={4}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
