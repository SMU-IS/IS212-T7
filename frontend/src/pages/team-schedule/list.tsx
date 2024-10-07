import {
    useEffect,
    useState,
  } from "react";
  
  import { useGetIdentity } from "@refinedev/core";
  import { EmployeeJWT } from "@/interfaces/employee";
  import axios from "axios";
  
  import { IResponseData } from "@/interfaces/schedule";
  import { Table, Tag, Typography } from "antd";
  const { Title } = Typography;
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
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

    const groupedData = calendarEvents.reduce((acc: Record<string, any[]>, item) => {
        const date = new Date(item.requestedDate).toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);

        return acc;
    }, {});

    const sortedDates = Object.keys(groupedData).sort().reverse();
    return (
        <div>
            {sortedDates
            .map((date) => {
            // Convert the date string to a Date object
            const eventDate = new Date(date);
            const currentDate = new Date();

            // Check if the date is in the past
            const isPastDate = eventDate < currentDate;

            return (
                <div key={date} style={{ marginBottom: '20px' }}>
                    <Title
                        level={4} // Level 4 corresponds to <h4>, you can adjust this to a different level
                        style={{ 
                            margin: 10, 
                            color: isPastDate ? 'gray' : '', // Change color for past dates
                        }}
                    >
                        {new Date(date).toLocaleDateString("en-CA", { 
                            timeZone: "Asia/Singapore",
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric', 
                            weekday: 'short',
                        })}
                        {isPastDate}
                    </Title>
                    <Table
                        columns={columns}
                        dataSource={groupedData[date]}
                        pagination={false}
                        rowKey={(record) => record.staffName + record.requestedDate} // Unique row key
                        tableLayout="fixed" // Ensure the table layout is fixed
                        style={{ display: 'flex' }} // Use flexbox for the table
                    />
                </div>
            );
        })}
        </div>
    );
  };
  