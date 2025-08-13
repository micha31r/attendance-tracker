"use client"
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { AttendanceStreak, AttendanceStreakData } from "../attendance/attendance-streak";
import { Event } from "@/lib/data/event";
import { getAttendancePrivateInfoByEventId } from "@/lib/data/attendance";
import { Member } from "@/lib/data/member";
import { Team } from "@/lib/data/team";

async function getAttendanceStreakData(team: Team, allEvents: Event[]): Promise<AttendanceStreakData> {
  const attendanceStreakData: AttendanceStreakData = {};

  if (team.default_attendee_data) {
    for (const member of team.default_attendee_data as Member[]) {
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

  const attendanceDataPromises = allEvents.map(event => 
    getAttendancePrivateInfoByEventId(event.id)
  );

  const allAttendanceData = (await Promise.all(attendanceDataPromises)).flat();

  for (const attendance of allAttendanceData) {
    if (attendance.email in attendanceStreakData) {
      attendanceStreakData[attendance.email].attendanceData.push(attendance);
    }
  }

  return attendanceStreakData;
}

export function TeamAttendanceStreak({ team, allEvents }: { team: Team, allEvents: Event[] }) {
  const [attendanceStreakData, setAttendanceStreakData] = useState<AttendanceStreakData>()
  const [disabled, setDisabled] = useState(false)

  async function onClick() {
    try {
      setDisabled(true)
      const data = await getAttendanceStreakData(team, allEvents)
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
        <CardDescription>Streak is ordered from the most recent event (on the left) to the oldest.</CardDescription>
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