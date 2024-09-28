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
import { Box, useToast } from "@chakra-ui/react";
import { useGetIdentity } from "@refinedev/core";
import axios from "axios";
import { EmployeeJWT } from "@/interfaces/employee";
import { WFHDate, TimeOfDay, FormData } from "./types";
import {
  isWeekday,
  isAtLeast24HoursAhead,
  formatDate,
  getDatesInSameWeek,
} from "../../utils/wfh-dateUtils";
import { validateForm } from "../../utils/wfh-validation";

const { Option } = Select;
const { Title } = Typography;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const WFHForm: React.FC = () => {
  const toast = useToast();
  const { data: user } = useGetIdentity<EmployeeJWT>();
  const [form] = Form.useForm();

  const [employeeData, setEmployeeData] = useState({
    name: "",
    staffID: "",
    dept: "",
    managerName: "",
    managerID: "",
  });
  const [wfhDates, setWfhDates] = useState<WFHDate[]>([]);
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.staffId) {
      fetchEmployeeData(user.staffId);
    }
  }, [user]);

  useEffect(() => {
    // Update form fields when employeeData changes
    form.setFieldsValue(employeeData);
  }, [employeeData, form]);

  const fetchEmployeeData = async (staffId: string) => {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/getEmployee`, {
        params: { staffId },
        timeout: 300000,
      });

      const { staffId: id, staffFName, staffLName, dept, reportingManager, reportingManagerName } = response.data;
      const newEmployeeData = {
        name: `${staffFName} ${staffLName}`,
        staffID: id,
        dept,
        managerName: reportingManagerName,
        managerID: reportingManager,
      };
      setEmployeeData(newEmployeeData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      showToast("Error", "Failed to load employee data", "error");
    }
  };

  const handleWfhDatesChange = (selectedDate: any) => {
    if (selectedDate && selectedDate.$d) {
      const newDate = selectedDate.$d;

      if (!isValidDate(newDate)) return;

      setWfhDates((prev) => [...prev, { date: newDate, timeOfDay: "FULL" }]);
    }
  };

  const isValidDate = (date: Date): boolean => {
    if (!isWeekday(date)) {
      showToast("Invalid date", "Please select a weekday.", "error");
      return false;
    }

    if (!isAtLeast24HoursAhead(date)) {
      showToast("Invalid date", "Selected date must be at least 24 hours ahead.", "error");
      return false;
    }

    const dateExists = wfhDates.some((wfhDate) => wfhDate.date.toDateString() === date.toDateString());
    if (dateExists) {
      showToast("Date already selected", "Please choose a different date.", "warning");
      return false;
    }

    const datesInSameWeek = getDatesInSameWeek(date, wfhDates.map((wfhDate) => wfhDate.date));
    if (datesInSameWeek.length >= 2) {
      showToast("Weekly limit exceeded", "You have selected more than 2 WFH days for this week.", "info");
    }

    return true;
  };

  const showToast = (title: string, description: string, status: "error" | "warning" | "info" | "success") => {
    toast({
      title,
      description,
      status,
      duration: 3000,
      isClosable: true,
    });
  };

  const handleTimeOfDayChange = (index: number, timeOfDay: TimeOfDay) => {
    setWfhDates((prev) =>
      prev.map((wfhDate, i) => (i === index ? { ...wfhDate, timeOfDay } : wfhDate))
    );
  };

  const handleRemoveDate = (index: number) => {
    setWfhDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setReason(e.target.value);
  };

  const handleSubmit = async (values: any) => {
    const formData: FormData = { wfhDates, reason: values.reason };
    const validationError = validateForm(formData);
    
    if (validationError) {
      showToast("Form Error", validationError, "error");
      return;
    }

    const requestedDates = wfhDates.map((wfhDate) => [
      wfhDate.date.toISOString().split('T')[0],
      wfhDate.timeOfDay
    ]);

    const payload = {
      staffId: Number(employeeData.staffID),
      staffName: employeeData.name,
      reportingManager: Number(employeeData.managerID),
      managerName: String(employeeData.managerName),
      dept: employeeData.dept,
      requestedDates,
      reason: values.reason,
    };

    try {
      const response = await axios.post(`${backendUrl}/api/v1/postRequest`, payload);
      // console.log('Incoming request data:', payload);
      // console.log(response.data);
      if (response.data.success) {
        showToast("Success", "WFH application submitted successfully!", "success");
      } else {
        throw new Error("Failed to submit the WFH application.");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Error", "An error occurred while submitting the WFH application.", "error");
    }

  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Card style={{ maxWidth: "600px", margin: "0 auto", padding: "10px" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Work-From-Home Application Form
      </Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {Object.entries(employeeData).map(([key, value]) => (
          <Form.Item key={key} label={key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase())}  name={key}>
            <Input value={value} readOnly />
          </Form.Item>
        ))}

        <Form.Item label="Date of Application">
          <Input value={new Date().toISOString().split("T")[0]} readOnly />
        </Form.Item>

        <Form.Item
          label="Select Work-From-Home Dates"
          name="wfhDates"
          rules={[{ required: true, message: "Please select work-from-home dates" }]}
        >
          <DatePicker
            onChange={handleWfhDatesChange}
            format="YYYY-MM-DD"
            disabledDate={(date) => date && !isWeekday(date.toDate())}
          />
        </Form.Item>

        {wfhDates.map((wfhDate, index) => (
          <Form.Item key={index} label={`Date ${index + 1}`}>
            <Space>
              <span>{formatDate(wfhDate.date)}</span>
              <Select
                value={wfhDate.timeOfDay}
                onChange={(value) => handleTimeOfDayChange(index, value as TimeOfDay)}
                style={{ width: 120 }}
              >
                <Option value="AM">AM</Option>
                <Option value="PM">PM</Option>
                <Option value="FULL">Full Day</Option>
              </Select>
              <Button onClick={() => handleRemoveDate(index)} type="primary" danger>
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
          <Input.TextArea rows={4} />
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

