"use client"

import { useState } from "react";
import { AttendanceStreak, AttendanceStreakData } from "./attendance-streak";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export function StreakToggle({ data }: { data: AttendanceStreakData }) {
  const [isStreakVisible, setIsStreakVisible] = useState(false);

  const toggleStreakVisibility = () => {
    setIsStreakVisible(!isStreakVisible);
  };

  if (!isStreakVisible) {
    return (
      <Button onClick={toggleStreakVisibility} variant="secondary" className="font-medium">
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
          <AttendanceStreak data={data} />
        </div>
        <div className="px-6"></div>
      </CardContent>
    </Card>
  );
}