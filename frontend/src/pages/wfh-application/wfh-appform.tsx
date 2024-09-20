import React, { useState } from "react";
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
} from "../../utils/wfh-dateUtils";
import { validateForm } from "../../utils/wfh-validation";

const { Option } = Select;
const { Title } = Typography;

export const WFHForm = () => {
  // these 4 variables to be populated from db
  const [name, setName] = useState<string>("");
  const [staffID, setStaffID] = useState<string>("");
  const [managerName, setManagerName] = useState<string>("");
  const [managerID, setManagerId] = useState<string>("");

  // these variables will require user input
  const [wfhDates, setWfhDates] = useState<WFHDate[]>([]);
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // handlers
  const handleWfhDatesChange = (selectedDate: any) => {
    // Clear any prev error messages
    setError(null);

    if (selectedDate && selectedDate.$d) {
      const newDate = selectedDate.$d;

      if (isAtLeast24HoursAhead(newDate)) {
        // Check if the date already exists in wfhDates
        const dateExists = wfhDates.some(
          (wfhDate) => wfhDate.date.toDateString() === newDate.toDateString(),
        );

        if (!dateExists) {
          setWfhDates((prev) => [
            ...prev,
            { date: newDate, timeOfDay: "Full Day" },
          ]);
        } else {
          setError(
            "This date has already been selected. Please choose a different date.",
          );
        }
      } else {
        setError("Selected Date must be at least 24 Hours Ahead");
      }
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
      setError(validationError);
    } else {
      setError(null);
      console.log("Form submitted:", formData);
      // add code to send data to server here!!!
      // can modify alert to a better ui
      alert("WFH application submitted successfully!");
    }
  };

  return (
    <Card style={{ maxWidth: "600px", margin: "0 auto", padding: "10px" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Work-From-Home Application Form
      </Title>
      <Form layout="vertical" onSubmitCapture={handleSubmit}>
        <Form.Item label="Staff Name" name="staffName" initialValue={name}>
          <Input value={name} aria-disabled />
        </Form.Item>

        <Form.Item label="Staff ID" name="staffID" initialValue={staffID}>
          <Input value={staffID} aria-disabled />
        </Form.Item>

        <Form.Item
          label="Manager's Name"
          name="managerName"
          initialValue={managerName}
        >
          <Input value={managerName} aria-disabled />
        </Form.Item>

        <Form.Item label="Manager ID" name="managerID" initialValue={managerID}>
          <Input value={managerID} aria-disabled />
        </Form.Item>

        <Form.Item label="Date of Application">
          <Input value={new Date().toISOString().split("T")[0]} aria-disabled />
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
                <Option value="Full Day">Full Day</Option>
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

        {error && <div style={{ color: "red" }}>{error}</div>}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
