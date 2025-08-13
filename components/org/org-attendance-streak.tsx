"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { AttendanceStreak, AttendanceStreakData } from "../attendance/attendance-streak";
import { Organisation } from "@/lib/data/organisation";
import { getOrgAttendanceStreakData } from "@/lib/data/streak";

export function OrgAttendanceStreak({ org }: { org: Organisation }) {
  const [attendanceStreakData, setAttendanceStreakData] = useState<AttendanceStreakData>()
  const [disabled, setDisabled] = useState(false)

  async function onClick() {
    try {
      setDisabled(true)
      const data = await getOrgAttendanceStreakData(org)
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