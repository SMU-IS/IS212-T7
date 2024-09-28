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
import '@schedule-x/theme-default/dist/index.css'

import { useApiUrl, useCustom } from "@refinedev/core";


export const ScheduleList = () => {
  const { tableProps } = useTable({
    queryOptions: {
      keepPreviousData: true,
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

  // Calendar Data
  const calendarConfig = {
      halfday: {
        colorName: calendarVar.HALFDAY,
        lightColors: {
          main: '#f9d71c',
          container: '#fff5aa',
          onContainer: '#594800',
        },
        darkColors: {
          main: '#fff5c0',
          onContainer: '#fff5de',
          container: '#a29742',
        },
      },
      fullday: {
        colorName: calendarVar.FULLDAY,
        lightColors: {
          main: '#f91c45',
          container: '#ffd2dc',
          onContainer: '#59000d',
        },
        darkColors: {
          main: '#ffc0cc',
          onContainer: '#ffdee6',
          container: '#a24258',
        },
      },
  }

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
              start.setHours(13, 0, 0); // 13:00
              end = new Date(item.requestedDate);
              end.setHours(18, 0, 0); // 18:00
              start = start.toISOString().replace('T', ' ').split('.')[0];
              end = end.toISOString().replace('T', ' ').split('.')[0];
              break;
  
            case "AM":
              start = new Date(item.requestedDate);
              start.setHours(8, 0, 0); // 08:00
              end = new Date(item.requestedDate);
              end.setHours(13, 0, 0); // 13:00
              start = start.toISOString().replace('T', ' ').split('.')[0];
              end = end.toISOString().replace('T', ' ').split('.')[0];
              break;
  
            default:
              start = end = new Date(item.requestedDate).toISOString().split('T')[0];
              break;
          }
  
          return {
            id: item.requestId.toString(),
            title: `WORK FROM HOME${item.requestType === 'AM' ? ' (AM)' : ''}`,
            description: `Request by ${item.staffName} to ${item.reason}`,
            start,
            end,
            calendarId: item.requestType == "FULL" ? "full": 'halfday'
          };
        });
        // Update calendar events
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
        calendars: calendarConfig,
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
      <div id="calendar"></div>
    </div>
  );
};
