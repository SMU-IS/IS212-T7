import {
    useEffect,
    useContext,
    useState,
    useRef
  } from "react";
  
  import { useGetIdentity } from "@refinedev/core";
  import { EmployeeJWT } from "@/interfaces/employee";
  import axios from "axios";
  
  import { IResponseData } from "@/interfaces/schedule";
  import { Table, Space, Tag, Card, Typography } from "antd";
  const { Title } = Typography;
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  export const TeamScheduleList = () => {
  
    const { data: user } = useGetIdentity<EmployeeJWT>();
    const [calendarEvents, setCalendarEvents] = useState<IResponseData[]>([]); // State for calendar events
    useEffect(() => {
      if (user?.staffId) {
        console.log(user)
        fetchScheduleData(user)
      }
    }, [user]);
    
    const fetchScheduleData = async (user: EmployeeJWT) => {
      try {
        const responseData = await axios.get(`${backendUrl}/api/v1/getTeamSchedule`, {
          params: { 
            myId: user.staffId, 
            reportingManager: user.reportingManager,
            dept: user.dept },
          timeout: 300000,
        });
        const eventArr: IResponseData[] = responseData?.data || [];
        // Update calendar events
        setCalendarEvents(eventArr);
        
      } catch (error) {
        console.error("Error fetching schedule data:", error);
  
      }
    };

    useEffect(() => {
        console.log(calendarEvents)
      }, [calendarEvents]);
  
    const columns = [
    {
        title: "Staff Name",
        dataIndex: "staffName",
        key: "staffName",
        render: (text: string, record: any) => {
            // Assuming 'userStaffId' is the current user's staffId
            const isCurrentUser = record.staffId === user?.staffId;
            return (
                <span style={{ color: isCurrentUser ? 'green' : 'inherit', fontWeight: isCurrentUser ? 'bold' : 'normal' }}>
                    {isCurrentUser ? `${text} (ME)` : text}
                </span>
            );
        }
    },
    {
        title: "Manager Name",
        dataIndex: "managerName",
        key: "managerName",
    },
    {
        title: "Department",
        dataIndex: "dept",
        key: "dept",
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
    },
    {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
    },
    ];

    const groupedData = calendarEvents.reduce((acc: Record<string, any[]>, item) => {
        const date = new Date(item.requestedDate).toLocaleDateString("en-CA");
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {});

    return (
        <div>
            {Object.keys(groupedData).map((date) => (
                <div key={date} style={{ marginBottom: '20px' }}>
                    <Title
                            level={4} // Level 4 corresponds to <h4>, you can adjust this to a different level
                            style={{ 
                                margin: 10, 
                            }}
                        >
                            {new Date(date).toLocaleDateString(undefined, { 
                                year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
                            })}
                        </Title>
                    <Table
                        columns={columns}
                        dataSource={groupedData[date]}
                        pagination={false}
                        rowKey={(record) => record.staffName + record.requestedDate} // Unique row key
                    />
                </div>
            ))}
        </div>
    );
  };
  