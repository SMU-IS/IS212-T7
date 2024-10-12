import { useEffect, useState } from "react";

import { useGetIdentity } from "@refinedev/core";
import { EmployeeJWT } from "@/interfaces/employee";
import axios from "axios";

import { IResponseData } from "@/interfaces/schedule";
import { Tag, Typography } from "antd";

import EventTableGroup from "@/components/scheduleTable/EventTableGroup";

// Tabs
import { Tabs } from "antd";
import type { TabsProps } from "antd";
// Stats
import { ClockCircleOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";
// Checkbox
import { Checkbox, Divider } from 'antd';
import type { CheckboxProps } from 'antd';
// Date Picker
import type { DatePickerProps } from 'antd';
import { DatePicker, Space } from 'antd';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const { Title } = Typography;

export const TeamScheduleList = () => {
  const { data: user } = useGetIdentity<EmployeeJWT>();
  const [allCalendarEvents, setallCalendarEvents] = useState<IResponseData[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<IResponseData[]>([]); // State for calendar events

  const [deptName, setDeptName] = useState<string>('');
  const [manpower, setManpower] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user?.staffId) {
      fetchScheduleData(user);
    }
  }, [user]);

  const fetchScheduleData = async (user: EmployeeJWT) => {
    try {
        const responseData = await axios.get(`${backendUrl}/api/v1/getSchedule`, {
            headers: {
            id: user.staffId,
            },
            timeout: 300000,
        });
        const eventArr: IResponseData[] = responseData?.data?.wfh_arrangements || [];
        const teamData = responseData?.data?.department || {};
    
        const department = teamData.dept;
        const manpowerData = Object.keys(teamData).reduce((acc: Record<string, number>, key) => {
            if (key !== 'dept') {
                acc[key] = teamData[key];
            }
            return acc;
        }, {});
        setDeptName(department);
        setManpower(manpowerData);

        // Update calendar events
        if (Array.isArray(eventArr) && eventArr.length > 0) {
            setCalendarEvents(eventArr || []); // Set the events if the data exists
            setallCalendarEvents(eventArr || [])
            
        } else {
            console.warn("No events to set in the calendar");
        }
    } catch (error) {
      // console.error("Error fetching schedule data:", error);
    }
  };

  const columns = [
    {
      title: "Staff Name",
      dataIndex: "staffName",
      key: "staffName",
      render: (text: string, record: any) => {
        const isCurrentUser = record.staffId === user?.staffId;
        return (
          <span
            style={{
              color: isCurrentUser ? "green" : "inherit",
              fontWeight: isCurrentUser ? "bold" : "normal",
            }}
          >
            {isCurrentUser ? `${text} (ME)` : text}
          </span>
        );
      },
      onCell: () => ({
        style: {
          flex: 2, // Adjust this value based on desired ratio
        },
      }),
    },
    {
      title: "Manager Name",
      dataIndex: "managerName",
      key: "managerName",
      onCell: () => ({
        style: {
          flex: 2, // Adjust this value based on desired ratio
        },
      }),
    },
    {
      title: "Department",
      dataIndex: "dept",
      key: "dept",
      onCell: () => ({
        style: {
          flex: 1, // Adjust this value based on desired ratio
        },
      }),
    },
    {
      title: "Position (Team)",
      dataIndex: "position",
      key: "pos",
      onCell: () => ({
        style: {
          flex: 1, // Adjust this value based on desired ratio
        },
      }),
    },
    {
      title: "Request Type",
      dataIndex: "requestType",
      key: "requestType",
      render: (requestType: string) => {
        let color = "";
        switch (requestType) {
          case "FULL":
            color = "purple"; // Color for full day requests
            break;
          case "PM":
          case "AM":
            color = "gold"; // Color for PM requests
            break;
          default:
            color = "gray"; // Default color for unknown types
            break;
        }
        return <Tag color={color}>{requestType}</Tag>;
      },
      onCell: () => ({
        style: {
          flex: 1, // Adjust this value based on desired ratio
        },
      }),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      onCell: () => ({
        style: {
          flex: 3, // Adjust this value based on desired ratio
        },
      }),
    },
  ];

  // Group data by date - Incoming or Past
  const upcomingData = calendarEvents.reduce(
    (acc: Record<string, any[]>, item) => {
      const date = new Date(item.requestedDate).toLocaleDateString("en-CA", {
        timeZone: "Asia/Singapore",
      });
      const currentDate = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Singapore",
      });
      if (date > currentDate) {
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
      }

      return acc;
    },
    {},
  );

  const pastData = calendarEvents.reduce((acc: Record<string, any[]>, item) => {
    const date = new Date(item.requestedDate).toLocaleDateString("en-CA", {
      timeZone: "Asia/Singapore",
    });
    const currentDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Singapore",
    });
    if (date < currentDate) {
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
    }

    return acc;
  }, {});

  const sortedUpcomingDates = Object.keys(upcomingData).sort();
  const sortedPastDates = Object.keys(pastData).sort().reverse();

  // Tab Config - Insert table data
  const tabItems: TabsProps["items"] = [
    {
      key: "1",
      label: "Upcoming",
      children: (
        <div>
          <EventTableGroup
            sortedDates={sortedUpcomingDates}
            groupedData={upcomingData}
            columns={columns}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Past",
      children: (
        <div>
          <EventTableGroup
            sortedDates={sortedPastDates}
            groupedData={pastData}
            columns={columns}
          />
        </div>
      ),
    },
  ];

  // Checkbox
  const CheckboxGroup = Checkbox.Group;
  const plainOptions = Object.keys(manpower);
  const [checkedList, setCheckedList] = useState<string[]>(plainOptions);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [totalManpower, setTotalManpower] = useState<number>(0);

  const calculateTotalManpower = (data: Record<string, number>) => {
    const total = Object.values(data).reduce((acc, value) => acc + value, 0);
    setTotalManpower(total);
  };
  
  useEffect(() => {
    if (plainOptions.length > 0) {
        setCheckedList(plainOptions); // Set all options to checked by default  
        // Call the function with the manpower data
        calculateTotalManpower(manpower);
    }
  }, [manpower]);

  const onChange = (list: string[]) => {
    setCheckedList(list);
    let filteredEvents = allCalendarEvents
    if (selectedDate){
        filteredEvents = allCalendarEvents.filter((event: IResponseData) => {
            const eventDate = new Date(event.requestedDate).toLocaleDateString("en-CA", {
                timeZone: "Asia/Singapore",
              }); 
            return eventDate === selectedDate;
        } 
        );
    }
    const filterByTeam = filteredEvents.filter((event: IResponseData) => 
        list.includes(event?.position) // Check if event.position is in the checkedOptions
    );
    setCalendarEvents(filterByTeam)

    const selectedTeam = list.reduce((acc, team) => {
        if (manpower[team] !== undefined) { // Check if the team exists in manpowerData
            acc[team] = manpower[team];
        }
        return acc;
    }, {});
    calculateTotalManpower(selectedTeam);

  };

  const onChangeDate: DatePickerProps['onChange'] = (date, dateString) => {
    if (typeof dateString === "string") {
        setSelectedDate(dateString); // Ensure you only set a string
    }
    let filteredEvents = allCalendarEvents
    if (date){
        filteredEvents = allCalendarEvents.filter((event: IResponseData) => {
            const eventDate = new Date(event.requestedDate).toLocaleDateString("en-CA", {
                timeZone: "Asia/Singapore",
              }); 
            return eventDate === dateString;
        } 
        );
    }
    const filterByTeam = filteredEvents.filter((event: IResponseData) => 
        checkedList.includes(event?.position) // Check if event.position is in the checkedOptions
    );
    setCalendarEvents(filterByTeam)
  };

  return (
    <div>
      <Title level={3}>{deptName} Department</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Upcoming WFH"
              value={Object.values(upcomingData)
                .flat() // Flatten the arrays into a single array
                .length}
              valueStyle={{ color: "#1890ff" }} // Set to a blue color for upcoming requests
              prefix={<CalendarOutlined />} // Change the icon to something relevant for upcoming (e.g., calendar icon)
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Past WFH"
              value={Object.values(pastData)
                .flat() // Flatten the arrays into a single array
                .length}
              valueStyle={{ color: "#808080" }} // Red color for past requests
              prefix={<ClockCircleOutlined />} // Clock icon for past events
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title={selectedDate? "Working In Office (" + selectedDate + ")" : "Working In Office"}
              value={selectedDate? totalManpower - Object.values(upcomingData)
                .flat() // Flatten the arrays into a single array
                .length + "/" + totalManpower: "Select a date"}
              valueStyle={{ color: selectedDate? "#1890ff": "#808080" }} // Red color for past requests
              prefix={<UserOutlined />} // Clock icon for past events
            />
          </Card>
        </Col>
      </Row>
      <Divider />
        <Row justify="space-between" align="middle">
            <Col>
                <Title level={4}>Teams</Title>
                <CheckboxGroup options={plainOptions} value={checkedList} onChange={onChange} />
            </Col>
            <Col>
                <Space direction="vertical">
                <DatePicker onChange={onChangeDate} />
                </Space>
            </Col>
        </Row>
        <Divider />
      <Tabs defaultActiveKey="1" items={tabItems} />
    </div>
  );
};
