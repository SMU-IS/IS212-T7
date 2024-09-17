import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";

import {
  useEffect,
  useContext,
  useState,
  useRef
} from "react";

import { ColorModeContext } from "../../contexts/color-mode";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";

import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  createCalendar,
  viewMonthGrid 
} from '@schedule-x/calendar'
import { createEventModalPlugin } from '@schedule-x/event-modal'
 
import '@schedule-x/theme-default/dist/index.css'


export const ScheduleList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });
  const { mode } = useContext(ColorModeContext);
  const calendarTheme = mode === "dark" ? "dark" : "light";
  const calendarRef = useRef<Calendar | null>(null);
  
  useEffect(() => {
    const newCalendar = createCalendar({
      views: [createViewMonthGrid(), createViewMonthAgenda()],
      events: [
        {
          id: '1',
          title: 'John - WORK FROM HOME',
          description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi tempora temporibus, eveniet delectus, explicabo quibusdam sed inventore iure repellat cupiditate nisi. Reprehenderit, repudiandae. Dignissimos praesentium ducimus aperiam non cumque rerum!",
          people: ["John"],
          calendarId: "personal",
          start: '2024-09-18',
          end: '2024-09-18',
        },
        {
          id: '2',
          title: 'WORK FROM HOME',
          start: '2024-09-17',
          end: '2024-09-17',
        },
        {
          id: '3',
          title: 'WORK FROM HOME',
          start: '2024-09-17',
          end: '2024-09-17',
        },
        {
          id: '4',
          title: 'WORK FROM HOME',
          start: '2024-09-17',
          end: '2024-09-17',
        },
      ],
      isDark: calendarTheme === "dark", // Dynamically set the dark mode
      plugins: [createEventModalPlugin()],
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
