"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { AttendanceStreak, AttendanceStreakData } from "../attendance/attendance-streak";
import { Organisation } from "@/lib/data/organisation";
import { getEventsByOrganisationId } from "@/lib/data/event";
import { getAttendancePrivateInfoByEventId } from "@/lib/data/attendance";
import { Member } from "@/lib/data/member";

async function getAttendanceStreakData(org: Organisation): Promise<AttendanceStreakData> {
  const attendanceStreakData: AttendanceStreakData = {};

  // Populate with org member data
  if (org.member_data) {
    for (const member of org.member_data as Member[]) {
      if (!(member.email in attendanceStreakData)) {
        attendanceStreakData[member.email] = {
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          attendanceData: [],
        }
      }
    }
  }

  // Get all events in org
  const allEvents = await getEventsByOrganisationId(org.id);

  // Get attendance for each event
  const attendanceDataPromises = allEvents.map(event => 
    getAttendancePrivateInfoByEventId(event.id)
  );

  // Flatten the attendance data
  const allAttendanceData = (await Promise.all(attendanceDataPromises)).flat();

  // Populate attendance streak data
  for (const attendance of allAttendanceData) {
    if (attendance.email in attendanceStreakData) {
      attendanceStreakData[attendance.email].attendanceData.push(attendance);
    }
  }

  return attendanceStreakData;
}

export function OrgAttendanceStreak({ org }: { org: Organisation }) {
  const [attendanceStreakData, setAttendanceStreakData] = useState<AttendanceStreakData>()
  const [disabled, setDisabled] = useState(false)

  async function onClick() {
    try {
      setDisabled(true)
      const data = await getAttendanceStreakData(org)
      setAttendanceStreakData(data)
    } catch {
      setDisabled(false)
    }
  }

  if (!attendanceStreakData) {
    return (
      <Button onClick={onClick} variant="secondary" className="font-medium" disabled={disabled}>
        Load attendance streak
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance streak</CardTitle>
        <CardDescription>Click on a streak entry to view event details.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="px-6 overflow-x-scroll">
          <AttendanceStreak data={attendanceStreakData} />
        </div>
        <div className="px-6"></div>
      </CardContent>
    </Card>
  );
}