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
import calendarVar from '../../helper/scheduleVar'
import '@schedule-x/theme-default/dist/index.css'

export const ScheduleList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });
  const { mode } = useContext(ColorModeContext);
  const calendarTheme = mode === "dark" ? "dark" : "light";
  const calendarRef = useRef<Calendar | null>(null);
  const eventData: IEvent[] = [
    {
      id: '1',
      title: 'WORK FROM HOME (AM)',
      description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi tempora temporibus, eveniet delectus, explicabo quibusdam sed inventore iure repellat cupiditate nisi. Reprehenderit, repudiandae.",
      // people: ["John"],
      calendarId: calendarVar.halfday,
      start: '2024-09-18 08:00',
      end: '2024-09-18 13:00',
    },
    {
      id: '2',
      title: 'WORK FROM HOME',
      description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi tempora temporibus, eveniet delectus, explicabo quibusdam sed inventore iure repellat cupiditate nisi. Reprehenderit, repudiandae.",
      start: '2024-09-17',
      end: '2024-09-17',
    },
    {
      id: '3',
      title: 'WORK FROM HOME',
      description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi tempora temporibus, eveniet delectus, explicabo quibusdam sed inventore iure repellat cupiditate nisi. Reprehenderit, repudiandae.",
      start: '2024-09-19',
      end: '2024-09-20',
    },
  ]
  const calendarConfig = {
      halfday: {
        colorName: calendarVar.halfday,
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
  }
  useEffect(() => {
    const newCalendar = createCalendar({
      views: [createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
      events: eventData,
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
      calendars: calendarConfig
    });

    calendarRef.current = newCalendar;
  }, []);

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.setTheme(calendarTheme);
    }
  }, [calendarTheme]);

  return (
    <div>
      <h1>My Schedule</h1>
      <ScheduleXCalendar key={calendarTheme} calendarApp={calendarRef.current} />
    </div>
  );
};
