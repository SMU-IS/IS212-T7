import {
  useTable,
} from "@refinedev/antd";

import {
  useEffect,
  useContext,
  useState,
  useRef
} from "react";

import { ColorModeContext } from "../../contexts/color-mode";
import { useCalendarApp, ScheduleXCalendar, Calendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  createCalendar,
  viewMonthGrid,
} from '@schedule-x/calendar'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createEventsServicePlugin } from '@schedule-x/events-service'

import calendarVar from '../../helper/scheduleVar'
import { customCalendarConfig } from "@/config/calendarType";
import '@schedule-x/theme-default/dist/index.css'

import { useApiUrl, useCustom } from "@refinedev/core";
import { IEvent } from "@/interfaces/schedule";


export const ScheduleList = () => {
  const { tableProps } = useTable({
    syncWithLocation: false,
    queryOptions: {
      enabled: false,
      keepPreviousData: false,
    },
  });
  const myId = 140008; // Change ID according to user
  const apiUrl = useApiUrl();

  const [calendarEvents, setCalendarEvents] = useState<IEvent[]>([]); // State for calendar events
  const { data: responseData, isLoading: scheduleIsLoading } = useCustom<IResponseData[]>({
    url: `${apiUrl}/api/v1/getMySchedule`,
    method: "get",
    config: {
      query: {
        myId: myId
      },
    },
  });

  const { mode } = useContext(ColorModeContext);
  const calendarTheme = mode === "dark" ? "dark" : "light";
  const calendarRef = useRef<Calendar | null>(null);

  // Data manipulation
  useEffect(() => {
    const fetchSchedule = async () => {
      if (responseData && !scheduleIsLoading) {
        const formattedData: IEvent[] = responseData.data?.map((item) => {
          let start, end;
  
          switch (item.requestType) {
            case "FULL":
              start = new Date(item.requestedDate).toISOString().split('T')[0];
              end = start;
              break;
  
            case "PM":
              start = new Date(item.requestedDate);
              end = new Date(item.requestedDate);
              start = `${start.toISOString().split('T')[0]} 13:00` // Hard set time for PM
              end = `${end.toISOString().split('T')[0]} 18:00`
              console.log(start, end)
              break;
  
            case "AM":
              start = new Date(item.requestedDate);
              end = new Date(item.requestedDate);
              start = `${start.toISOString().split('T')[0]} 08:00` // Hard set time for AM
              end = `${end.toISOString().split('T')[0]} 12:00`
              break;
  
            default:
              start = end = new Date(item.requestedDate).toISOString().split('T')[0];
              break;
          }
          console.log(start)
          let calendarColor;
          const titleStatus = "";
          if (item.status == "PENDING"){
            calendarColor = item.requestType == "FULL" ? calendarVar.PENDINGFULL: calendarVar.PENDINGHALF
            // titleStatus = "[PENDING] "
          }else{
            calendarColor = item.requestType == "FULL" ? calendarVar.FULLDAY: calendarVar.HALFDAY
          }
          return {
            id: item.requestId.toString(),
            title: `${titleStatus}Work from Home (${item.requestType})`,
            description: `Request by ${item.staffName} to ${item.reason}`,
            start,
            end,
            calendarId: calendarColor
          };
        });
        // Update calendar events
        console.log(formattedData)
        setCalendarEvents(formattedData || []);
      }
    };
    fetchSchedule();
  }, [responseData, scheduleIsLoading]);

  useEffect(() => {
    if (!calendarRef.current && calendarEvents.length > 0) {
      calendarRef.current = createCalendar({
        views: [createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
        events: calendarEvents, // Initially empty
        isDark: calendarTheme === "dark", // Dynamically set the dark mode
        defaultView: viewMonthGrid.name,
        weekOptions: {
          gridHeight: 500,
          nDays: 5,
          timeAxisFormatOptions: { hour: '2-digit', minute: '2-digit' },
        },
        dayBoundaries: {
          start: '08:00',
          end: '18:00',
        },
        plugins: [createEventModalPlugin()],
        calendars: customCalendarConfig,
      });
      calendarRef.current.render(document.getElementById('calendar'));
    }
  }, [calendarEvents]);

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.setTheme(calendarTheme);
    }
  }, [calendarTheme]);

  return (
    <div>
      <div id="calendar" style={{ height: "650px", maxHeight: "90vh" }}></div>
    </div>
  );
};
