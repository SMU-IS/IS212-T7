import {
    useEffect,
    useState,
} from "react";

import { useGetIdentity } from "@refinedev/core";
import { EmployeeJWT } from "@/interfaces/employee";
import axios from "axios";

import { IResponseData } from "@/interfaces/schedule";
import { Tag, Typography } from "antd";

import EventTableGroup from "@/components/scheduleTable/EventTableGroup"

// Tabs
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
// Stats
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const { Title } = Typography;

export const TeamScheduleList = () => {

const { data: user } = useGetIdentity<EmployeeJWT>();
const [calendarEvents, setCalendarEvents] = useState<IResponseData[]>([]); // State for calendar events
useEffect(() => {
    if (user?.staffId) {
    fetchScheduleData(user)
    }
}, [user]);

const fetchScheduleData = async (user: EmployeeJWT) => {
    try {
    const responseData = await axios.get(`${backendUrl}/api/v1/getTeamSchedule`, {
        headers: { 
            id: user.staffId,
            },
        params: { 
            reportingManager: user.reportingManager,
            dept: user.dept },
        timeout: 300000,
    });
    const eventArr: IResponseData[] = responseData?.data || [];
    // Update calendar events
    if (Array.isArray(eventArr) && eventArr.length > 0) {
        setCalendarEvents(eventArr || []);  // Set the events if the data exists
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
            <span style={{ color: isCurrentUser ? 'green' : 'inherit', fontWeight: isCurrentUser ? 'bold' : 'normal' }}>
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
const upcomingData = calendarEvents.reduce((acc: Record<string, any[]>, item) => {
    const date = new Date(item.requestedDate).toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
    const currentDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
    if (date > currentDate){
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
    }

    return acc;
}, {});

const pastData = calendarEvents.reduce((acc: Record<string, any[]>, item) => {
    const date = new Date(item.requestedDate).toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
    const currentDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
    if (date < currentDate){
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
const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Upcoming',
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
      key: '2',
      label: 'Past',
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

return (
    <div>
        <Title
        level={3}
        >
            {user?.dept || "No Department Info"} Department
        </Title>
        <Row gutter={16}>
            <Col span={8}>
            <Card bordered={false}>
                <Statistic
                title="Upcoming WFH"
                value={Object.keys(upcomingData).length}
                valueStyle={{ color: '#1890ff' }} // Set to a blue color for upcoming requests
                prefix={<CalendarOutlined />} // Change the icon to something relevant for upcoming (e.g., calendar icon)
                />
            </Card>
            </Col>
            <Col span={8}>
            <Card bordered={false}>
                <Statistic
                title="Past WFH"
                value={Object.keys(pastData).length}
                valueStyle={{ color: '#808080' }} // Red color for past requests
                    prefix={<ClockCircleOutlined />} // Clock icon for past events
                />
            </Card>
            </Col>
        </Row>
        <Tabs defaultActiveKey="1" items={tabItems} />
    </div>
);
};
